const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const moment = require('moment');
require('dotenv').config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Setting up rate limiting to prevent more than 60 requests per minute for the whole server
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    message: 'Too many requests, please try again later.',
});

app.use(limiter);

// Store the cached weather data
let weatherCache = {};

// Counter for API requests
let apiRequestCount = 0;

// Function to get weather data from OpenWeather API
function getWeatherData(cityName, callback) {
    const apiKey = process.env.API_KEY;
    const units = 'metric'; // Celsius
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=${units}`;

    https.get(url, (response) => {
        if (response.statusCode === 200) {
            response.on("data", (data) => {
                const weatherData = JSON.parse(data);
                callback(null, weatherData);
            });
        } else {
            callback(`Error fetching weather data: ${response.statusCode}`, null);
        }
    }).on("error", (error) => {
        callback(`Error fetching data: ${error.message}`, null);
    });

    apiRequestCount++;
    console.log(`API Requests Made: ${apiRequestCount}`);
}

// Routes
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/weather.html");
});

app.post("/", (req, res) => {
    const cityName = req.body.cityName;

    
    if (weatherCache[cityName]) {
        const cacheTime = weatherCache[cityName].timestamp;
        const currentTime = moment();
        const cacheAge = currentTime.diff(moment(cacheTime), 'seconds');

        if (cacheAge < 60) {
            console.log('Serving from cache...');
            const cachedData = weatherCache[cityName];
            return sendWeatherData(res, cachedData.weatherData, cityName);
        }
    }

    getWeatherData(cityName, (err, weatherData) => {
        if (err) {
            return res.status(500).send("Error fetching data: " + err);
        }

        const weatherDetails = formatWeatherData(weatherData, cityName);
        weatherCache[cityName] = {
            weatherData: weatherDetails,
            timestamp: moment().toISOString()
        };

        sendWeatherData(res, weatherDetails, cityName);
    });
});

// Helper function to format weather data
function formatWeatherData(weatherData, cityName) {
    const coord = weatherData.coord;
    const tempCelsius = weatherData.main.temp.toFixed(1);
    const tempFeelsLike = weatherData.main.feels_like.toFixed(1);
    const tempMin = weatherData.main.temp_min.toFixed(1);
    const tempMax = weatherData.main.temp_max.toFixed(1);
    const pressure = weatherData.main.pressure;
    const humidity = weatherData.main.humidity;
    const visibility = (weatherData.visibility / 1000).toFixed(1);
    const windSpeed = weatherData.wind.speed;
    const sunrise = new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });
    const sunset = new Date(weatherData.sys.sunset * 1000).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });
    const cloudiness = weatherData.clouds.all;
    const weatherDescription = weatherData.weather[0].description;
    const icon = weatherData.weather[0].icon;

    const imgURL = `https://openweathermap.org/img/wn/${icon}.png`;

    return {
        cityName,
        coord,
        tempCelsius,
        tempFeelsLike,
        tempMin,
        tempMax,
        pressure,
        humidity,
        visibility,
        windSpeed,
        sunrise,
        sunset,
        cloudiness,
        weatherDescription,
        imgURL
    };
}

// Function to send the formatted weather data to the client
function sendWeatherData(res, weatherDetails, cityName) {
    const weatherHTML = `
        <div class="center">
            <h2>${cityName}</h2>
            <img src="${weatherDetails.imgURL}" alt="${weatherDetails.weatherDescription}" class="weather-icon">
            <p class="weather-description">${weatherDetails.weatherDescription.charAt(0).toUpperCase() + weatherDetails.weatherDescription.slice(1)}</p>
            <div class="weather-details">
                <p>Coordinates: ${weatherDetails.coord.lon}, ${weatherDetails.coord.lat}(lon, lat)</p>
                <p>Temperature: ${weatherDetails.tempCelsius} °C (Feels like ${weatherDetails.tempFeelsLike} °C)</p>
                <p>Min Temperature: ${weatherDetails.tempMin} °C</p>
                <p>Max Temperature: ${weatherDetails.tempMax} °C</p>
                <p>Pressure: ${weatherDetails.pressure} hPa</p>
                <p>Humidity: ${weatherDetails.humidity}%</p>
                <p>Visibility: ${weatherDetails.visibility} km</p>
                <p>Wind Speed: ${weatherDetails.windSpeed} m/s</p>
                <p>Sunrise: ${weatherDetails.sunrise}</p>
                <p>Sunset: ${weatherDetails.sunset}</p>
                <p>Cloudiness: ${weatherDetails.cloudiness}%</p>
            </div>
        </div>
        <a href="/" class="back-btn"><i class="fas fa-chevron-left"></i> Check Another City</a>
    `;
    res.send(weatherHTML);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
