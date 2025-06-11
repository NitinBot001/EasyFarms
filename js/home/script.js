document.addEventListener("DOMContentLoaded", () => {
  // OpenWeatherMap API configuration
  const apiKey = "cd3bae905c269a9e47a04f58a0528b1b" // You'll need to add your API key here
   // Default city, can be changed or made dynamic

  async function getDistrictFromLocation() {
    // Replace with your OpenCage API key
    const OPENCAGE_API_KEY = 'e997d5eb9caf42faaecfdeae177ae3bc';

    try {
        // Get current position
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        // Extract coordinates
        const { latitude, longitude } = position.coords;

        // OpenCage API request
        const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${OPENCAGE_API_KEY}&language=en&pretty=1`
        );

        if (!response.ok) {
            throw new Error('Geocoding request failed');
        }

        const data = await response.json();

        // Extract district information
        const components = data.results[0]?.components;
        if (!components) {
            throw new Error('No location data found');
        }

        // District might be called county, state_district, or region depending on location
        const district = components.city || components.city_district;
        
        if (!district) {
            console.warn('District not found in response:', components);
            return null;
        }

        return district;

    } catch (error) {
        console.error('Error getting district:', error);
        return null;
    }
}

// let city ;

// Usage example
getDistrictFromLocation().then((district) => {
    if (district) {
        // console.log('District:', district);
        city = district;
        fetchWeather();
    } else {
        console.warn('District not found');
    }
});
  // Get weather container
  const weatherContainer = document.getElementById("weather-container")

  // Weather icon mapping
  const weatherIcons = {
    "01d": createSunnyIcon,
    "01n": createSunnyIcon,
    "02d": createPartlyCloudyIcon,
    "02n": createPartlyCloudyIcon,
    "03d": createCloudyIcon,
    "03n": createCloudyIcon,
    "04d": createCloudyIcon,
    "04n": createCloudyIcon,
    "09d": createRainyIcon,
    "09n": createRainyIcon,
    "10d": createRainyIcon,
    "10n": createRainyIcon,
    "11d": createRainyIcon,
    "11n": createRainyIcon,
    "13d": createSnowyIcon,
    "13n": createSnowyIcon,
    "50d": createCloudyIcon,
    "50n": createCloudyIcon,
  }

  // Fetch weather data
  async function fetchWeather() {
    try {
      // If API key is not provided, use mock data
      if (!apiKey) {
        console.warn("No API key provided. Using mock data.")
        renderMockWeather()
        return
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`,
      )

      if (!response.ok) {
        throw new Error("Weather data not available")
      }

      const data = await response.json()
      renderWeather(data)
    } catch (error) {
      console.error("Error fetching weather:", error)
      weatherContainer.innerHTML = `<div class="error">Failed to load weather data. ${error.message}</div>`
      // Fallback to mock data
      renderMockWeather()
    }
  }

  // Render weather data from API
  function renderWeather(data) {
    // Clear loading message
    weatherContainer.innerHTML = ""

    // Get the first 5 forecast items (or fewer if not available)
    const forecastItems = data.list.slice(0, 5)

    forecastItems.forEach((item) => {
      const date = new Date(item.dt * 1000)
      const hours = date.getHours()
      const minutes = date.getMinutes()
      const temp = Math.round(item.main.temp)
      const iconCode = item.weather[0].icon

      const card = document.createElement("div")
      card.className = "weather-card"

      // Create weather icon based on condition
      const iconFunction = weatherIcons[iconCode] || createCloudyIcon
      const weatherIcon = iconFunction()

      card.innerHTML = `
                <div class="weather-icon ${getWeatherClass(iconCode)}">${weatherIcon}</div>
                <div class="weather-temp">${temp}°C</div>
                <div class="weather-time">${formatTime(hours, minutes)}</div>
            `

      weatherContainer.appendChild(card)
    })
  }

  // Render mock weather data when API key is not available
  function renderMockWeather() {
    weatherContainer.innerHTML = ""

    const mockData = [
      { icon: "partly-cloudy", temp: 36, time: "12:00" },
      { icon: "rainy", temp: 36, time: "12:00" },
      { icon: "sunny", temp: 36, time: "12:00" },
      { icon: "cloudy", temp: 36, time: "12:00" },
      { icon: "snowy", temp: 36, time: "12:00" },
    ]

    mockData.forEach((item) => {
      const card = document.createElement("div")
      card.className = "weather-card"

      let iconSvg
      switch (item.icon) {
        case "sunny":
          iconSvg = createSunnyIcon()
          break
        case "partly-cloudy":
          iconSvg = createPartlyCloudyIcon()
          break
        case "cloudy":
          iconSvg = createCloudyIcon()
          break
        case "rainy":
          iconSvg = createRainyIcon()
          break
        case "snowy":
          iconSvg = createSnowyIcon()
          break
        default:
          iconSvg = createCloudyIcon()
      }

      card.innerHTML = `
                <div class="weather-icon ${item.icon}">${iconSvg}</div>
                <div class="weather-temp">${item.temp}°C</div>
                <div class="weather-time">${item.time}</div>
            `

      weatherContainer.appendChild(card)
    })
  }

  // Format time to HH:MM
  function formatTime(hours, minutes) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
  }

  // Get weather class based on icon code
  function getWeatherClass(iconCode) {
    if (iconCode.startsWith("01") || iconCode.startsWith("02")) {
      return "clear"
    } else if (iconCode.startsWith("03") || iconCode.startsWith("04") || iconCode.startsWith("50")) {
      return "clouds"
    } else if (iconCode.startsWith("09") || iconCode.startsWith("10") || iconCode.startsWith("11")) {
      return "rain"
    } else if (iconCode.startsWith("13")) {
      return "snow"
    }
    return ""
  }

  // SVG Icon creators
  function createSunnyIcon() {
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" stroke-width="3"/>
            <path d="M50,15 L50,25 M50,75 L50,85 M15,50 L25,50 M75,50 L85,50 M26,26 L33,33 M67,67 L74,74 M26,74 L33,67 M67,33 L74,26" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
        </svg>`
  }

  function createCloudyIcon() {
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M25,60 C15,60 15,45 25,45 C25,35 40,30 50,40 C60,30 75,35 75,50 C85,50 85,65 75,65 C75,65 25,65 25,60 Z" fill="none" stroke="currentColor" stroke-width="3"/>
        </svg>`
  }

  function createPartlyCloudyIcon() {
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="35" cy="35" r="15" fill="none" stroke="currentColor" stroke-width="3"/>
            <path d="M35,10 L35,20 M10,35 L20,35 M17,17 L24,24 M17,53 L24,46 M53,17 L46,24" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
            <path d="M25,65 C15,65 15,50 25,50 C25,40 40,35 50,45 C60,35 75,40 75,55 C85,55 85,70 75,70 C75,70 25,70 25,65 Z" fill="none" stroke="currentColor" stroke-width="3"/>
        </svg>`
  }

  function createRainyIcon() {
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M25,50 C15,50 15,35 25,35 C25,25 40,20 50,30 C60,20 75,25 75,40 C85,40 85,55 75,55 C75,55 25,55 25,50 Z" fill="none" stroke="currentColor" stroke-width="3"/>
            <path d="M30,65 L25,75 M45,65 L40,75 M60,65 L55,75 M75,65 L70,75" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
        </svg>`
  }

  function createSnowyIcon() {
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M25,50 C15,50 15,35 25,35 C25,25 40,20 50,30 C60,20 75,25 75,40 C85,40 85,55 75,55 C75,55 25,55 25,50 Z" fill="none" stroke="currentColor" stroke-width="3"/>
            <path d="M30,65 L30,75 M28,67 L32,73 M32,67 L28,73" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M45,65 L45,75 M43,67 L47,73 M47,67 L43,73" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M60,65 L60,75 M58,67 L62,73 M62,67 L58,73" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M75,65 L75,75 M73,67 L77,73 M77,67 L73,73" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>`
  }

  // Initialize weather data

  // Add click events to nav items
  const navItems = document.querySelectorAll(".nav-item")
  navItems.forEach((item) => {
    item.addEventListener("click", function () {
      navItems.forEach((nav) => nav.classList.remove("active"))
      this.classList.add("active")
    })
  })
})


function diseaseDetection(){
  window.location.href = "plant-disease-detection/disease.html";
};
function warehousefinder(){
  window.location.href = "find-warehouse/index.html";
};