const citiesUrl = "city_coordinates.csv";

// Function to load cities data from a CSV file
const loadCities = async () => {
  try {
    const response = await fetch(citiesUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch csv: ${response.statusText}`);
    }

    const csvText = await response.text();
    const cities = csvToArray(csvText);

    populateCityDropdown(cities);
  } catch (error) {
    console.error("Error loading cities", error);
  }
};

// Function to convert CSV text to an array of objects
const csvToArray = (csvText) => {
  const rows = csvText.trim().split("\n");
  const headers = rows[0].split(",");

  // Remove header row from rows
  // Extract each row into an object
  const cities = rows.slice(1).map((row) => {
    const values = row.split(",");

    let city = {};

    headers.forEach((header, index) => {
      // city[header.trim()] = values[index].trim();
      city[header] = values[index];
    });

    return city;
  });

  return cities;
};

const populateCityDropdown = (cities) => {
  const citySelect = document.getElementById("citySelect");

  cities.forEach((city) => {
    const option = document.createElement("option");
    option.value = `${city.city}, ${city.country}`;
    option.textContent = `${city.city}, ${city.country}`;
    citySelect.appendChild(option);
  });
};

// Get weather data from the 7Timer API
const getWeather = async () => {
  const citySelect = document.getElementById("citySelect");
  const selectedCity = citySelect.value;

  if (!selectedCity) {
    alert("Please select a city.");
    return;
  }

  const [latitude, longitude] = selectedCity.split(",");

  const apiUrl = `https://www.7timer.info/bin/api.pl?lon=${latitude}&lat=${longitude}&product=civil&output=json`;

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch weather data: ${response.statusText}`);
    }

    const weatherData = await response.json();
    displayWeather(weatherData);
  } catch (error) {
    console.error("Error fetching weather data", error);
  }
};

const displayWeather = (weatherData) => {
  const weatherResults = document.getElementById("weatherResults");
  weatherResults.innerHTML = ""; // Clear previous results

  const initTime = weatherData.init;
  const initDate = new Date(
    initTime.slice(0, 4),
    parseInt(initTime.slice(4, 6)) - 1,
    initTime.slice(6, 8),
    initTime.slice(8, 10),
    initTime.slice(10, 12)
  );

  // Iterate over the dataseries
  weatherData.dataseries.forEach((day) => {
    // Calculate the time for this timepoint
    const forecastDate = new Date(initDate);
    forecastDate.setHours(forecastDate.getHours() + day.timepoint * 3); // Assuming timepoint is in 3-hour intervals

    // Create a new div for each day's weather information
    const weatherInfo = document.createElement("div");
    weatherInfo.classList.add("weather-card"); // Add class for styling

    // Format the weather data inside the box
    weatherInfo.innerHTML = `
          <div class="weather-header">
            <h3>${forecastDate.toLocaleDateString()}</h3> <!-- Only show the date -->
          </div>
          <div class="weather-content">
            <div class="weather-icon">
              <span class="icon">${getWeatherIcon(day.prec_type)}</span>
            </div>
            <div class="temperature">
              <span class="temp">${day.temp2m}°C</span>
            </div>
            <div class="description">
              <p>${day.temp2m < 10 ? "Cold" : "Warm"}</p>
            </div>
            <div class="cloud-cover">
              <p><strong>Cloud Cover:</strong> ${day.cloudcover}%</p>
            </div>
          </div>
        `;

    // Append the weather box to the results container
    weatherResults.appendChild(weatherInfo);
  });
};

// Function to choose weather icon based on temperature
const getWeatherIcon = (temp) => {
  if (temp < 10) {
    return "🌧️";
  } else if (temp >= 10 && temp < 20) {
    return "☀️";
  } else {
    return "🔥";
  }
};

loadCities();
