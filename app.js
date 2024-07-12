const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/weather.html");
});

app.post("/", (req, res) => {
    const query = req.body.cityName;
    const apiKey = process.env.API_KEY;
    const units = 'metric'; // Using metric for Celsius
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${apiKey}&units=${units}`;
    https.get(url, (response) => {
        if (response.statusCode === 200) {
            response.on("data", (data) => {
                const weatherData = JSON.parse(data);
                //console.log(weatherData);
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

                // Construct HTML to send back to the client
                const weatherHTML = `
                    <div class="center">
                        <h2>${query}</h2>
                        <img src="${imgURL}" alt="${weatherDescription}" class="weather-icon">
                        <p class="weather-description">${weatherDescription.charAt(0).toUpperCase() + weatherDescription.slice(1)}</p>
                        <div class="weather-details">
                            <p>Coordinates: ${coord.lon}, ${coord.lat}(lon, lat)</p>
                            <p>Temperature: ${tempCelsius} °C (Feels like ${tempFeelsLike} °C)</p>
                            <p>Min Temperature: ${tempMin} °C</p>
                            <p>Max Temperature: ${tempMax} °C</p>
                            <p>Pressure: ${pressure} hPa</p>
                            <p>Humidity: ${humidity}%</p>
                            <p>Visibility: ${visibility} km</p>
                            <p>Wind Speed: ${windSpeed} m/s</p>
                            <p>Sunrise: ${sunrise}</p>
                            <p>Sunset: ${sunset}</p>
                            <p>Cloudiness: ${cloudiness}%</p>
                        </div>
                    </div>
                    <a href="/" class="back-btn"><i class="fas fa-chevron-left"></i> Check Another City</a>
                `;
                res.send(weatherHTML);
            });
        } else {
            res.status(response.statusCode).send("Error fetching data");
        }
    }).on("error", (error) => {
        console.error("Error fetching data:", error);
        res.status(500).send("Server error");
    });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
