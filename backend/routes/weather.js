const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authenticateJWT } = require('../middleware/auth');

// Get weather forecast
router.get('/forecast', authenticateJWT, async (req, res, next) => {
  try {
    const { lat, lon, city } = req.query;

    if (!lat || !lon) {
      if (!city) {
        return res.status(400).json({ message: 'Either lat/lon or city is required' });
      }
    }

    let url = 'https://api.openweathermap.org/data/2.5/forecast';
    const params = {
      appid: process.env.OPENWEATHER_API_KEY,
      units: 'metric'
    };

    if (lat && lon) {
      params.lat = lat;
      params.lon = lon;
    } else {
      params.q = city;
    }

    const response = await axios.get(url, { params });
    
    res.json({
      city: response.data.city,
      forecasts: response.data.list.map(item => ({
        date: new Date(item.dt * 1000),
        temperature: item.main.temp,
        feelsLike: item.main.feels_like,
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        humidity: item.main.humidity,
        windSpeed: item.wind.speed,
        clouds: item.clouds.all
      }))
    });
  } catch (error) {
    console.error('OpenWeather API error:', error.response?.data || error.message);
    next(error);
  }
});

// Get current weather
router.get('/current', authenticateJWT, async (req, res, next) => {
  try {
    const { lat, lon, city } = req.query;

    if (!lat || !lon) {
      if (!city) {
        return res.status(400).json({ message: 'Either lat/lon or city is required' });
      }
    }

    let url = 'https://api.openweathermap.org/data/2.5/weather';
    const params = {
      appid: process.env.OPENWEATHER_API_KEY,
      units: 'metric'
    };

    if (lat && lon) {
      params.lat = lat;
      params.lon = lon;
    } else {
      params.q = city;
    }

    const response = await axios.get(url, { params });
    
    res.json({
      location: response.data.name,
      temperature: response.data.main.temp,
      feelsLike: response.data.main.feels_like,
      description: response.data.weather[0].description,
      icon: response.data.weather[0].icon,
      humidity: response.data.main.humidity,
      windSpeed: response.data.wind.speed,
      clouds: response.data.clouds.all,
      visibility: response.data.visibility,
      sunrise: new Date(response.data.sys.sunrise * 1000),
      sunset: new Date(response.data.sys.sunset * 1000)
    });
  } catch (error) {
    console.error('OpenWeather API error:', error.response?.data || error.message);
    next(error);
  }
});

module.exports = router;

