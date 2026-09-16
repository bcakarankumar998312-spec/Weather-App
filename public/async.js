let isLoading = false;

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const temp = document.getElementById("temperature");
const cities = document.getElementById("city");
const humidity = document.getElementById("humidity");
const description = document.getElementById("description");
const weatherIcon = document.getElementById("WeatherIcon");
const feelsLike = document.getElementById("feels_like");
const windSpeed = document.getElementById("wind-speed");

const unitBtn = document.getElementById("unitBtn");
const searchHistoryList = document.getElementById("searchHistory");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const locationBtn = document.getElementById("locationBtn");

let currentCity = "";
let currentLocation = null;

let searchHistory = [
    ...new Set(JSON.parse(localStorage.getItem("searchHistory")) || [])
];

let units = "metric";

// PUT YOUR NEW OPENWEATHER API KEY HERE



// =========================
// Unit Toggle
// =========================

unitBtn.addEventListener("click", () => {

    if (units === "metric") {
        units = "imperial";
    } else {
        units = "metric";
    }

    if (currentCity !== "") {
        searchWeather();
    } 
    else if (currentLocation !== null) {
        getWeatherByLocation()
            .then((data) => {
                displayWeather(data);
            })
            .catch((error) => {
                handleWeatherError(error);
            });
    }

    unitBtn.textContent =
        units === "metric" ? "Switch to °F" : "Switch to °C";
});

unitBtn.textContent =
    units === "metric" ? "Switch to °F" : "Switch to °C";


// =========================
// Search Events
// =========================

cityInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        searchWeather();
    }
});

searchBtn.addEventListener("click", () => {
    searchWeather();
});


// =========================
// Search Weather By City
// =========================

function searchWeather() {

    if (isLoading) {
        return;
    }

    const city = cityInput.value.trim();

    if (city === "") {
        alert("Please enter city name!");
        return;
    }

    currentCity = city;
    currentLocation = null;

    searchBtn.disabled = true;
    searchBtn.textContent = "Loading...";
    isLoading = true;

    cities.textContent = "Loading...";
    temp.textContent = "";
    humidity.textContent = "";
    description.textContent = "";
    weatherIcon.src = "";
    feelsLike.textContent = "";
    windSpeed.textContent = "";

    const url = `/weather?city=${encodeURIComponent(city)}&units=${units}`;

    getWeatherData(url)
        .then((data) => {

            displayWeather(data);

            if (!searchHistory.includes(data.name)) {
                searchHistory.push(data.name);
            }

            localStorage.setItem(
                "searchHistory",
                JSON.stringify(searchHistory)
            );

            renderSearchHistory();
        })
        .catch((error) => {

            handleWeatherError(error);

        })
        .finally(() => {

            searchBtn.disabled = false;
            searchBtn.textContent = "Search";
            isLoading = false;

        });
}


// =========================
// Fetch Weather Data
// =========================

async function getWeatherData(url) {

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
    }

    const data = await response.json();

    return data;
}


// =========================
// Display Weather
// =========================

function displayWeather(data) {

    cities.textContent = data.name;

    temp.textContent =
        `${Math.round(data.main.temp)}°${units === "metric" ? "C" : "F"}`;

    humidity.textContent =
        `Humidity = ${data.main.humidity}%`;

    description.textContent =
        data.weather[0].description;

    weatherIcon.src =
        `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    feelsLike.textContent =
        `Feels like = ${Math.round(data.main.feels_like)}°${units === "metric" ? "C" : "F"}`;

    windSpeed.textContent =
        `Wind speed = ${data.wind.speed.toFixed(1)}${units === "metric" ? "m/s" : "mph"} — ${getWindDirection(data.wind.deg)}`;
}


// =========================
// Error Handling
// =========================

function handleWeatherError(error) {

    if (error.message.includes("400")) {
        cities.textContent = "Invalid request";
    }
    else if (error.message.includes("401")) {
        cities.textContent = "Invalid or missing API key";
    }
    else if (error.message.includes("404")) {
        cities.textContent = "City not found";
    }
    else if (error.message.includes("429")) {
        cities.textContent =
            "Too many requests. Please try again later";
    }
    else if (error.message.includes("500")) {
        cities.textContent =
            "Weather service is having problems";
    }
    else {
        cities.textContent = "Something went wrong";
    }

    temp.textContent = "";
    humidity.textContent = "";
    description.textContent = "";
    weatherIcon.src = "";
    feelsLike.textContent = "";
    windSpeed.textContent = "";

    console.error(error);
}


// =========================
// Wind Direction
// =========================

function getWindDirection(deg) {

    if (deg >= 337.5 || deg < 22.5) {
        return "North";
    }
    else if (deg >= 22.5 && deg < 67.5) {
        return "NE";
    }
    else if (deg >= 67.5 && deg < 112.5) {
        return "East";
    }
    else if (deg >= 112.5 && deg < 157.5) {
        return "SE";
    }
    else if (deg >= 157.5 && deg < 202.5) {
        return "South";
    }
    else if (deg >= 202.5 && deg < 247.5) {
        return "SW";
    }
    else if (deg >= 247.5 && deg < 292.5) {
        return "West";
    }
    else if (deg >= 292.5 && deg < 337.5) {
        return "NW";
    }
    else {
        return "Other";
    }
}


// =========================
// Search History
// =========================

function renderSearchHistory() {

    searchHistoryList.innerHTML = "";

    for (let city of searchHistory) {

        const listItem = document.createElement("li");

        const historyBtn = document.createElement("button");
        const deleteBtn = document.createElement("button");

        historyBtn.textContent = city;
        deleteBtn.textContent = "X";

        historyBtn.addEventListener("click", () => {

            cityInput.value = city;
            searchWeather();

        });

        deleteBtn.addEventListener("click", () => {

            const index = searchHistory.indexOf(city);

            searchHistory.splice(index, 1);

            localStorage.setItem(
                "searchHistory",
                JSON.stringify(searchHistory)
            );

            renderSearchHistory();

        });

        listItem.appendChild(historyBtn);
        listItem.appendChild(deleteBtn);

        searchHistoryList.appendChild(listItem);
    }
}


// =========================
// Clear Search History
// =========================

clearHistoryBtn.addEventListener("click", () => {

    if (searchHistory.length === 0) {
        alert("No search history to clear.");
        return;
    }

    const confirmed = confirm(
        "Are you sure you want to clear all search history?"
    );

    if (!confirmed) {
        return;
    }

    searchHistory = [];

    localStorage.setItem(
        "searchHistory",
        JSON.stringify(searchHistory)
    );

    renderSearchHistory();
});


// =========================
// Get Weather By Location
// =========================

function getWeatherByLocation() {

    const latitude = currentLocation.latitude;
    const longitude = currentLocation.longitude;

    const url =
        `/weather/location?lat=${latitude}&lon=${longitude}&units=${units}`;

    return getWeatherData(url);
}


// =========================
// Get Current Location
// =========================

function getCurrentPosition() {

    cities.textContent = "Getting your location...";

    temp.textContent = "";
    humidity.textContent = "";
    description.textContent = "";
    weatherIcon.src = "";
    feelsLike.textContent = "";
    windSpeed.textContent = "";

    locationBtn.disabled = true;
    locationBtn.textContent = "Getting Location...";

    navigator.geolocation.getCurrentPosition(

        (position) => {

            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            currentLocation = {
                latitude,
                longitude
            };
            

            currentCity = "";

            getWeatherByLocation()
                .then((data) => {

                    displayWeather(data);

                })
                .catch((error) => {

                    handleWeatherError(error);

                })
                .finally(() => {

                    locationBtn.disabled = false;
                    locationBtn.textContent = "Use My Location";

                });
        },

        (error) => {

            cities.textContent =
                "Unable to get your location.";

            temp.textContent = "";
            humidity.textContent = "";
            description.textContent = "";
            weatherIcon.src = "";
            feelsLike.textContent = "";
            windSpeed.textContent = "";

            console.error(
                "Error getting location:",
                error.message
            );

            locationBtn.disabled = false;
            locationBtn.textContent = "Use My Location";
        }
    );
}


// =========================
// Location Button
// =========================

locationBtn.addEventListener("click", () => {
    getCurrentPosition();
});


// =========================
// App Startup
// =========================

// Automatically get current location
getCurrentPosition();

// Load saved search history
renderSearchHistory();