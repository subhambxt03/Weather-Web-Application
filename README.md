# Weather-Web-Application
A real-time Weather Web App using OpenWeatherMap API that shows current weather, forecasts, AQI, sunrise/sunset, and detailed metrics. It supports city search, geolocation, theme toggle, search history, and an interactive Leaflet.js map with click-based weather updates.

The Web Appliction is built using HTML, CSS, and JavaScript and integrates several key functionalities:

Real-time Weather Data: Fetches current weather conditions, including temperature, humidity, wind speed, pressure, and "feels like" temperature.

Weather Forecast: Displays hourly (next 24 hours) and daily (next 5 days) forecasts.

Air Quality Index (AQI): Shows current air quality levels with descriptive status and color indicators.

Interactive Map: Uses Leaflet.js to show the location on a map, allows clicking on map to fetch weather for that location.

Search History: Maintains the last 10 searched cities for quick access.

Theme Management: Users can toggle between day mode and night mode, with preference saved in localStorage.

Responsive User Interface: Designed to dynamically update without page reloads, including real-time time and date display.

--Key Features

1. DOM Elements and Interaction

Manages all UI components such as temperature display, icons, hourly and daily forecasts, and map markers.

Supports input via search box or current location button.

2. Weather API Integration

Fetches:

Current weather via weather API endpoint.

Forecast data via forecast API endpoint.

Air quality data via air_pollution API endpoint.

Processes data to dynamically update UI, including icons, color themes, and descriptions.

3. Map Integration

Uses Leaflet.js to initialize and display a world map.

Updates map with markers for current city/location.

Clicking on the map fetches weather for clicked coordinates.

4. Search History

Stores last 4 cities in localStorage.

Displays recent searches as clickable buttons for quick access.

5. Theme Toggle

Night/Day mode toggle with icons (sun/moon).

Persists user preference using localStorage.

6. Forecast Display

Hourly Forecast: Next 8 intervals (3-hour slots).

Daily Forecast: Next 5 days, excluding today.

Determines most common weather type per day for icon display.

7. Utility Functions

Calculates sunrise/sunset times.

Updates date and time dynamically.

Determines correct weather icon based on weather condition and day/night.

8. Error Handling

Gracefully handles:

Invalid city names

API errors

Geolocation errors

Displays messages and loading indicators for better UX.



---Advantages

User-Friendly Interface

Interactive, responsive, and visually appealing.

Combines weather, forecast, and air quality in one interface.

Persistent Preferences

Saves theme choice and search history locally.

Interactive Map

Allows exploring weather anywhere by clicking on the map.

Dynamic Updates

Time, date, and weather data update without page refresh.

Portable and Extensible

Modular code structure allows easy feature addition or API replacement.

Offline Capability

Recent search history can be displayed even without internet (data cached in localStorage).



---Future Scope / Enhancements

Extended Forecast

Add 10-day or weekly weather forecast.

Multiple Language Support

Show weather in different languages using OpenWeatherMap API.

Unit Conversion

Toggle between Celsius, Fahrenheit, and Kelvin.

Severe Weather Alerts

Integrate alerts for storms, heatwaves, or air quality warnings.

Progressive Web App (PWA)

Enable offline access and push notifications.

Location Autocomplete

Suggest cities as the user types.

Customizable Map Features

Add layers for precipitation, temperature, or AQI visualization.

Animations & Visual Enhancements

Weather-based animations (rain, snow, clouds) for richer UX.
