// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const themeToggle = document.getElementById('theme-toggle');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');
const cityName = document.getElementById('city-name');
const currentDate = document.getElementById('current-date');
const currentTime = document.getElementById('current-time');
const temperature = document.getElementById('temperature');
const currentIcon = document.getElementById('current-icon');
const description = document.getElementById('description');
const feelsLike = document.getElementById('feels-like');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const pressure = document.getElementById('pressure');
const hourlyContainer = document.getElementById('hourly-container');
const dailyContainer = document.getElementById('daily-container');
const addHumidity = document.getElementById('add-humidity');
const sunrise = document.getElementById('sunrise');
const sunset = document.getElementById('sunset');
const aqiValue = document.getElementById('aqi-value');
const aqiStatus = document.getElementById('aqi-status');
const searchHistoryContainer = document.getElementById('search-history');

// API Configuration
const apiKey = 'dfd26054e312efb291c07d958229d220'; 
let currentTimezone = 'UTC'; 
let map;
let currentMarker;
let searchHistory = [];

// Theme Management
let isNightMode = false;

function toggleTheme() {
    isNightMode = !isNightMode;
    if (isNightMode) {
        document.body.className = 'night-theme';
        themeToggle.innerHTML = '<i class="fas fa-sun"></i> Day Mode';
    } else {
        document.body.className = 'day-theme';
        themeToggle.innerHTML = '<i class="fas fa-moon"></i> Night Mode';
    }
    
    
    localStorage.setItem('themePreference', isNightMode ? 'night' : 'day');
}

// Load saved theme preference
function loadThemePreference() {
    const savedTheme = localStorage.getItem('themePreference');
    if (savedTheme === 'night') {
        isNightMode = true;
        document.body.className = 'night-theme';
        themeToggle.innerHTML = '<i class="fas fa-sun"></i> Day Mode';
    } else {
        isNightMode = false;
        document.body.className = 'day-theme';
        themeToggle.innerHTML = '<i class="fas fa-moon"></i> Night Mode';
    }
}

// Initialize Map
function initMap(lat = 0, lon = 0) {
    if (map) {
        map.remove();
    }
    
    map = L.map('map').setView([lat, lon], 2);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    p
    map.on('click', function(e) {
        const { lat, lng } = e.latlng;
        getWeatherByCoords(lat, lng);
    });
    
    if (lat !== 0 && lon !== 0) {
        currentMarker = L.marker([lat, lon]).addTo(map)
            .bindPopup('Current Location')
            .openPopup();
    }
}


function updateMapLocation(lat, lon, cityName) {
    if (currentMarker) {
        map.removeLayer(currentMarker);
    }
    
    currentMarker = L.marker([lat, lon]).addTo(map)
        .bindPopup(cityName)
        .openPopup();
    
    map.setView([lat, lon], 10);
}

// Load search history from localStorage
function loadSearchHistory() {
    const savedHistory = localStorage.getItem('weatherSearchHistory');
    if (savedHistory) {
        searchHistory = JSON.parse(savedHistory);
        updateSearchHistoryDisplay();
    }
}

// Save search history to localStorage
function saveSearchHistory() {
    localStorage.setItem('weatherSearchHistory', JSON.stringify(searchHistory));
}

// Update search history display
function updateSearchHistoryDisplay() {
    searchHistoryContainer.innerHTML = '';
    

    const recentSearches = searchHistory.slice(-4);
    
    recentSearches.forEach(city => {
        const historyItem = document.createElement('button');
        historyItem.className = 'search-history-item';
        historyItem.textContent = city;
        historyItem.addEventListener('click', () => {
            cityInput.value = city;
            getWeatherByCity();
        });
        searchHistoryContainer.appendChild(historyItem);
    });
}

// Add city to search history
function addToSearchHistory(city) {
  
    const index = searchHistory.indexOf(city);
    if (index > -1) {
        searchHistory.splice(index, 1);
    }
    
    searchHistory.push(city);
    
   
    if (searchHistory.length > 10) {
        searchHistory = searchHistory.slice(-10);
    }
    
   
    saveSearchHistory();
    updateSearchHistoryDisplay();
}

// Utility Functions
function updateCurrentDateTime(timezone) {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric'
    };
    
    currentDate.textContent = now.toLocaleDateString('en-US', options);
    
    // Update time every second
    setInterval(() => {
        const currentTimeNow = new Date();
        const timeOptions = {
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit'
        };
        currentTime.textContent = currentTimeNow.toLocaleTimeString('en-US', timeOptions);
    }, 1000);
}

function showError(message) {
    loading.style.display = 'none';
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function hideError() {
    errorMessage.style.display = 'none';
}

function showLoading() {
    loading.style.display = 'block';
    hideError();
}

function hideLoading() {
    loading.style.display = 'none';
}

// Weather API Functions
async function getWeatherByCity() {
    const city = cityInput.value.trim();
    if (!city) {
        showError('Please enter a city name');
        return;
    }
    
    showLoading();
    try {
        // Fetch current weather
        const currentResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        if (!currentResponse.ok) {
            throw new Error('City not found');
        }
        const currentData = await currentResponse.json();
        
        // Fetch forecast
        const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
        if (!forecastResponse.ok) {
            throw new Error('Forecast data not available');
        }
        const forecastData = await forecastResponse.json();
        
        // Fetch air quality data
        const aqiResponse = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${currentData.coord.lat}&lon=${currentData.coord.lon}&appid=${apiKey}`);
        const aqiData = aqiResponse.ok ? await aqiResponse.json() : null;
        
        // Process and display data
        processWeatherData(currentData, forecastData, aqiData);
        hideError();
        
        // Add to search history
        addToSearchHistory(city);
        
        // Update map
        updateMapLocation(currentData.coord.lat, currentData.coord.lon, currentData.name);
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

async function getWeatherByLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }
    
    showLoading();
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                getWeatherByCoords(latitude, longitude);
            } catch (error) {
                showError(error.message);
            }
        },
        (error) => {
            hideLoading();
            showError('Unable to retrieve your location');
        }
    );
}

async function getWeatherByCoords(lat, lon) {
    showLoading();
    try {
        // Fetch current weather
        const currentResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        if (!currentResponse.ok) {
            throw new Error('Weather data not available');
        }
        const currentData = await currentResponse.json();
        
        // Fetch forecast
        const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        if (!forecastResponse.ok) {
            throw new Error('Forecast data not available');
        }
        const forecastData = await forecastResponse.json();
        
        // Fetch air quality data
        const aqiResponse = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`);
        const aqiData = aqiResponse.ok ? await aqiResponse.json() : null;
        
        // Process and display data
        processWeatherData(currentData, forecastData, aqiData);
        hideError();
        
        // Add to search history
        addToSearchHistory(currentData.name);
        
        // Update map
        updateMapLocation(lat, lon, currentData.name);
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

function processWeatherData(currentData, forecastData, aqiData) {
    console.log("Processing weather data:", currentData, forecastData, aqiData);
    
    // Update city name
    cityName.textContent = currentData.name;
    
    // Update current weather
    temperature.textContent = `${Math.round(currentData.main.temp)}°`;
    description.textContent = currentData.weather[0].description;
    feelsLike.textContent = `${Math.round(currentData.main.feels_like)}°`;
    humidity.textContent = `${currentData.main.humidity}%`;
    windSpeed.textContent = `${currentData.wind.speed} m/s`;
    pressure.textContent = `${currentData.main.pressure} hPa`;
    
    // Update weather icon
    const weatherInfo = getWeatherIcon(currentData.weather[0].id, currentData.dt, currentData.sys.sunrise, currentData.sys.sunset);
    currentIcon.className = `wi ${weatherInfo.icon} ${weatherInfo.color}`;
    
    // Update additional info
    addHumidity.textContent = `${currentData.main.humidity}%`;
    
    // Calculate sunrise and sunset times
    const sunriseTime = new Date(currentData.sys.sunrise * 1000);
    const sunsetTime = new Date(currentData.sys.sunset * 1000);
    const timeOptions = { 
        hour: 'numeric', 
        minute: '2-digit'
    };
    sunrise.textContent = sunriseTime.toLocaleTimeString('en-US', timeOptions);
    sunset.textContent = sunsetTime.toLocaleTimeString('en-US', timeOptions);
    
    // Update hourly forecast
    updateHourlyForecast(forecastData);
    
    // Update daily forecast
    updateDailyForecast(forecastData);
    
    // Update air quality data
    updateAirQuality(aqiData);
}

function updateHourlyForecast(forecastData) {
    hourlyContainer.innerHTML = '';
    
    // Get next 8 time slots (3-hour intervals)
    for (let i = 0; i < 8; i++) {
        const forecast = forecastData.list[i];
        const date = new Date(forecast.dt * 1000);
        const timeOptions = { 
            hour: 'numeric'
        };
        const displayHour = date.toLocaleTimeString('en-US', timeOptions).replace(/:00 /, ' ');
        
        const weatherInfo = getWeatherIcon(forecast.weather[0].id, forecast.dt, 0, 0);
        
        const hourElement = document.createElement('div');
        hourElement.className = 'hourly-item';
        hourElement.innerHTML = `
            <div class="hour">${displayHour}</div>
            <div class="hour-icon"><i class="wi ${weatherInfo.icon} ${weatherInfo.color}"></i></div>
            <div class="hour-temp">${Math.round(forecast.main.temp)}°</div>
        `;
        hourlyContainer.appendChild(hourElement);
    }
}

function updateDailyForecast(forecastData) {
    dailyContainer.innerHTML = '';
    
    // Group forecasts by day
    const dailyForecasts = {};
    forecastData.list.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const day = date.toDateString();
        
        if (!dailyForecasts[day]) {
            dailyForecasts[day] = {
                temps: [],
                weatherIds: [],
                date: date
            };
        }
        
        dailyForecasts[day].temps.push(forecast.main.temp);
        dailyForecasts[day].weatherIds.push(forecast.weather[0].id);
    });
    
    // Get next 5 days (excluding today)
    const today = new Date().toDateString();
    let dayCount = 0;
    
    for (const day in dailyForecasts) {
        if (day !== today && dayCount < 5) {
            const dayData = dailyForecasts[day];
            const high = Math.round(Math.max(...dayData.temps));
            const low = Math.round(Math.min(...dayData.temps));
            
            // Get most common weather condition for the day
            const mostCommonWeatherId = getMostFrequent(dayData.weatherIds);
            const weatherInfo = getWeatherIcon(mostCommonWeatherId, dayData.date.getTime()/1000, 0, 0);
            
            const dateOptions = { 
                month: 'short', 
                day: 'numeric'
            };
            const dateStr = dayData.date.toLocaleDateString('en-US', dateOptions);
            
            const dayOptions = { 
                weekday: 'short'
            };
            const dayStr = dayData.date.toLocaleDateString('en-US', dayOptions);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'daily-item';
            dayElement.innerHTML = `
                <div class="date-month">${dateStr}</div>
                <div class="day">${dayStr}</div>
                <div class="daily-icon"><i class="wi ${weatherInfo.icon} ${weatherInfo.color}"></i></div>
                <div class="daily-temps">
                    <div class="daily-high">${high}°</div>
                    <div class="daily-low">${low}°</div>
                </div>
            `;
            dailyContainer.appendChild(dayElement);
            
            dayCount++;
        }
    }
}

function updateAirQuality(aqiData) {
    if (!aqiData) {
        aqiValue.textContent = '';
        aqiStatus.textContent = 'Data unavailable';
        aqiStatus.className = 'aqi-status';
        return;
    }
    
    const aqi = aqiData.list[0].main.aqi;
    
    aqiValue.textContent = '';
    
    let status, statusClass;
    
    switch(aqi) {
        case 1:
            status = 'Good';
            statusClass = 'aqi-good';
            break;
        case 2:
            status = 'Fair';
            statusClass = 'aqi-moderate';
            break;
        case 3:
            status = 'Moderate';
            statusClass = 'aqi-unhealthy-sensitive';
            break;
        case 4:
            status = 'Poor';
            statusClass = 'aqi-unhealthy';
            break;
        case 5:
            status = 'Very Poor';
            statusClass = 'aqi-very-unhealthy';
            break;
        default:
            status = 'Unknown';
            statusClass = '';
    }
    
    aqiStatus.textContent = status;
    aqiStatus.className = `aqi-status ${statusClass}`;
}

function getWeatherIcon(weatherId, currentTime, sunrise, sunset) {
    const isDay = currentTime > sunrise && currentTime < sunset;
    
    // Thunderstorm
    if (weatherId >= 200 && weatherId < 300) {
        return { icon: 'wi-thunderstorm', color: 'rainy' };
    }
    // Drizzle
    else if (weatherId >= 300 && weatherId < 400) {
        return { icon: 'wi-sprinkle', color: 'rainy' };
    }
    // Rain
    else if (weatherId >= 500 && weatherId < 600) {
        if (weatherId < 510) {
            return { icon: 'wi-rain', color: 'rainy' };
        } else {
            return { icon: 'wi-rain-mix', color: 'rainy' };
        }
    }
    // Snow
    else if (weatherId >= 600 && weatherId < 700) {
        return { icon: 'wi-snow', color: 'snowy' };
    }
    // Atmosphere
    else if (weatherId >= 700 && weatherId < 800) {
        return { icon: 'wi-fog', color: 'cloudy' };
    }
    // Clear
    else if (weatherId === 800) {
        if (isDay) {
            return { icon: 'wi-day-sunny', color: 'sunny' };
        } else {
            return { icon: 'wi-night-clear', color: 'night' };
        }
    }
    // Clouds
    else if (weatherId > 800 && weatherId < 900) {
        if (weatherId === 801) {
            if (isDay) {
                return { icon: 'wi-day-cloudy', color: 'cloudy' };
            } else {
                return { icon: 'wi-night-alt-cloudy', color: 'cloudy' };
            }
        } else if (weatherId === 802) {
            return { icon: 'wi-cloud', color: 'cloudy' };
        } else {
            return { icon: 'wi-cloudy', color: 'cloudy' };
        }
    }
    // Default
    else {
        return { icon: 'wi-day-sunny', color: 'sunny' };
    }
}

function getMostFrequent(arr) {
    const frequency = {};
    let maxCount = 0;
    let mostFrequent;
    
    for (const item of arr) {
        frequency[item] = (frequency[item] || 0) + 1;
        if (frequency[item] > maxCount) {
            maxCount = frequency[item];
            mostFrequent = item;
        }
    }
    
    return mostFrequent;
}

// Event Listeners
searchBtn.addEventListener('click', getWeatherByCity);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') getWeatherByCity();
});
locationBtn.addEventListener('click', getWeatherByLocation);
themeToggle.addEventListener('click', toggleTheme);

// Initialize app
loadThemePreference();
loadSearchHistory();
initMap();
updateCurrentDateTime(currentTimezone);
