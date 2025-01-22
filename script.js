const apiKey = '60b24eeabebdecaa73431001ee7b5a06';
const weatherNow = document.querySelector('.weather-now');
const hourlyScroll = document.querySelector('.hourly-scroll');
const dailyScroll = document.querySelector('.daily-scroll');
const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');
const cityNameDisplay = document.getElementById('cityName');
const unitToggle = document.getElementById('unitToggle');
const geoBtn = document.getElementById('geoBtn');
const refreshBtn = document.getElementById('refreshBtn');
const aqiToggle = document.getElementById('aqiToggle');
const airQualitySection = document.getElementById('airQuality');
const aqiDisplay = document.getElementById('aqi');
const modeToggle = document.getElementById('modeToggle');
const dynamicBackground = document.getElementById('dynamicBackground');
let currentUnit = 'metric'; 
let currentCity = 'Tirupati'; 
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        currentCity = city;
        getWeather(city);
        getThreeHourForecast(city);
        getThreeDayForecast(city);
    }
});
unitToggle.addEventListener('click', () => {
    currentUnit = currentUnit === 'metric' ? 'imperial' : 'metric';
    unitToggle.textContent = currentUnit === 'metric' ? '°C / °F' : '°F / °C'
    getWeather(currentCity);
    getThreeHourForecast(currentCity);
    getThreeDayForecast(currentCity);
});
geoBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            getWeatherByCoords(latitude, longitude);
            getThreeHourForecastByCoords(latitude, longitude);
            getThreeDayForecastByCoords(latitude, longitude);
        }, () => {
            alert('Unable to retrieve your location.');
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});
refreshBtn.addEventListener('click', () => {
    getWeather(currentCity);
    getThreeHourForecast(currentCity);
    getThreeDayForecast(currentCity);
});
aqiToggle.addEventListener('click', () => {
    airQualitySection.classList.toggle('hidden');
    if (!airQualitySection.classList.contains('hidden')) {
        getAirQuality(currentCity);
    }
});
modeToggle.addEventListener('click', () => {
    document.body.classList.toggle('night-mode');
    document.body.classList.toggle('day-mode');
    modeToggle.textContent = document.body.classList.contains('night-mode') ? 'Night Mode' : 'Day Mode';
});
function getWeather(city) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${currentUnit}`)
        .then(response => response.json())
        .then(data => {
            if (data.cod !== 200) {
                alert(`City not found: ${city}`);
                return;
            }
            const { main, weather, wind, sys } = data;
            cityNameDisplay.textContent = data.name;
            document.getElementById('temp').textContent = `${Math.round(main.temp)}°${currentUnit === 'metric' ? 'C' : 'F'}`;
            document.getElementById('feelsLike').textContent = `${Math.round(main.feels_like)}°${currentUnit === 'metric' ? 'C' : 'F'}`;
            document.getElementById('weatherDescription').textContent = capitalizeFirstLetter(weather[0].description);
            document.getElementById('precip').textContent = `Precip: ${data.rain ? data.rain['1h'] || 0 : 0} mm`;
            document.getElementById('humidity').textContent = `Humidity: ${main.humidity}%`;
            document.getElementById('wind').textContent = `Wind: ${wind.speed} ${currentUnit === 'metric' ? 'm/s' : 'mph'}`;
            updateBackground(weather[0].main, sys.sunrise, sys.sunset);
        })
        .catch(error => console.error('Error fetching weather data:', error));
}

function getThreeHourForecast(city) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${currentUnit}`)
        .then(response => response.json())
        .then(data => {
            if (data.cod !== "200") {
                console.error('Error fetching forecast data:', data.message);
                return;
            }
            hourlyScroll.innerHTML = '';  // Clear previous content

            const hourlyData = data.list.slice(0, 3);  // Limit to first 3 intervals (3-hourly forecast)
            hourlyData.forEach(hour => {
                const hourlyElem = document.createElement('div');
                hourlyElem.innerHTML = `
                    <p>${formatHour(hour.dt_txt)}</p>
                    <img src="http://openweathermap.org/img/wn/${hour.weather[0].icon}.png" alt="Weather icon">
                    <p>${Math.round(hour.main.temp)}°${currentUnit === 'metric' ? 'C' : 'F'}</p>
                `;
                hourlyScroll.appendChild(hourlyElem);
            });
        })
        .catch(error => console.error('Error fetching 3-hour forecast data:', error));
}
function getThreeDayForecast(city) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${currentUnit}`)
        .then(response => response.json())
        .then(data => {
            if (data.cod !== "200") {
                console.error('Error fetching forecast data:', data.message);
                return;
            }
            dailyScroll.innerHTML = '';
            
            const dailyData = data.list.filter(item => item.dt_txt.includes('12:00:00')).slice(0, 3);
            dailyData.forEach(day => {
                const dailyElem = document.createElement('div');
                dailyElem.innerHTML = `
                    <p>${formatDate(day.dt_txt)}</p>
                    <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="Weather icon">
                    <p>${Math.round(day.main.temp)}°${currentUnit === 'metric' ? 'C' : 'F'}</p>
                `;
                dailyScroll.appendChild(dailyElem);
            });
        })
        .catch(error => console.error('Error fetching 3-day forecast data:', error));
}

function getWeatherByCoords(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${currentUnit}`)
        .then(response => response.json())
        .then(data => {
            if (data.cod !== 200) {
                alert(`Location not found.`);
                return;
            }
            const { main, weather, wind, sys } = data;
            cityNameDisplay.textContent = data.name;
            document.getElementById('temp').textContent = `${Math.round(main.temp)}°${currentUnit === 'metric' ? 'C' : 'F'}`;
            document.getElementById('feelsLike').textContent = `${Math.round(main.feels_like)}°${currentUnit === 'metric' ? 'C' : 'F'}`;
            document.getElementById('weatherDescription').textContent = capitalizeFirstLetter(weather[0].description);
            document.getElementById('precip').textContent = `Precip: ${data.rain ? data.rain['1h'] || 0 : 0} mm`;
            document.getElementById('humidity').textContent = `Humidity: ${main.humidity}%`;
            document.getElementById('wind').textContent = `Wind: ${wind.speed} ${currentUnit === 'metric' ? 'm/s' : 'mph'}`;
            updateBackground(weather[0].main, sys.sunrise, sys.sunset);
        })
        .catch(error => console.error('Error fetching weather by coordinates:', error));
}

function getThreeHourForecastByCoords(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${currentUnit}`)
        .then(response => response.json())
        .then(data => {
            if (data.cod !== "200") {
                console.error('Error fetching forecast data:', data.message);
                return;
            }
            hourlyScroll.innerHTML = '';  // Clear previous content

            const hourlyData = data.list.slice(0, 3);  // Limit to first 3 intervals (3-hourly forecast)
            hourlyData.forEach(hour => {
                const hourlyElem = document.createElement('div');
                hourlyElem.innerHTML = `
                    <p>${formatHour(hour.dt_txt)}</p>
                    <img src="http://openweathermap.org/img/wn/${hour.weather[0].icon}.png" alt="Weather icon">
                    <p>${Math.round(hour.main.temp)}°${currentUnit === 'metric' ? 'C' : 'F'}</p>
                `;
                hourlyScroll.appendChild(hourlyElem);
            });
        })
        .catch(error => console.error('Error fetching 3-hour forecast data:', error));
}

function getThreeDayForecastByCoords(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${currentUnit}`)
        .then(response => response.json())
        .then(data => {
            if (data.cod !== "200") {
                console.error('Error fetching forecast data:', data.message);
                return;
            }
            dailyScroll.innerHTML = '';  

            
            const dailyData = data.list.filter(item => item.dt_txt.includes('12:00:00')).slice(0, 3);
            dailyData.forEach(day => {
                const dailyElem = document.createElement('div');
                dailyElem.innerHTML = `
                    <p>${formatDate(day.dt_txt)}</p>
                    <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="Weather icon">
                    <p>${Math.round(day.main.temp)}°${currentUnit === 'metric' ? 'C' : 'F'}</p>
                `;
                dailyScroll.appendChild(dailyElem);
            });
        })
        .catch(error => console.error('Error fetching 3-day forecast data:', error));
}

// Fetch Air Quality Index
function getAirQuality(city) {
    // First, get the coordinates of the city
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            if (data.cod !== 200) {
                alert(`City not found: ${city}`);
                return;
            }
            const { coord } = data;
            fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${coord.lat}&lon=${coord.lon}&appid=${apiKey}`)
                .then(response => response.json())
                .then(aqiData => {
                    if (aqiData.cod !== '200') {
                        console.error('Error fetching AQI data:', aqiData.message);
                        return;
                    }
                    const aqi = aqiData.list[0].main.aqi;
                    const aqiText = getAqiText(aqi);
                    aqiDisplay.textContent = aqiText;
                })
                .catch(error => console.error('Error fetching AQI data:', error));
        })
        .catch(error => console.error('Error fetching coordinates for AQI:', error));
}

function getAqiText(aqi) {
    switch(aqi) {
        case 1:
            return 'Good';
        case 2:
            return 'Fair';
        case 3:
            return 'Moderate';
        case 4:
            return 'Poor';
        case 5:
            return 'Very Poor';
        default:
            return 'Unknown';
    }
}

function formatDate(dt_txt) {
    const date = new Date(dt_txt);
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
}

function formatHour(dt_txt) {
    const date = new Date(dt_txt);
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    return `${hours} ${ampm}`;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function updateBackground(weatherMain, sunrise, sunset) {
    const currentTime = Math.floor(Date.now() / 1000);
    const isDay = currentTime >= sunrise && currentTime < sunset;

    let backgroundImage = '';

    switch(weatherMain.toLowerCase()) {
        case 'clear':
            backgroundImage = isDay ? 'backgrounds/clear-day.png' : 'backgrounds/clear-night.png';
            break;
        case 'clouds':
            backgroundImage = isDay ? 'backgrounds/cloudy-day.png' : 'backgrounds/cloudy-night.png';
            break;
        case 'rain':
        case 'drizzle':
            backgroundImage = 'backgrounds/rain.png';
            break;
        case 'thunderstorm':
            backgroundImage = 'backgrounds/thunderstorm.png';
            break;
        case 'snow':
            backgroundImage = 'backgrounds/snow.png';
            break;
        case 'mist':
        case 'fog':
            backgroundImage = 'backgrounds/fog.png';
            break;
        default:
            backgroundImage = isDay ? 'backgrounds/clear-day.png' : 'backgrounds/clear-night.png';
    }

    dynamicBackground.src = backgroundImage;
}

getWeather(currentCity);
getThreeHourForecast(currentCity);
getThreeDayForecast(currentCity);