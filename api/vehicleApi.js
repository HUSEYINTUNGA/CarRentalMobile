export const getVehicle3DModel = async (brand, model, year, category) => {
  try {
    const normalizedCategory = normalizeCategory(category);
    
    const searchStrategies = generateSearchStrategies(brand, model, year, normalizedCategory);
    
    let allResults = [];
    let searchStats = {
      totalSearches: 0,
      successfulSearches: 0,
      totalResults: 0,
      strategies: []
    };

    for (const strategy of searchStrategies) {
      searchStats.totalSearches++;
      
      try {
        const response = await fetch(
          `https://api.sketchfab.com/v3/search?q=${encodeURIComponent(strategy.query)}&type=models&count=5&sort_by=relevance`,
          {
            headers: {
              'Authorization': 'Token 9cbcf67a9579411b8dbe0ad660ca3f07'
            }
          }
        );

        if (!response.ok) {
          searchStats.strategies.push({
            query: strategy.query,
            success: false,
            error: 'API Error',
            results: 0
          });
          continue;
        }

        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
          searchStats.successfulSearches++;
          searchStats.totalResults += data.results.length;
          
          const processedResults = data.results.map(result => ({
            ...result,
            searchStrategy: strategy.query,
            strategyType: strategy.type
          }));
          
          allResults.push(...processedResults);
          
          searchStats.strategies.push({
            query: strategy.query,
            success: true,
            results: data.results.length
          });
        } else {
          searchStats.strategies.push({
            query: strategy.query,
            success: true,
            results: 0
          });
        }
      } catch (error) {
        console.log(`Strateji başarısız: ${strategy.query}`, error.message);
        searchStats.strategies.push({
          query: strategy.query,
          success: false,
          error: error.message,
          results: 0
        });
        continue;
      }
    }

    const processedResults = processResults(allResults, searchStats);

    return processedResults;
  } catch (error) {
    console.error('3D model arama hatası:', error);
    return null;
  }
};

const generateSearchStrategies = (brand, model, year, category) => {
  const strategies = [];
  const modelParts = model.replace('-', ' ').split(' ').filter(p => p.length > 1);
  
  // Strateji 1: Tam Marka + Model
  strategies.push({
    query: `${brand} ${model}`,
    type: 'exact_brand_model',
    priority: 10
  });

  // Strateji 2: Marka + Model (tire olmadan)
  if (model.includes('-')) {
    strategies.push({ query: `${brand} ${model.replace('-', ' ')}`, type: 'brand_model_no_hyphen', priority: 9 });
    strategies.push({ query: `${brand} ${model.replace('-', '')}`, type: 'brand_model_no_hyphen_no_space', priority: 9 });
  }

  // Strateji 3: Marka + Model'in ana parçası (örn: C-Elysee -> Elysee)
  if (modelParts.length > 1) {
    const mainModelPart = modelParts.sort((a, b) => b.length - a.length)[0];
    strategies.push({ query: `${brand} ${mainModelPart}`, type: 'brand_main_model_part', priority: 8 });
  }

  // Strateji 4: Yıl ile birlikte aramalar
  strategies.push({ query: `${brand} ${model} ${year}`, type: 'brand_model_year', priority: 7 });
  strategies.push({ query: `${year} ${brand} ${model}`, type: 'year_brand_model', priority: 7 });

  // Strateji 5: Sadece marka ve kategori (daha genel)
  if (category) {
      const normalizedCategory = normalizeCategory(category);
      if (normalizedCategory) {
        strategies.push({ query: `${brand} ${normalizedCategory}`, type: 'brand_category', priority: 5 });
      }
  }

  // Strateji 6: Sadece marka
  strategies.push({ query: `${brand}`, type: 'brand_only', priority: 2 });
  
  return [...new Map(strategies.map(item => [item.query, item])).values()]
         .sort((a, b) => b.priority - a.priority);
};

const normalizeCategory = (category) => {
  if (!category) return '';
  
  const categoryMap = {
    'SUV': 'suv',
    'Sedan': 'sedan',
    'Coupe': 'coupe',
    'Hatchback': 'hatchback',
    'Station Wagon': 'wagon',
    'Convertible': 'convertible',
    'Pickup': 'pickup',
    'Van': 'van',
    'Minivan': 'minivan',
    'Sports Car': 'sports',
    'Luxury': 'luxury',
    'Compact': 'compact',
    'Mid-size': 'midsize',
    'Full-size': 'fullsize',
    'Electric': 'electric',
    'Hybrid': 'hybrid'
  };
  
  return categoryMap[category] || category.toLowerCase();
};

const processResults = (allResults, searchStats) => {
  const uniqueResults = removeDuplicates(allResults);
  
  uniqueResults.sort((a, b) => {
    const aQuality = (a.downloadCount || 0) + (a.viewCount || 0);
    const bQuality = (b.downloadCount || 0) + (b.viewCount || 0);
    return bQuality - aQuality;
  });

  const topResults = uniqueResults
    .slice(0, 5)
    .map(result => ({
      modelUrl: result.viewerUrl,
      thumbnailUrl: result.thumbnails?.images?.[0]?.url || result.thumbnails?.images?.[1]?.url,
      title: result.name,
      author: result.user?.displayName || 'Unknown',
      downloadUrl: result.downloadUrl,
      searchStrategy: result.searchStrategy,
      strategyType: result.strategyType,
      downloadCount: result.downloadCount,
      viewCount: result.viewCount
    }));

  return topResults.length > 0 ? {
    models: topResults,
    searchStats: searchStats,
    totalFound: topResults.length
  } : null;
};

const removeDuplicates = (results) => {
  const seen = new Set();
  return results.filter(result => {
    const key = result.uid || result.viewerUrl;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}; 