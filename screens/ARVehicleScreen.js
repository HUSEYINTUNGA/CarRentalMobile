import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  PanResponder,
  Animated
} from 'react-native';
import { Camera } from 'expo-camera';
import { Gyroscope, Accelerometer } from 'expo-sensors';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Linking } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ARVehicleScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { vehicle, arModelData } = route.params || {};
  const { colors, isDark } = useTheme();
  
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [gyroscopeData, setGyroscopeData] = useState({ x: 0, y: 0, z: 0 });
  const [accelerometerData, setAccelerometerData] = useState({ x: 0, y: 0, z: 0 });
  const [isARMode, setIsARMode] = useState(false);
  const [modelScale, setModelScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelRotation, setModelRotation] = useState({ x: 0, y: 0 });
  const [modelPosition, setModelPosition] = useState({ x: 0, y: 0, z: -3 });
  const [arPlaneDetected, setArPlaneDetected] = useState(false);
  const [arInstructions, setArInstructions] = useState('Telefonu hareket ettirerek modeli inceleyin');

  const cameraRef = useRef(null);
  const gyroscopeSubscription = useRef(null);
  const accelerometerSubscription = useRef(null);
  const glViewRef = useRef(null);
  const threeSceneRef = useRef(null);
  const threeCameraRef = useRef(null);
  const threeRendererRef = useRef(null);
  const threeModelRef = useRef(null);
  const animationFrameId = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status !== 'granted') {
        Alert.alert(
          'Kamera İzni Gerekli',
          'AR özelliği için kamera izni gereklidir.',
          [{ text: 'Tamam', onPress: () => navigation.goBack() }]
        );
      }
    })();
  }, []);

  useEffect(() => {
    if (isARMode) {
      gyroscopeSubscription.current = Gyroscope.addListener((data) => {
        setGyroscopeData(data);
        if (threeModelRef.current) {
          setModelRotation(prev => ({
            x: prev.x + data.y * 0.01,
            y: prev.y + data.x * 0.01
          }));
        }
      });
      accelerometerSubscription.current = Accelerometer.addListener((data) => {
        setAccelerometerData(data);
        if (threeModelRef.current) {
          setModelPosition(prev => ({
            x: prev.x + data.x * 0.1,
            y: prev.y + data.y * 0.1,
            z: prev.z + data.z * 0.1
          }));
        }
      });
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      if (gyroscopeSubscription.current) {
        gyroscopeSubscription.current.remove();
      }
      if (accelerometerSubscription.current) {
        accelerometerSubscription.current.remove();
      }
    };
  }, [isARMode]);

  const adjustModelScale = (direction) => {
    const scaleFactor = 0.1;
    if (direction === 'increase') {
      setModelScale(prev => Math.min(prev + scaleFactor, 3.0));
    } else {
      setModelScale(prev => Math.max(prev - scaleFactor, 0.1));
    }
  };

  const handleGLViewTouch = (event) => {
    if (!isARMode) return;
    const { locationX, locationY } = event.nativeEvent;
    const x = (locationX / screenWidth) * 2 - 1;
    const y = -((locationY / (screenHeight * 0.7)) * 2 - 1);
    if (threeCameraRef.current) {
      const camera = threeCameraRef.current;
      const vector = new THREE.Vector3(x, y, 0.5).unproject(camera);
      const dir = vector.sub(camera.position).normalize();
      const distance = 2;
      const newPos = camera.position.clone().add(dir.multiplyScalar(distance));
      setModelPosition({ x: newPos.x, y: newPos.y, z: newPos.z });
      setArInstructions('Telefonu hareket ettirerek modeli inceleyin');
    }
  };

  const startARMode = () => {
    setIsARMode(true);
    setArPlaneDetected(false);
    setArInstructions('Modeli yerleştirmek için ekrana dokunun');
  };

  const toggleCameraType = () => {
    setCameraType(current => 
      current === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };

  const detectARPlane = () => {
    setArPlaneDetected(true);
    setArInstructions('Telefonu hareket ettirerek modeli inceleyin'); 
  };

  const onContextCreate = async (gl) => {
    setLoading(true);
    setError(null);
    setModelLoaded(false);
    try {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);
      
      const camera = new THREE.PerspectiveCamera(75, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 1000);
      camera.position.set(0, 1, 5);
      threeSceneRef.current = scene;
      threeCameraRef.current = camera;
      
      const renderer = new Renderer({ gl });
      renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
      renderer.setClearColor(0x000000, 0);
      threeRendererRef.current = renderer;

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(5, 10, 7.5);
      scene.add(directionalLight);
      
      const pointLight = new THREE.PointLight(0xffffff, 0.5);
      pointLight.position.set(-5, 5, 5);
      scene.add(pointLight);

      const planeGeometry = new THREE.PlaneGeometry(10, 10);
      const planeMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ff00, 
        transparent: true, 
        opacity: 0.3,
        side: THREE.DoubleSide 
      });
      const plane = new THREE.Mesh(planeGeometry, planeMaterial);
      plane.rotation.x = -Math.PI / 2;
      plane.position.y = -2;
      scene.add(plane);

      const loadOBJModel = async () => {
        try {
          const objUrl = arModelData.GitHubModelUrl;
          const mtlUrl = objUrl.replace('.obj', '.mtl');
          
          const mtlLoader = new MTLLoader();
          mtlLoader.setPath('');
          
          const materials = await new Promise((resolve, reject) => {
            mtlLoader.load(
              mtlUrl,
              (materials) => {
                materials.preload();
                resolve(materials);
              },
              (progress) => {
              },
              (error) => {
                resolve(null);
              }
            );
          });
          
          const objLoader = new OBJLoader();
          if (materials) {
            objLoader.setMaterials(materials);
          }
          
          const model = await new Promise((resolve, reject) => {
            objLoader.load(
              objUrl,
              (object) => {
                resolve(object);
              },
              (progress) => {
              },
              (error) => {
                reject(error);
              }
            );
          });
          
          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              if (child.material) {
                if (Array.isArray(child.material)) {
                  child.material.forEach(mat => {
                    if (mat.type !== 'MeshBasicMaterial' && mat.type !== 'MeshLambertMaterial') {
                      const newMaterial = new THREE.MeshLambertMaterial({
                        color: mat.color || new THREE.Color(0x888888),
                        transparent: mat.transparent,
                        opacity: mat.opacity,
                        side: mat.side
                      });
                      child.material = newMaterial;
                    }
                  });
                } else {
                  if (child.material.type !== 'MeshBasicMaterial' && child.material.type !== 'MeshLambertMaterial') {
                    const newMaterial = new THREE.MeshLambertMaterial({
                      color: child.material.color || new THREE.Color(0x888888),
                      transparent: child.material.transparent,
                      opacity: child.material.opacity,
                      side: child.material.side
                    });
                    child.material = newMaterial;
                  }
                }
              }
            }
          });
          
          const modelBox = new THREE.Box3().setFromObject(model);
          const modelSize = modelBox.getSize(new THREE.Vector3());
          
          const scaleX = (arModelData.Width / 100) / modelSize.x;
          const scaleY = (arModelData.Height / 100) / modelSize.y;
          const scaleZ = (arModelData.Length / 100) / modelSize.z;
          
          const minScale = Math.min(scaleX, scaleY, scaleZ);
          const finalScale = minScale * modelScale;
          
          model.scale.setScalar(finalScale);
          model.position.set(0, 0, 0);
          model.rotation.set(modelRotation.x, modelRotation.y, 0);
          
          const adjustedModelBox = new THREE.Box3().setFromObject(model);
          const modelHeight = adjustedModelBox.getSize(new THREE.Vector3()).y;
          model.position.y = modelHeight / 2;
          
          scene.add(model);
          threeModelRef.current = model;
          setModelLoaded(true);
          setLoading(false);
          
        } catch (error) {
          const createSimpleCarModel = () => {
            const bodyGeometry = new THREE.BoxGeometry(2, 0.8, 4);
            const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x2196F3 });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 0.4;
            
            const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 8);
            const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
            
            const frontLeftWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            frontLeftWheel.position.set(-0.8, 0.3, 1.2);
            frontLeftWheel.rotation.z = Math.PI / 2;
            
            const frontRightWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            frontRightWheel.position.set(0.8, 0.3, 1.2);
            frontRightWheel.rotation.z = Math.PI / 2;
            
            const backLeftWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            backLeftWheel.position.set(-0.8, 0.3, -1.2);
            backLeftWheel.rotation.z = Math.PI / 2;
            
            const backRightWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            backRightWheel.position.set(0.8, 0.3, -1.2);
            backRightWheel.rotation.z = Math.PI / 2;
            
            const windowGeometry = new THREE.BoxGeometry(1.8, 0.6, 2);
            const windowMaterial = new THREE.MeshLambertMaterial({ 
              color: 0x87CEEB, 
              transparent: true, 
              opacity: 0.7 
            });
            const windows = new THREE.Mesh(windowGeometry, windowMaterial);
            windows.position.set(0, 1.2, 0);
            
            const carModel = new THREE.Group();
            carModel.add(body);
            carModel.add(frontLeftWheel);
            carModel.add(frontRightWheel);
            carModel.add(backLeftWheel);
            carModel.add(backRightWheel);
            carModel.add(windows);
            
            return carModel;
          };
          
          const simpleModel = createSimpleCarModel();
          simpleModel.scale.setScalar(modelScale);
          simpleModel.position.set(0, 0, 0);
          simpleModel.rotation.set(modelRotation.x, modelRotation.y, 0);
          
          scene.add(simpleModel);
          threeModelRef.current = simpleModel;
          setModelLoaded(true);
          setLoading(false);
          
        }
      };
      
      loadOBJModel();

      const render = () => {
        if (threeModelRef.current) {
          threeModelRef.current.position.set(0, 0, 0);
          threeModelRef.current.rotation.set(modelRotation.x, modelRotation.y, 0);
          if (arModelData) {
            const modelBox = new THREE.Box3().setFromObject(threeModelRef.current);
            const modelSize = modelBox.getSize(new THREE.Vector3());
            const scaleX = (arModelData.Width / 100) / modelSize.x;
            const scaleY = (arModelData.Height / 100) / modelSize.y;
            const scaleZ = (arModelData.Length / 100) / modelSize.z;
            const minScale = Math.min(scaleX, scaleY, scaleZ);
            const finalScale = minScale * modelScale;
            threeModelRef.current.scale.setScalar(finalScale);
          }
          if (isARMode) {
            camera.position.x += (gyroscopeData.y * 2 - camera.position.x) * 0.05;
            camera.position.y += (-gyroscopeData.x * 2 - camera.position.y) * 0.05;
            camera.lookAt(threeModelRef.current.position);
          }
        }
        
        renderer.render(scene, camera);
        gl.endFrameEXP();
        animationFrameId.current = requestAnimationFrame(render);
      };
      render();
    } catch (err) {
      setError('3D model render hatası: ' + err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  if (hasPermission === null) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}> 
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}> 
        <Text style={[styles.errorText, { color: colors.error }]}> 
          Kamera erişimi reddedildi
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { backgroundColor: colors.card }]}> 
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>AR Araç Görüntüleme</Text>
        <TouchableOpacity
          style={styles.cameraToggleButton}
          onPress={toggleCameraType}
        >
          <Icon name="camera-switch" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      <View style={styles.cameraContainer}> 
        <Camera
          ref={cameraRef}
          style={styles.camera}
          type={cameraType}
          ratio="16:9"
        >
          {isARMode && arModelData && (
            <Animated.View 
              style={[
                styles.arOverlay, 
                { opacity: fadeAnim }
              ]}
            >
              <GLView
                style={styles.glView}
                onContextCreate={onContextCreate}
                ref={glViewRef}
                onStartShouldSetResponder={() => true}
                onResponderRelease={handleGLViewTouch}
              />
              {!arPlaneDetected && (
                <View style={styles.arInstructionsContainer}>
                  <Text style={[styles.arInstructionsText, { color: colors.white }]}> 
                    {arInstructions}
                  </Text>
                </View>
              )}
              {loading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={{ color: colors.text, marginTop: 8 }}>3D model yükleniyor...</Text>
                </View>
              )}
              {error && (
                <View style={styles.loadingOverlay}>
                  <Icon name="alert-circle" size={40} color={colors.error} />
                  <Text style={{ color: colors.error, marginTop: 8 }}>{error}</Text>
                </View>
              )}
            </Animated.View>
          )}
        </Camera>
        {isARMode && (
          <View style={[styles.arControls, { backgroundColor: colors.card }]}> 
            <View style={styles.controlGroup}>
              <Text style={[styles.controlLabel, { color: colors.text }]}>Ölçek</Text>
              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: colors.primary }]}
                onPress={() => adjustModelScale('decrease')}
              >
                <Icon name="minus" size={20} color={colors.white} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: colors.primary }]}
                onPress={() => adjustModelScale('increase')}
              >
                <Icon name="plus" size={20} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
      <View style={[styles.bottomControls, { backgroundColor: colors.card }]}> 
        {!isARMode ? (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.arStartButton, { backgroundColor: colors.primary }]}
              onPress={startARMode}
            >
              <Icon name="cube-outline" size={24} color={colors.white} style={{ marginRight: 12 }} />
              <Text style={[styles.arStartText, { color: colors.white }]}>AR Modunu Başlat</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.arInfo}>
            <Text style={[styles.arInfoText, { color: colors.text }]}>Araç: {vehicle?.Brand} {vehicle?.Model}</Text>
            <Text style={[styles.arInfoText, { color: colors.textSecondary }]}>Boyutlar: {arModelData?.Length}cm x {arModelData?.Width}cm x {arModelData?.Height}cm</Text>
            <Text style={[styles.arInfoText, { color: colors.textSecondary }]}>Ölçek: {modelScale.toFixed(1)}x</Text>
            <Text style={[styles.arInfoText, { color: colors.textSecondary, fontSize: 12, fontStyle: 'italic' }]}>📱 Telefonu hareket ettirerek modeli inceleyin</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  cameraToggleButton: { padding: 8 },
  cameraContainer: { flex: 1, position: 'relative' },
  camera: { flex: 1 },
  arOverlay: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  glView: { 
    width: screenWidth, 
    height: screenHeight * 0.7, 
    backgroundColor: 'transparent'
  },
  loadingOverlay: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    borderRadius: 20 
  },
  arControls: { 
    position: 'absolute', 
    right: 16, 
    top: '50%', 
    transform: [{ translateY: -50 }], 
    borderRadius: 12, 
    padding: 12, 
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  controlGroup: { 
    alignItems: 'center', 
    gap: 8 
  },
  controlLabel: { 
    fontSize: 12, 
    fontWeight: 'bold',
    marginBottom: 4
  },
  controlButton: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginHorizontal: 2
  },
  bottomControls: { 
    padding: 16, 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(0,0,0,0.1)' 
  },
  buttonContainer: { gap: 12 },
  arStartButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 16, 
    borderRadius: 12, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 3 
  },
  arStartText: { fontSize: 16, fontWeight: 'bold' },
  arInfo: { gap: 4 },
  arInfoText: { fontSize: 14 },
  errorText: { fontSize: 16, textAlign: 'center', marginTop: 20 },
  arInstructionsContainer: { 
    position: 'absolute', 
    top: 20, 
    left: 20, 
    right: 20, 
    backgroundColor: 'rgba(0,0,0,0.7)', 
    borderRadius: 12, 
    padding: 16,
    alignItems: 'center'
  },
  arInstructionsText: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    textAlign: 'center',
    lineHeight: 22
  },
});

export default ARVehicleScreen; 