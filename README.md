### Weather App README

#### Overview
The Weather App is a simple web application that allows users to retrieve current weather information for a specified city. It provides details such as temperature, humidity, wind speed, sunrise, sunset, visibility, and weather description.

#### Features
- Fetch current weather data using OpenWeatherMap API.
- Display weather information dynamically based on user input.
- Update background image based on weather conditions (e.g., rain, clouds, clear sky).

#### Prerequisites
Before running the Weather App locally, ensure you have the following installed:

- Node.js (version >= 12.0.0)
- npm (Node Package Manager)

#### Setup Instructions
To get started with the Weather App, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/kappalasaimohith/Weather.git
   cd Weather
   ```
2. **Initialize package.json**:
   ```bash
   npm init -y
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   - Create a `.env` file in the root directory.
   - Add your OpenWeatherMap API key:
     ```
     API_KEY=your_openweathermap_api_key
     ```
   - Save and close the `.env` file.
   - You can also modify the PORT number by including the below part in your `.env` file
   PORT = your_port_number

4. **Run the application**:
   ```bash
   node app.js
   ```
   This will start the server at `http://localhost:3000`.

5. **Access the Weather App**:
   - Open your web browser and go to `http://localhost:3000`.
   - Enter a city name in the input field and click on "Get Weather" to fetch weather information.

#### Additional Notes
- The Weather App uses the OpenWeatherMap API to fetch weather data. Ensure you have a valid API key from [OpenWeatherMap](https://openweathermap.org/) and replace `your_openweathermap_api_key` in the `.env` file.
- The background image of the app changes dynamically based on the weather conditions fetched from the API.

#### Credits
- This project utilizes:
  - [Node.js](https://nodejs.org/)
  - [Express.js](https://expressjs.com/)
  - [OpenWeatherMap API](https://openweathermap.org/api)
