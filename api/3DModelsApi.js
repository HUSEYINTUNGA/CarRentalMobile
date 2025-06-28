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
          `https://api.sketchfab.com/v3/search?q=${encodeURIComponent(strategy.query)}&type=models&count=20&sort_by=likeCount`,
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
        searchStats.strategies.push({
          query: strategy.query,
          success: false,
          error: error.message,
          results: 0
        });
        continue;
      }
    }

    const processedResults = processResults(allResults, searchStats, brand, model, year, category);

    return processedResults;
  } catch (error) {
    return null;
  }
};

const generateSearchStrategies = (brand, model, year, category) => {
  const strategies = [];
  const modelParts = model.replace('-', ' ').split(' ').filter(p => p.length > 1);
  
  if (category) {
    strategies.push({
      query: `${brand} ${model} ${category}`,
      type: 'brand_model_category',
      priority: 12
    });
  }

  strategies.push({
    query: `${brand} ${model}`,
    type: 'exact_brand_model',
    priority: 11
  });

  const modelCodes = generateModelCodes(brand, model);
  modelCodes.forEach(code => {
    strategies.push({
      query: `${brand} ${model} ${code}`,
      type: 'brand_model_code',
      priority: 10
    });
  });

  if (model.includes('-')) {
    strategies.push({ 
      query: `${brand} ${model.replace('-', ' ')}`, 
      type: 'brand_model_no_hyphen', 
      priority: 9 
    });
    strategies.push({ 
      query: `${brand} ${model.replace('-', '')}`, 
      type: 'brand_model_no_hyphen_no_space', 
      priority: 9 
    });
  }

  if (modelParts.length > 1) {
    const mainModelPart = modelParts.sort((a, b) => b.length - a.length)[0];
    strategies.push({ 
      query: `${brand} ${mainModelPart}`, 
      type: 'brand_main_model_part', 
      priority: 8 
    });
  }

  const categorySynonyms = getCategorySynonyms(category);
  categorySynonyms.forEach(synonym => {
    strategies.push({
      query: `${brand} ${model} ${synonym}`,
      type: 'brand_model_category_synonym',
      priority: 7
    });
  });

  if (category) {
    strategies.push({ 
      query: `${brand} ${category}`, 
      type: 'brand_category', 
      priority: 6 
    });
  }

  if (year) {
    strategies.push({
      query: `${brand} ${model} ${year}`,
      type: 'brand_model_year',
      priority: 5
    });
    strategies.push({
      query: `${year} ${brand} ${model}`,
      type: 'year_brand_model',
      priority: 5
    });
  }

  strategies.push({ 
    query: `${brand}`, 
    type: 'brand_only', 
    priority: 2 
  });
  
  return [...new Map(strategies.map(item => [item.query, item])).values()]
         .sort((a, b) => b.priority - a.priority);
};

const generateModelCodes = (brand, model) => {
  const codes = [];

  const commonCodes = {
    'Toyota': {
      'Corolla': ['E210', 'E170', 'E160', 'E150', 'E140', 'E120', 'E110', 'E100'],
      'Camry': ['XV70', 'XV50', 'XV40', 'XV30', 'XV20', 'XV10'],
      'RAV4': ['XA50', 'XA40', 'XA30', 'XA20'],
      'Highlander': ['XU70', 'XU60', 'XU50', 'XU40'],
      'Prius': ['XW60', 'XW50', 'XW40', 'XW30', 'XW20', 'XW10']
    },
    'Honda': {
      'Civic': ['11th', '10th', '9th', '8th', '7th', '6th', '5th'],
      'Accord': ['11th', '10th', '9th', '8th', '7th', '6th', '5th'],
      'CR-V': ['5th', '4th', '3rd', '2nd', '1st'],
      'Pilot': ['3rd', '2nd', '1st']
    },
    'BMW': {
      '3 Series': ['G20', 'F30', 'E90', 'E46', 'E36', 'E30'],
      '5 Series': ['G30', 'F10', 'E60', 'E39', 'E34', 'E28'],
      'X3': ['G01', 'F25', 'E83'],
      'X5': ['G05', 'F15', 'E70', 'E53']
    },
    'Mercedes': {
      'C-Class': ['W206', 'W205', 'W204', 'W203', 'W202', 'W201'],
      'E-Class': ['W213', 'W212', 'W211', 'W210', 'W124', 'W123'],
      'S-Class': ['W223', 'W222', 'W221', 'W220', 'W140', 'W126'],
      'GLC': ['X254', 'C253', 'X253']
    },
    'Audi': {
      'A3': ['8Y', '8V', '8P', '8L'],
      'A4': ['B9', 'B8', 'B7', 'B6', 'B5'],
      'A6': ['C8', 'C7', 'C6', 'C5', 'C4'],
      'Q5': ['FY', '8R', '8T']
    }
  };
  
  if (commonCodes[brand] && commonCodes[brand][model]) {
    codes.push(...commonCodes[brand][model]);
  }
  
  return codes;
};

const getCategorySynonyms = (category) => {
  if (!category) return [];
  
  const synonyms = {
    'SUV': ['suv', 'crossover', '4x4', 'offroad'],
    'Sedan': ['sedan', 'saloon', '4-door'],
    'Coupe': ['coupe', '2-door', 'sports'],
    'Hatchback': ['hatchback', '5-door', 'compact'],
    'Station Wagon': ['wagon', 'estate', 'station wagon', 'break'],
    'Convertible': ['convertible', 'cabriolet', 'roadster'],
    'Pickup': ['pickup', 'truck', 'pick-up'],
    'Van': ['van', 'minibus', 'commercial'],
    'Minivan': ['minivan', 'mpv', 'people carrier', 'multi-purpose'],
    'Sports Car': ['sports', 'sportscar', 'supercar', 'hypercar'],
    'Luxury': ['luxury', 'premium', 'executive'],
    'Compact': ['compact', 'small', 'subcompact'],
    'Mid-size': ['midsize', 'mid-size', 'medium'],
    'Full-size': ['fullsize', 'full-size', 'large'],
    'Electric': ['electric', 'ev', 'battery'],
    'Hybrid': ['hybrid', 'hev', 'plug-in']
  };
  
  return synonyms[category] || [];
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

function calculateMatchScore(result, brand, model, year, category) {
  let score = 0;
  const title = (result.name || '').toLowerCase();
  const brandLc = (brand || '').toLowerCase();
  const modelLc = (model || '').toLowerCase();
  const yearStr = year ? String(year) : '';
  const categoryLc = (category || '').toLowerCase();

  if (title.includes(brandLc)) score += 2;
  if (title.includes(modelLc)) score += 3;
  if (yearStr && title.includes(yearStr)) score += 2;
  if (categoryLc && title.includes(categoryLc)) score += 2;
  
  modelLc.split(/[- ]/).forEach(part => {
    if (part.length > 1 && title.includes(part)) score += 1;
  });
  
  const brandModelPatterns = [
    `${brandLc} ${modelLc}`,
    `${brandLc}${modelLc}`,
    `${modelLc} ${brandLc}`,
    `${modelLc}${brandLc}`
  ];
  
  let hasBrandModelTogether = false;
  for (const pattern of brandModelPatterns) {
    if (title.includes(pattern)) {
      score += 1;
      hasBrandModelTogether = true;
      break;
    }
  }

  let hasCorrectFormat = false;
  
  if (yearStr) {
    const format1 = `${brandLc} ${modelLc} ${yearStr}`;
    const format2 = `${brandLc}${modelLc} ${yearStr}`;
    const format3 = `${brandLc} ${modelLc}${yearStr}`;
    
    if (title.includes(format1) || title.includes(format2) || title.includes(format3)) {
      score += 1;
      hasCorrectFormat = true;
    }
  }
  
  if (categoryLc && yearStr) {
    const format4 = `${brandLc} ${modelLc} ${categoryLc} ${yearStr}`;
    const format5 = `${brandLc} ${modelLc} ${yearStr} ${categoryLc}`;
    const format6 = `${brandLc}${modelLc} ${categoryLc} ${yearStr}`;
    const format7 = `${brandLc}${modelLc} ${yearStr} ${categoryLc}`;
    
    if (title.includes(format4) || title.includes(format5) || 
        title.includes(format6) || title.includes(format7)) {
      score += 1;
      hasCorrectFormat = true;
    }
  }

  if (!hasBrandModelTogether || !hasCorrectFormat) {
    score = Math.min(score, 8);
  }

  return score;
}

const processResults = (allResults, searchStats, brand, model, year, category) => {
  const uniqueResults = removeDuplicates(allResults);
  const resultsWithScore = uniqueResults.map(result => ({
    ...result,
    matchScore: calculateMatchScore(result, brand, model, year, category)
  }));

  resultsWithScore.sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    const aQuality = (a.downloadCount || 0) + (a.viewCount || 0);
    const bQuality = (b.downloadCount || 0) + (b.viewCount || 0);
    return bQuality - aQuality;
  });
  
  const topResults = resultsWithScore
    .slice(0, 10)
    .map(result => ({
      modelUrl: result.viewerUrl,
      thumbnailUrl: result.thumbnails?.images?.[0]?.url || result.thumbnails?.images?.[1]?.url,
      title: result.name,
      author: result.user?.displayName || 'Unknown',
      downloadUrl: result.downloadUrl,
      searchStrategy: result.searchStrategy,
      strategyType: result.strategyType,
      downloadCount: result.downloadCount,
      viewCount: result.viewCount,
      matchScore: result.matchScore
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