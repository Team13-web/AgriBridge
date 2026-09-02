import { get7DayForecast } from './services/weatherService.js';
import { generateAIWeatherAnalysis } from './services/weatherAiService.js';

async function test() {
  console.log('Testing 7-day forecast service...');
  const forecastData = await get7DayForecast({
    location: 'Ongole',
    district: 'Prakasam',
    state: 'Andhra Pradesh',
    lat: 15.5057,
    lon: 80.0499
  });

  console.log('Forecast Data Location:', forecastData.location);
  console.log('Forecast Data Today:', forecastData.today);
  console.log('Forecast Data Days count:', forecastData.forecast?.length);

  const aiAnalysis = await generateAIWeatherAnalysis({
    forecastData,
    farmerContext: { primary_crops: 'Paddy, Tomato', soil_type: 'Loamy', irrigation_method: 'Drip', season: 'Kharif' },
    language: 'en'
  });

  console.log('AI Analysis:', aiAnalysis);
}

test().catch(err => console.error('Test Error:', err));
