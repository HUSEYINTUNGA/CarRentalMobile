# TUNGAuto Mobil Proje

## Genel Bakış

TUNGAuto, araç kiralama ve yönetimi için geliştirilen modern bir mobil uygulamadır. Kullanıcılar araçları inceleyebilir, kiralama talepleri oluşturabilir, ödeme yöntemlerini yönetebilir ve profil bilgilerini güncelleyebilir. Admin kullanıcılar ise araç ekleme/düzenleme, kullanıcı yönetimi ve istatistik görüntüleme gibi gelişmiş yetkilere sahiptir.

Uygulama, ASP.NET ile geliştirilmiş bir RESTful Web API üzerinden veri alışverişi yapmaktadır. API hakkında detaylı bilgiye [buradan](https://github.com/HUSEYINTUNGA/APIOfCarRentalProject) ulaşabilirsiniz.

---

## İçerik

- [Klasör Yapısı](#klasör-yapısı)
- [api Klasörü Detayları](#api-klasörü-detayları)
- [Özellikler](#özellikler)
- [Kurulum ve Çalıştırma](#kurulum-ve-çalıştırma)
- [Kullanım Senaryoları](#kullanım-senaryoları)
- [Teknolojiler](#teknolojiler)
- [API Entegrasyonu](#api-entegrasyonu)
- [Katkı Sağlama](#katkı-sağlama)
- [Lisans](#lisans)

---

## Klasör Yapısı

```
MobileProje/
│
├── App.js                # Uygulamanın ana giriş noktası
├── api/                  # API istekleri ve sunucu ile iletişim dosyaları
├── assets/               # Görseller ve ikonlar
├── components/           # Tekrar kullanılabilir özel bileşenler
├── enums/                # Enum tanımları
├── hooks/                # Özel React hook'ları
├── screens/              # Tüm ekranlar (Signin, Signup, Profile, vb.)
├── theme/                # Tema ve stil dosyaları
├── package.json          # Proje bağımlılıkları ve scriptler
└── app.json              # Expo yapılandırma dosyası
```

---

## api Klasörü Detayları

`api` klasörü, uygulamanın backend ile iletişimini sağlayan fonksiyonları içerir:

- **config.js**: API taban adresi ve temel yapılandırma ayarlarını içerir. Backend ile bağlantı kurulacak URL burada tanımlanır.
- **auth.js**: Kullanıcı kimlik doğrulama işlemleri (giriş, kayıt, token yenileme vb.) için API isteklerini içerir.
- **vehicles.js**: Araçların listelenmesi, detaylarının alınması, eklenmesi, düzenlenmesi ve silinmesi gibi işlemler için API fonksiyonlarını içerir.
- **rentals.js**: Kiralama işlemleriyle ilgili API çağrılarını (kiralama talebi oluşturma, geçmişi görüntüleme vb.) yönetir.
- **payments.js**: Ödeme yöntemleri ekleme, düzenleme, silme ve ödeme işlemleri için API fonksiyonlarını içerir.
- **users.js**: Kullanıcı bilgilerini alma, güncelleme ve admin işlemleri için API çağrılarını içerir.

Her dosya, ilgili işlemler için ayrı ayrı fonksiyonlar ve axios ile HTTP istekleri tanımlar.

---

## Özellikler

- **Kullanıcı Yönetimi:** Kayıt, giriş, e-posta doğrulama, profil ve şifre güncelleme
- **Araç Yönetimi:** Araçları listeleme, detaylarını görüntüleme, 3D ve AR model desteği
- **Kiralama İşlemleri:** Kiralama talebi oluşturma, kiralama geçmişini görüntüleme
- **Ödeme Yönetimi:** Kredi kartı ekleme, düzenleme ve silme
- **Admin Paneli:** Araç ekleme/düzenleme/silme, kullanıcı yönetimi, dashboard istatistikleri
- **Bildirimler:** Kiralama ve ödeme işlemleri için bildirim desteği
- **Tema Desteği:** Koyu ve açık tema seçenekleri

---

## Kurulum ve Çalıştırma

### Gereksinimler

- Node.js (>=14)
- npm veya yarn
- Expo CLI (`npm install -g expo-cli`)
- Android/iOS cihaz veya emülatör

### Adımlar

1. **Projeyi Klonla**
   ```sh
   git clone https://github.com/HUSEYINTUNGA/MobileProje.git
   cd MobileProje
   ```

2. **Bağımlılıkları Yükle**
   ```sh
   npm install
   # veya
   yarn install
   ```

3. **Expo ile Başlat**
   ```sh
   expo start
   ```
   - QR kodu ile gerçek cihazda veya emülatörde çalıştırabilirsin.
   - Geliştirme için Expo Go uygulaması önerilir.

4. **API Sunucusunu Başlat**
   - Backend API'yi kurmak için [APIOfCarRentalProject](https://github.com/HUSEYINTUNGA/APIOfCarRentalProject) reposundaki adımları takip et.
   - API endpoint adresini `api/config.js` dosyasında güncelle.

5. **Ortam Değişkenleri**
   - Gerekli ise `.env` dosyası oluşturup API anahtarlarını ve özel ayarları ekleyebilirsin.

---

## Kullanım Senaryoları

- **Kullanıcı olarak:**
  - Kayıt ol, e-posta doğrulaması ile hesabını aktif et.
  - Araçları listele, detaylarını incele ve kiralama talebi oluştur.
  - Profilini ve ödeme yöntemlerini yönet.
  - Kiralama geçmişini görüntüle.

- **Admin olarak:**
  - Yeni araç ekle, mevcut araçları düzenle veya sil.
  - Kullanıcıları yönet, istatistikleri ve dashboard'u görüntüle.

---

## Teknolojiler

- **Frontend:** React Native, Expo
- **Backend:** ASP.NET RESTful Web API ([repo](https://github.com/HUSEYINTUNGA/APIOfCarRentalProject))
- **Veritabanı:** SQL Server (API tarafında)
- **Diğer:** Axios, React Navigation, Context API, Custom Hooks

---

## API Entegrasyonu

Uygulama, ASP.NET ile geliştirilmiş RESTful Web API ile haberleşmektedir. Tüm veri işlemleri (kullanıcı, araç, kiralama, ödeme vb.) API üzerinden yapılır.

- API endpointleri `api/config.js` dosyasında tanımlanmıştır.
- API'nin detaylı dökümantasyonu ve kurulum adımları için [APIOfCarRentalProject](https://github.com/HUSEYINTUNGA/APIOfCarRentalProject) reposunun README dosyasını inceleyebilirsiniz.

---

## Katkı Sağlama

1. Forkla ve yeni bir branch oluştur.
2. Değişikliklerini yap, test et.
3. Pull request gönder.

---

## Lisans

Bu proje MIT lisansı ile lisanslanmıştır.
