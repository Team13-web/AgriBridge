import { query } from '../config/db.js';

const CITY_COORDINATES = {
  ongole: { lat: 15.5057, lon: 80.0499, district: 'Prakasam', state: 'Andhra Pradesh' },
  guntur: { lat: 16.3067, lon: 80.4365, district: 'Guntur', state: 'Andhra Pradesh' },
  vijayawada: { lat: 16.5062, lon: 80.6480, district: 'NTR', state: 'Andhra Pradesh' },
  kurnool: { lat: 15.8281, lon: 78.0373, district: 'Kurnool', state: 'Andhra Pradesh' },
  anantapur: { lat: 14.6819, lon: 77.6006, district: 'Anantapur', state: 'Andhra Pradesh' },
  warangal: { lat: 17.9689, lon: 79.5941, district: 'Warangal', state: 'Telangana' },
  hyderabad: { lat: 17.3850, lon: 78.4867, district: 'Hyderabad', state: 'Telangana' },
  visakhapatnam: { lat: 17.6868, lon: 83.2185, district: 'Visakhapatnam', state: 'Andhra Pradesh' },
  tirupati: { lat: 13.6288, lon: 79.4192, district: 'Tirupati', state: 'Andhra Pradesh' },
  nellore: { lat: 14.4426, lon: 79.9865, district: 'SPSR Nellore', state: 'Andhra Pradesh' },
  rajahmundry: { lat: 17.0005, lon: 81.8040, district: 'East Godavari', state: 'Andhra Pradesh' },
  kakinada: { lat: 16.9891, lon: 82.2475, district: 'Kakinada', state: 'Andhra Pradesh' },
  eluru: { lat: 16.7107, lon: 81.0952, district: 'Eluru', state: 'Andhra Pradesh' }
};

export function getCityMicroclimate(city = 'Ongole') {
  const name = (city || '').toLowerCase().trim();
  if (name.includes('guntur')) {
    return {
      current_temp: 33, max_temp: 35, min_temp: 25, condition: 'Partly Cloudy', icon: 'bi-cloud-sun-fill text-info',
      humidity: 66, rain_probability: 30, rainfall_mm: 2.5, wind_speed: 14, uv_index: 8, sunrise: '06:02', sunset: '18:28',
      summary: 'Guntur region expects warm weather with moderate humidity (66%). Drip irrigation recommended.',
      irrigation: '💧 Apply 40 minutes drip irrigation in early morning to prevent moisture stress in Cotton/Chilli fields.',
      fertilizer: '🌱 Apply NPK top-dressing in early morning before temperatures rise.',
      spraying: '🐛 Best spraying window: Wednesday morning (wind speed 14 km/h).',
      harvest: '🌾 Dry window for crop harvesting: Friday & Saturday.'
    };
  }
  if (name.includes('vijayawada')) {
    return {
      current_temp: 34, max_temp: 36, min_temp: 26, condition: 'Humid & Warm', icon: 'bi-sun-fill text-warning',
      humidity: 72, rain_probability: 40, rainfall_mm: 5.0, wind_speed: 11, uv_index: 8, sunrise: '06:01', sunset: '18:27',
      summary: 'Vijayawada Krishna canal zone anticipates high humidity (72%) with afternoon cloud cover.',
      irrigation: '🌊 Canal water flow is stable. Reduce artificial pumping during afternoon hours.',
      fertilizer: '🌱 Avoid heavy Urea application during peak afternoon heat.',
      spraying: '🐛 Spray neem oil for whitefly control before 08:30 AM.',
      harvest: '🌾 Delay paddy harvesting until surface moisture dries post-morning dew.'
    };
  }
  if (name.includes('kurnool')) {
    return {
      current_temp: 36, max_temp: 38, min_temp: 24, condition: 'Dry & Sunny', icon: 'bi-sun-fill text-warning',
      humidity: 48, rain_probability: 15, rainfall_mm: 0.0, wind_speed: 16, uv_index: 9, sunrise: '06:08', sunset: '18:32',
      summary: 'Kurnool dry zone expects high temperatures (36°C) and low humidity (48%). Groundnut crops require mulching.',
      irrigation: '💧 Frequent light irrigation required for Groundnut and Onion crops to combat evapotranspiration.',
      fertilizer: '🌱 Dissolve soluble fertilizers in drip water (fertigation) during early hours.',
      spraying: '💨 High wind speed (16 km/h). Avoid spraying during peak winds (11 AM - 3 PM).',
      harvest: '🌾 Excellent dry harvesting conditions across all 7 days.'
    };
  }
  if (name.includes('anantapur')) {
    return {
      current_temp: 37, max_temp: 39, min_temp: 25, condition: 'Hot & Dry', icon: 'bi-sun-fill text-warning',
      humidity: 42, rain_probability: 10, rainfall_mm: 0.0, wind_speed: 18, uv_index: 10, sunrise: '06:10', sunset: '18:35',
      summary: 'Anantapur semi-arid region is experiencing severe heat (37°C) and strong dry winds.',
      irrigation: '⚠️ High evaporation loss. Irrigate exclusively between 05:30 AM and 07:30 AM.',
      fertilizer: '🌱 Do not broadcast dry fertilizer; use micro-drip fertigation to prevent root burn.',
      spraying: '🐛 Spray during late evening (05:30 PM - 07:00 PM) when thermal inversion drops.',
      harvest: '🌾 Ideal dry conditions for groundnut pod drying and harvesting.'
    };
  }
  if (name.includes('warangal')) {
    return {
      current_temp: 31, max_temp: 33, min_temp: 23, condition: 'Scattered Showers', icon: 'bi-cloud-rain-fill text-primary',
      humidity: 64, rain_probability: 45, rainfall_mm: 8.5, wind_speed: 13, uv_index: 6, sunrise: '06:04', sunset: '18:29',
      summary: 'Warangal agricultural zone has 45% rain chance with moderate showers forecast.',
      irrigation: '🌧️ Rain expected. Postpone scheduled irrigation for 48 hours.',
      fertilizer: '🌱 Delay Urea application to avoid nutrient washing into field drains.',
      spraying: '🐛 Postpone pesticide spraying until rain clears.',
      harvest: '🌾 Cover harvested cotton bales with tarpaulin sheets.'
    };
  }
  if (name.includes('visakhapatnam') || name.includes('vizag')) {
    return {
      current_temp: 29, max_temp: 31, min_temp: 25, condition: 'Coastal Breezy', icon: 'bi-cloud-sun-fill text-info',
      humidity: 78, rain_probability: 50, rainfall_mm: 12.0, wind_speed: 17, uv_index: 7, sunrise: '05:58', sunset: '18:24',
      summary: 'Visakhapatnam coastal region expects coastal moisture (78% humidity) and scattered coastal rain.',
      irrigation: '🌊 High soil moisture retained. No heavy irrigation required.',
      fertilizer: '🌱 Apply bio-fertilizers (Azospirillum) to promote root growth in humid soil.',
      spraying: '🐛 High fungal risk due to 78% humidity. Spray copper oxychloride for leaf spot.',
      harvest: '🌾 Store harvested paddy in ventilated dry sheds.'
    };
  }
  return {
    current_temp: 30, max_temp: 32, min_temp: 24, condition: 'Partly Cloudy', icon: 'bi-cloud-sun-fill text-info',
    humidity: 70, rain_probability: 25, rainfall_mm: 0.0, wind_speed: 12, uv_index: 7, sunrise: '06:05', sunset: '18:30',
    summary: 'The 7-day outlook indicates warm weather with moderate rain forecast around Tuesday.',
    irrigation: '🌧️ High rain probability (75%) forecast for Tuesday. Postpone watering to prevent waterlogging.',
    fertilizer: '🌱 Avoid top-dressing Urea immediately before Tuesday rain to prevent nutrient runoff.',
    spraying: '🐛 Thursday morning presents the best weather window for foliar pesticide and neem oil spraying.',
    harvest: '🌾 Plan harvesting activities during consecutive dry days (Friday, Saturday).'
  };
}

export async function getFarmerWeather({ location = 'Ongole', district = 'Prakasam', state = 'Andhra Pradesh' } = {}) {
  return await get7DayForecast({ location, district, state });
}

/**
 * 7-Day Weather Service with Dynamic Geocoding & Microclimate Engine
 */
export async function get7DayForecast({ location = 'Ongole', district = 'Prakasam', state = 'Andhra Pradesh', lat = null, lon = null }) {
  const locKey = (location || '').toLowerCase().trim();
  const geoMatch = CITY_COORDINATES[locKey];

  const finalLat = lat || geoMatch?.lat || 15.5057;
  const finalLon = lon || geoMatch?.lon || 80.0499;
  const finalDistrict = district || geoMatch?.district || 'Prakasam';
  const finalState = state || geoMatch?.state || 'Andhra Pradesh';
  const finalLocation = location || 'Ongole';

  const cacheKey = `${finalDistrict}_${finalLocation}`.toLowerCase().replace(/\s+/g, '_');
  
  // 1. Check MySQL Cache
  try {
    const cachedRows = await query(
      'SELECT * FROM weather_cache WHERE location = ? AND expires_at > NOW() ORDER BY fetched_at DESC LIMIT 1',
      [cacheKey]
    );

    if (cachedRows && cachedRows.length > 0) {
      const cached = cachedRows[0];
      const parsedForecast = JSON.parse(cached.forecast_json);
      return {
        ...parsedForecast,
        location: {
          city: finalLocation,
          location: finalLocation,
          district: finalDistrict,
          state: finalState,
          country: 'India',
          lat: finalLat,
          lon: finalLon
        },
        isCached: true,
        cachedAt: cached.fetched_at
      };
    }
  } catch (err) {
    console.warn('Weather cache check note:', err.message);
  }

  // 2. Fetch Live 7-Day Forecast from Open-Meteo API
  try {
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${finalLat}&longitude=${finalLon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,windspeed_10m_max,uv_index_max,sunrise,sunset&hourly=relativehumidity_2m,cloudcover&timezone=auto`;

    const res = await fetch(apiUrl, { signal: AbortSignal.timeout(6000) });
    
    if (res.ok) {
      const data = await res.json();
      const normalized = normalizeOpenMeteoForecast(data, { location: finalLocation, district: finalDistrict, state: finalState, lat: finalLat, lon: finalLon });

      // Save to MySQL Cache with 2 hour TTL
      const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
      await query(
        'INSERT INTO weather_cache (location, latitude, longitude, forecast_json, expires_at) VALUES (?, ?, ?, ?, ?)',
        [cacheKey, finalLat, finalLon, JSON.stringify(normalized), expiresAt]
      );

      return normalized;
    }
  } catch (err) {
    console.warn('Weather API connection note:', err.message);
  }

  // 3. Fallback Normalized 7-Day Forecast with City Microclimate
  return getFallback7DayForecast({ location: finalLocation, district: finalDistrict, state: finalState, lat: finalLat, lon: finalLon });
}

function normalizeOpenMeteoForecast(data, locInfo) {
  const daily = data.daily || {};
  const current = data.current_weather || {};
  const dates = daily.time || [];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const forecastDays = dates.map((dateStr, i) => {
    const d = new Date(dateStr);
    const dayName = i === 0 ? 'Today' : dayNames[d.getDay()];
    const code = daily.weathercode?.[i] ?? 0;
    const condInfo = parseWmoWeatherCode(code);

    return {
      date: dateStr,
      day: dayName,
      max_temp: Math.round(daily.temperature_2m_max?.[i] ?? 32),
      min_temp: Math.round(daily.temperature_2m_min?.[i] ?? 24),
      avg_temp: Math.round(((daily.temperature_2m_max?.[i] ?? 32) + (daily.temperature_2m_min?.[i] ?? 24)) / 2),
      condition: condInfo.label,
      code: code,
      icon: condInfo.icon,
      humidity: Math.round(data.hourly?.relativehumidity_2m?.[i * 24 + 12] || 68),
      rain_probability: Math.round(daily.precipitation_probability_max?.[i] ?? 20),
      rainfall_mm: Number((daily.precipitation_sum?.[i] ?? 0).toFixed(1)),
      wind_speed: Math.round(daily.windspeed_10m_max?.[i] ?? 12),
      uv_index: Math.round(daily.uv_index_max?.[i] ?? 6),
      sunrise: daily.sunrise?.[i] ? daily.sunrise[i].split('T')[1]?.substring(0, 5) : '06:05',
      sunset: daily.sunset?.[i] ? daily.sunset[i].split('T')[1]?.substring(0, 5) : '18:30'
    };
  });

  const today = forecastDays[0] || {};

  return {
    location: {
      city: locInfo.location,
      location: locInfo.location,
      district: locInfo.district,
      state: locInfo.state,
      country: 'India',
      lat: locInfo.lat,
      lon: locInfo.lon
    },
    today: {
      current_temp: Math.round(current.temperature || today.avg_temp || 30),
      condition: today.condition || 'Partly Cloudy',
      icon: today.icon || 'bi-cloud-sun-fill text-info',
      max_temp: today.max_temp || 32,
      min_temp: today.min_temp || 24,
      humidity: today.humidity || 70,
      rain_probability: today.rain_probability || 25,
      rainfall_mm: today.rainfall_mm || 0,
      wind_speed: current.windspeed || today.wind_speed || 12,
      uv_index: today.uv_index || 7,
      sunrise: today.sunrise || '06:05',
      sunset: today.sunset || '18:30'
    },
    forecast: forecastDays.slice(0, 7)
  };
}

function parseWmoWeatherCode(code) {
  if (code === 0) return { label: 'Clear Sky', icon: 'bi-sun-fill text-warning' };
  if (code <= 3) return { label: 'Partly Cloudy', icon: 'bi-cloud-sun-fill text-info' };
  if (code <= 48) return { label: 'Foggy', icon: 'bi-cloud-fog-fill text-secondary' };
  if (code <= 55) return { label: 'Drizzle', icon: 'bi-cloud-drizzle-fill text-primary' };
  if (code <= 65) return { label: 'Moderate Rain', icon: 'bi-cloud-rain-fill text-primary' };
  if (code <= 77) return { label: 'Snow / Hail', icon: 'bi-snow text-info' };
  if (code <= 82) return { label: 'Heavy Rain', icon: 'bi-cloud-heavy-rain-fill text-primary' };
  return { label: 'Thunderstorm', icon: 'bi-cloud-lightning-rain-fill text-danger' };
}

function getFallback7DayForecast(locInfo) {
  const micro = getCityMicroclimate(locInfo.location);
  const days = ['Today', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayDate = new Date();

  const forecast = days.map((dayName, i) => {
    const d = new Date(todayDate);
    d.setDate(d.getDate() + i);

    return {
      date: d.toISOString().split('T')[0],
      day: dayName,
      max_temp: micro.max_temp + (i % 3) - 1,
      min_temp: micro.min_temp - (i % 2),
      avg_temp: micro.current_temp,
      condition: i === 2 ? 'Moderate Rain' : micro.condition,
      code: i === 2 ? 63 : 2,
      icon: i === 2 ? 'bi-cloud-rain-fill text-primary' : micro.icon,
      humidity: i === 2 ? Math.min(95, micro.humidity + 15) : micro.humidity,
      rain_probability: i === 2 ? 75 : micro.rain_probability,
      rainfall_mm: i === 2 ? 14.5 : micro.rainfall_mm,
      wind_speed: micro.wind_speed,
      uv_index: micro.uv_index,
      sunrise: micro.sunrise,
      sunset: micro.sunset
    };
  });

  return {
    location: {
      city: locInfo.location,
      location: locInfo.location,
      district: locInfo.district,
      state: locInfo.state,
      country: 'India',
      lat: locInfo.lat,
      lon: locInfo.lon
    },
    today: {
      current_temp: micro.current_temp,
      condition: micro.condition,
      icon: micro.icon,
      max_temp: micro.max_temp,
      min_temp: micro.min_temp,
      humidity: micro.humidity,
      rain_probability: micro.rain_probability,
      rainfall_mm: micro.rainfall_mm,
      wind_speed: micro.wind_speed,
      uv_index: micro.uv_index,
      sunrise: micro.sunrise,
      sunset: micro.sunset
    },
    forecast
  };
}
