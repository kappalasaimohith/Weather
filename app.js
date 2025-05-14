const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const moment = require('moment');
require('dotenv').config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    message: 'Too many requests, please try again later.',
});

app.use(limiter);

let weatherCache = {};

let apiRequestCount = 0;

function getWeatherData(cityName, callback) {
    const apiKey = process.env.API_KEY;
    const units = 'metric'; 
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
    res.sendFile(__dirname + "/public/weather.html");
});

app.post("/", (req, res) => {
    const cityName = req.body.cityName;

    if (weatherCache[cityName]) {
        const cacheTime = weatherCache[cityName].timestamp;
        const currentTime = moment();
        const cacheAge = currentTime.diff(moment(cacheTime), 'seconds');

        if (cacheAge < 60) {
            console.log('Serving from cache...');
            return res.json(weatherCache[cityName].weatherData);
        }
    }

    getWeatherData(cityName, (err, weatherData) => {
        if (err) {
            return res.status(500).json({ error: "Error fetching data: " + err });
        }

        const formattedData = formatWeatherData(weatherData, cityName);
        weatherCache[cityName] = {
            weatherData: formattedData,
            timestamp: moment().toISOString()
        };

        res.json(formattedData); 
    });
});

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
