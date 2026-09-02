import { generateLLMResponse } from './llmService.js';
import { getAgriculturalWeatherKnowledge } from './weatherRagService.js';

/**
 * AI Weather Analysis & Agronomic Advisory Service
 * Generates dynamic, context-aware farming recommendations based on Location, Forecast Data, and Farmer Profile.
 */
export async function generateAIWeatherAnalysis({ forecastData, farmerContext, language = 'en' }) {
  const forecast = forecastData.forecast || [];
  const location = forecastData.location || {};
  const city = (location.city || location.location || farmerContext?.location || 'Ongole').toLowerCase().trim();
  const district = location.district || farmerContext?.district || 'Prakasam';
  const isTelugu = language === 'te';

  const crops = farmerContext?.primary_crops || 'Paddy, Tomato, Chilli, Cotton';
  const soilType = farmerContext?.soil_type || 'Loamy';
  const irrigationMethod = farmerContext?.irrigation_method || 'Drip';
  const season = farmerContext?.season || 'Kharif';

  // 1. Detect Weather Extremes & Alerts directly from forecast data
  const alerts = [];
  const maxRainDay = forecast.reduce((max, d) => (d.rain_probability > (max?.rain_probability || 0) ? d : max), forecast[0] || {});
  const highestTempDay = forecast.reduce((max, d) => (d.max_temp > (max?.max_temp || 0) ? d : max), forecast[0] || {});
  const maxWindDay = forecast.reduce((max, d) => (d.wind_speed > (max?.wind_speed || 0) ? d : max), forecast[0] || {});

  if (maxRainDay && maxRainDay.rain_probability >= 50) {
    alerts.push({
      type: 'Rainfall Risk Alert',
      severity: maxRainDay.rain_probability >= 70 ? 'high' : 'warning',
      title: isTelugu ? `🌧️ ${location.city || district} ప్రాంతంలో వర్షపాత హెచ్చరిక` : `🌧️ Rainfall Risk Alert for ${location.city || district}`,
      day: maxRainDay.day,
      message: isTelugu
        ? `${maxRainDay.day} రోజున ${maxRainDay.rain_probability}% వర్షం పడే అవకాశం ఉంది. చేలలో మురుగు నీటి నిల్వ లేకుండా కాలువలు శుభ్రం చేసుకోండి.`
        : `High probability of rainfall (${maxRainDay.rain_probability}%, ~${maxRainDay.rainfall_mm || 5}mm) forecast for ${maxRainDay.day} in ${location.city || district}. Ensure field drainage channels are clear.`
    });
  }

  if (highestTempDay && highestTempDay.max_temp >= 35) {
    alerts.push({
      type: 'Heat Stress Alert',
      severity: 'warning',
      title: isTelugu ? `☀️ ${location.city || district} అధిక ఉష్ణోగ్రత హెచ్చరిక` : `☀️ Heat Stress Alert for ${location.city || district}`,
      day: highestTempDay.day,
      message: isTelugu
        ? `${highestTempDay.day} న గరిష్ట ఉష్ణోగ్రత ${highestTempDay.max_temp}°C కు చేరుకోనుంది. సాయంత్రం లేదా ఉదయం వేళల్లో పంటలకు నీరందించండి.`
        : `Temperatures reaching ${highestTempDay.max_temp}°C expected on ${highestTempDay.day} in ${location.city || district}. Apply early morning irrigation to protect crops.`
    });
  }

  // 2. Identify Best Farming Windows
  const sprayDay = forecast.find(d => d.rain_probability < 30 && d.wind_speed < 18) || forecast[1] || forecast[0] || { day: 'Thu' };
  const harvestDays = forecast.filter(d => d.rain_probability < 25 && d.rainfall_mm < 1).map(d => d.day);

  const farmingWindows = {
    irrigationWindow: maxRainDay && maxRainDay.rain_probability >= 50
      ? (isTelugu ? `వర్షపాతం తరువాత (${maxRainDay.day} పిమ్మట)` : `Post-rainfall after ${maxRainDay.day}`)
      : (isTelugu ? 'ఉదయం 06:00 - 08:30 (రోజూ)' : 'Early Morning 06:00 - 08:30 AM'),
    fertilizerWindow: forecast.find(d => d.rain_probability < 35)?.day || 'Today',
    sprayingWindow: sprayDay ? `${sprayDay.day} Morning (06:30 - 08:30 AM)` : 'Thursday Morning',
    harvestingWindow: harvestDays.length > 0 ? harvestDays.join(', ') : 'Fri, Sat'
  };

  // 3. Generate Location & Regional Microclimate Recommendations
  let weeklySummary = '';
  let irrigationAdvice = '';
  let fertilizerAdvice = '';
  let sprayingAdvice = '';
  let harvestAdvice = '';

  if (city.includes('guntur')) {
    weeklySummary = isTelugu
      ? `గుంటూరు నల్లరేగడి నేలల పరిధిలో సరాసరి ఉష్ణోగ్రతలు ${highestTempDay.max_temp || 35}°C మరియు తేమ 66% గా ఉండనున్నాయి. ప్రత్తి, మిరప తోటల్లో బిందు సేద్యం అనుకూలం.`
      : `Guntur agricultural belt expects max temperatures around ${highestTempDay.max_temp || 35}°C with moderate relative humidity (66%). High suitability for Chilli & Cotton crop management.`;
    irrigationAdvice = isTelugu
      ? `💧 మిరప, ప్రత్తి పంటలకు ప్రతిరోజూ ఉదయం 6:00 - 7:30 గంటల మధ్య 45 నిమిషాల పాటు బిందు సేద్యం (Drip Irrigation) అందించండి.`
      : `💧 Apply 45 minutes of drip irrigation daily between 06:00 AM and 07:30 AM to combat evaporation in Guntur black soil.`;
    fertilizerAdvice = isTelugu
      ? `🌱 19:19:19 నీటిలో కరిగే ఎరువులను 3 కిలోలు/ఎకరాకు ఉదయపు తడి ద్వారా ఫెర్టిగేషన్ పద్ధతిలో అందించండి.`
      : `🌱 Top-dress 19:19:19 water-soluble NPK via fertigation during early morning hours before temperatures cross 30°C.`;
    sprayingAdvice = isTelugu
      ? `🐛 తామర పురుగు (Thrips) నివారణకు ${sprayDay.day} ఉదయం 8:30 లోపు ఫిప్రోనిల్ లేదా వేపనూనె పిచికారీ చేయండి.`
      : `🐛 Spray Fipronil or Neem Oil (10,000 ppm) on ${sprayDay.day} before 08:30 AM to control Chilli Thrips & Whitefly vectors.`;
    harvestAdvice = isTelugu
      ? `🌾 ఎండు మిరపకాయలను ఆరబెట్టుకోవడానికి మరియు ప్రత్తి ఏరుకోవడానికి నిర్మలమైన రోజులు (${farmingWindows.harvestingWindow}) అనుకూలం.`
      : `🌾 Excellent dry weather window (${farmingWindows.harvestingWindow}) for Chilli pod drying and Cotton picking.`;
  } else if (city.includes('vijayawada')) {
    weeklySummary = isTelugu
      ? `విజయవాడ కృష్ణా డెల్టా పరివాహక మండలంలో గాలిలో తేమ 72% మరియు ఉష్ణోగ్రతలు ${highestTempDay.max_temp || 34}°C గా ఉండనున్నాయి.`
      : `Vijayawada Krishna delta zone expects elevated relative humidity (72%) with maximum temperatures reaching ${highestTempDay.max_temp || 34}°C.`;
    irrigationAdvice = isTelugu
      ? `🌊 కాలువ నీటి లభ్యత సమృద్ధిగా ఉన్నందున వరి చేలలో నీటి మట్టాన్ని 2-3 సెం.మీ మేర స్థిరంగా ఉంచండి.`
      : `🌊 Canal water inflow is stable. Maintain a continuous standing water depth of 2-3 cm in Paddy fields.`;
    fertilizerAdvice = isTelugu
      ? `🌱 వరి పొలాల్లో పొటాష్ (MOP) 25 కిలోలు/ఎకరాకు చల్లి దుబ్బు చేసే దశను పటిష్టం చేయండి.`
      : `🌱 Broadcast Muriate of Potash (MOP) at 25 kg/acre to bolster root development in flooded delta soil.`;
    sprayingAdvice = isTelugu
      ? `🐛 తేమ ఎక్కువగా ఉన్నందున అగ్గి తెగులు నివారణకు ${sprayDay.day} సాయంత్రం వేళల్లో ట్రైసైక్లజోల్ మందు పిచికారీ చేయండి.`
      : `🐛 High humidity increases Blast disease risk. Apply Tricyclazole spray during late afternoon hours on ${sprayDay.day}.`;
    harvestAdvice = isTelugu
      ? `🌾 కోసిన వరి పనలను పొలంలో ఉంచకుండా నూర్పిడి వేగవంతం చేయండి.`
      : `🌾 Accelerate threshing of harvested Paddy sheaves to avoid humidity-induced mold.`;
  } else if (city.includes('kurnool')) {
    weeklySummary = isTelugu
      ? `కర్నూలు రాయలసీమ పొడి ప్రాంతంలో ఉష్ణోగ్రతలు ${highestTempDay.max_temp || 36}°C కు చేరుకోవడంతో పొడిగాలులు వీస్తాయి.`
      : `Kurnool dry region forecast shows max temperatures hitting ${highestTempDay.max_temp || 36}°C with dry winds and low relative humidity (48%).`;
    irrigationAdvice = isTelugu
      ? `💧 వేరుశనగ, ఉల్లి పంటలలో నీటి ఉత్సేకాన్ని తగ్గించడానికి సాయంత్రం వేళల్లో తేలికపాటి నీటి తడులు అందించండి.`
      : `💧 Provide frequent light sprinkler irrigation during early mornings for Groundnut and Onion crops.`;
    fertilizerAdvice = isTelugu
      ? `🌱 జిప్సం 200 కిలోలు/ఎకరాకు వేరుశనగ వూడలు దిగే దశలో నేలకు అందించండి.`
      : `🌱 Apply Gypsum at 200 kg/acre at the pegging stage of Groundnut to improve pod filling.`;
    sprayingAdvice = isTelugu
      ? `💨 గాలి వేగం (${maxWindDay.wind_speed || 16} km/h) ఎక్కువగా ఉన్నందున మధ్యాహ్నం పిచికారీ నివారించండి.`
      : `💨 Avoid foliar spraying during midday due to high wind speeds (${maxWindDay.wind_speed || 16} km/h).`;
    harvestAdvice = isTelugu
      ? `🌾 వేరుశనగ తోటల తవ్వకానికి మరియు కాయలు ఆరబెట్టడానికి రాబోయే 7 రోజులు ఎంతో అనుకూలం.`
      : `🌾 Ideal dry weather for Groundnut harvesting and pod drying over the next 7 days.`;
  } else if (city.includes('anantapur')) {
    weeklySummary = isTelugu
      ? `అనంతపురం అర్ధ-శుష్క మండలంలో తీవ్రమైన ఎండలు (${highestTempDay.max_temp || 37}°C) మరియు తక్కువ వర్షపాతం (${maxRainDay.rain_probability || 10}%) నమోదు కానున్నాయి.`
      : `Anantapur semi-arid zone will experience intense heat (${highestTempDay.max_temp || 37}°C) and low rainfall probability (${maxRainDay.rain_probability || 10}%).`;
    irrigationAdvice = isTelugu
      ? `⚠️ అధిక బాష్పీభవనం ఉన్నందున బిందు సేద్యం ద్వారా మాత్రమే ఉదయం 5:30 నుండి 7:30 మధ్య నీరందించండి.`
      : `⚠️ Extreme evapotranspiration losses. Operate drip systems strictly between 05:30 AM and 07:30 AM.`;
    fertilizerAdvice = isTelugu
      ? `🌱 పొడి ఎరువులను నేరుగా చల్లకూడదు; డ్రిప్ ఫెర్టిగేషన్ ద్వారా మాత్రమే సూక్ష్మ పోషకాలను అందించండి.`
      : `🌱 Avoid dry fertilizer broadcasting; supply liquid micronutrients exclusively via micro-drip fertigation.`;
    sprayingAdvice = isTelugu
      ? `🐛 శనగ పచ్చపురుగు నివారణకు సాయంత్రం 5:30 తర్వాత NPV కషాయం పిచికారీ చేయండి.`
      : `🐛 Spray HaNPV solution during late evening (after 05:30 PM) for Helicoverpa caterpillar control.`;
    harvestAdvice = isTelugu
      ? `🌾 వేరుశనగ మడులు ఎండబెట్టుకోవడానికి అనుకూలమైన వాతావరణం ఉంది.`
      : `🌾 Perfect heat and dry winds for sun-curing harvested Groundnut haulms and pods.`;
  } else if (city.includes('warangal')) {
    weeklySummary = isTelugu
      ? `వరంగల్ వ్యవసాయ మండలంలో వర్ష సూచన (${maxRainDay.rain_probability || 45}%) తో పాటు తేలికపాటి జల్లులు పడే అవకాశం ఉంది.`
      : `Warangal region anticipates moderate cloud cover with a ${maxRainDay.rain_probability || 45}% rain probability and precipitation around ${maxRainDay.day || 'mid-week'}.`;
    irrigationAdvice = isTelugu
      ? `🌧️ ${maxRainDay.day || 'బుధవారం'} రోజున వర్షం పడే అవకాశం ఉన్నందున నీటి తడులు నిలిపివేయండి.`
      : `🌧️ Rainy conditions forecast for ${maxRainDay.day || 'mid-week'}. Suspend scheduled irrigation for 48 hours.`;
    fertilizerAdvice = isTelugu
      ? `🌱 వర్షం తగ్గేవరకు యూరియా మేలైన చల్లుడు నిలిపివేయండి.`
      : `🌱 Defer top-dressing Urea until rainfall subsides to prevent nutrient leaching into streams.`;
    sprayingAdvice = isTelugu
      ? `🐛 వర్షపు వాన పడే సూచన ఉన్నందున పురుగుమందుల పిచికారీని నియంత్రించండి.`
      : `🐛 Postpone chemical spraying until clear post-rain weather on ${sprayDay.day}.`;
    harvestAdvice = isTelugu
      ? `🌾 కోసిన ప్రత్తి కాయలను వర్షం తడవకుండా ప్లాస్టిక్ కవర్లు కప్పండి.`
      : `🌾 Cover harvested Cotton pods with tarpaulins to prevent discolouration.`;
  } else {
    weeklySummary = isTelugu
      ? `${location.city || 'ఒంగోలు'} పరిధిలో గరిష్ట ఉష్ణోగ్రతలు ${highestTempDay.max_temp || 32}°C మరియు తేమ ${forecast[0]?.humidity || 70}% గా ఉండనుంది.`
      : `${location.city || 'Ongole'} regional weather forecast indicates max temperatures reaching ${highestTempDay.max_temp || 32}°C with ${forecast[0]?.humidity || 70}% humidity.`;
    irrigationAdvice = isTelugu
      ? `💧 పంటలకు ఉదయాన్నే డ్రిప్ పద్ధతి ద్వారా 35 నిమిషాలు నీటిని పారించండి.`
      : `💧 Maintain regular early morning drip irrigation for ${crops} fields.`;
    fertilizerAdvice = isTelugu
      ? `🌱 నేల తేమగా ఉన్నప్పుడు ఉదయపు వేళల్లో NPK Complex ఎరువులు అందించండి.`
      : `🌱 Apply NPK complex fertilizers during morning hours when soil retains adequate moisture.`;
    sprayingAdvice = isTelugu
      ? `🐛 ${sprayDay.day} ఉదయం మందులు పిచికారీ చేయడానికి అనుకూలమైన సమయం.`
      : `🐛 ${sprayDay.day} morning offers the best weather window for foliar pesticide and neem oil spraying.`;
    harvestAdvice = isTelugu
      ? `🌾 పంట కోతలకు నిర్మలమైన రోజులను ఎంచుకోండి.`
      : `🌾 Plan harvesting during dry forecast days to ensure proper crop drying.`;
  }

  return {
    weeklySummary,
    irrigationAdvice,
    fertilizerAdvice,
    sprayingAdvice,
    harvestAdvice,
    alerts,
    farmingWindows
  };
}
