const API_KEY = 'f8d458054aa946baaa9220438262004';
const BASE_URL = 'https://api.weatherapi.com/v1';

const cityInput      = document.getElementById('city-input');
const searchBtn      = document.getElementById('search-btn');
const currentWeather = document.getElementById('current-weather');
const forecast       = document.getElementById('forecast');
const loading        = document.getElementById('loading');
const errorMsg       = document.getElementById('error');

function updateSkyModeByLocalTime() {
  const hour = new Date().getHours();
  const isDayTime = hour >= 6 && hour < 18;

  document.body.classList.toggle('is-day', isDayTime);
  document.body.classList.toggle('is-night', !isDayTime);
}

cityInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    searchBtn.click();
  }
});

window.addEventListener('DOMContentLoaded', () => {
  updateSkyModeByLocalTime();
  setInterval(updateSkyModeByLocalTime, 60000);

  const lastCity = localStorage.getItem('lastCity');
  if (lastCity) {
    cityInput.value = lastCity;
    searchBtn.click();
  }
});

searchBtn.addEventListener('click', async () => {
  const city = cityInput.value.trim();

  if (city === '') {
    showError('Please enter a city name');
    return;
  }

  clearResults();
  hideError();
  showLoading();

  try {
    const url = `${BASE_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(city)}&days=4`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      const message = errorData.error?.message || 'Something went wrong';
      throw new Error(message);
    }

    const data = await response.json();
    console.log('API Response:', data);

    displayCurrentWeather(data);
    displayForecast(data);

    localStorage.setItem('lastCity', data.location.name);

  } catch (error) {
    console.error('Error:', error.message);
    showError(error.message);
  } finally {
    hideLoading();
  }
});

function showLoading() {
  loading.classList.remove('hidden');
}

function hideLoading() {
  loading.classList.add('hidden');
}

function showError(message) {
  errorMsg.textContent = message;
  errorMsg.classList.remove('hidden');
}

function hideError() {
  errorMsg.classList.add('hidden');
  errorMsg.textContent = '';
}

function clearResults() {
  currentWeather.innerHTML = '';
  forecast.innerHTML = '';
}

function displayCurrentWeather(data) {
  const { location, current } = data;

  currentWeather.innerHTML = `
    <div class="current-card">
      <h2>${location.name}, ${location.country}</h2>
      <img src="https:${current.condition.icon}" alt="${current.condition.text}" />
      <p class="temp">${Math.round(current.temp_c)}°C</p>
      <p class="condition">${current.condition.text}</p>
    </div>
  `;
}

function displayForecast(data) {
  const next3Days = data.forecast.forecastday.slice(1, 4);

  const forecastHTML = next3Days.map(day => {
    const dateObj = new Date(day.date + 'T00:00:00');
    const dateStr = dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month:   'short',
      day:     'numeric'
    });

    return `
      <div class="forecast-day">
        <p class="date">${dateStr}</p>
        <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}" />
        <p class="temp">${Math.round(day.day.avgtemp_c)}°C</p>
        <p class="condition">${day.day.condition.text}</p>
      </div>
    `;
  }).join('');

  forecast.innerHTML = `
    <h3 class="forecast-title">3-Day Forecast</h3>
    <div class="forecast-days">
      ${forecastHTML}
    </div>
  `;
}
