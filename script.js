var key = "03cc016fcf3f14da5a92c32d1b8f7bd6";
var cityCounter = 0;
var sameCity = false;

// Import current date
var currentDate = new Date();
$("#current-month").text((currentDate.getMonth() + 1) + "/");
$("#current-day").text(currentDate.getDate() + "/");
$("#current-year").text(currentDate.getFullYear());
console.log(currentDate);

// Import five days in the future
for (var i = 1; i <= 5; i++) {
    currentDate.setDate(currentDate.getDate() + i);
    $("#month" + i).text(currentDate.getMonth() + 1 + "/");
    $("#day" + i).text(currentDate.getDate() + "/");
    $("#year" + i).text(currentDate.getFullYear());
    currentDate.setDate(currentDate.getDate() - i);
}
// Import cities to search history from localStorage
if (localStorage.getItem("Searched Cities") !== null) {
    cityList = localStorage.getItem("Searched Cities").split(",");
    for (var i = 0; i < cityList.length; i++) {
        var searchedCityLink = $("<a>");
        searchedCityLink.attr("href", "#");
        searchedCityLink.addClass("city-list-button");
        var searchedCity = $("<li>");
        searchedCity.addClass("list-group-item");
        searchedCity.text(cityList[i]);
        searchedCityLink.append(searchedCity);
        $("#city-search-list").append(searchedCityLink);
    }
}
else {
    cityList = [];
    localStorage.setItem("Searched Cities", cityList);
}


// Clicking on search
$("#city-search-button").on("click", function (event) {
    currentCityWeather(event, $("#city-search").val().trim());
});

$(".list-group").on("click", function (event) {
    var target = event.target;
    console.log("target: " + target.innerHTML);
    
    if (target.matches("li")) {
        currentCityWeather(event, target.innerHTML);
    }
});

// Appends city weather and forecasts to screen
function currentCityWeather(e, cityInput) {
    e.preventDefault();
    $.ajax({
        url: "https://api.openweathermap.org/data/2.5/weather?q=" + cityInput + "&units=imperial&appid=" + key,
        async: false,
        method: "GET"
    }).then(function (currentResponse) {
        console.log(currentResponse);
        if (cityList.indexOf(currentResponse.name) === -1) {
            cityList.push(currentResponse.name);
            localStorage.setItem("Searched Cities", cityList);

            // Add 
            var searchedCityLink = $("<a>");
            searchedCityLink.attr("href", "#");
            searchedCityLink.addClass("city-list-button");
            var searchedCity = $("<li>");
            searchedCity.addClass("list-group-item");
            searchedCity.text(currentResponse.name);
            searchedCityLink.append(searchedCity);
            $("#city-search-list").append(searchedCityLink);
        }

        // City name
        console.log(currentResponse.name);
        $("#city-name").text(currentResponse.name);

        // City current temperature
        console.log(Math.round(currentResponse.main.temp) + " °F");
        $("#city-temp-current").text(Math.round(currentResponse.main.temp) + " °F (" +
        Math.round((currentResponse.main.temp - 32) * (5/9)) + " °C)");

        // City current humidity
        console.log(currentResponse.main.humidity + "%");
        $("#city-humidity-current").text(currentResponse.main.humidity + "%");

        // City current wind speed
        console.log(Math.round(currentResponse.wind.speed) + "mph");
        $("#city-wind-current").text(Math.round(currentResponse.wind.speed) + " mph (" +
        Math.round((currentResponse.wind.speed) * 0.44704) + " m/s)");

        
        $("#city-direction-current").text(degreesToCompass(currentResponse.wind.deg));

        // Current weather icon
        var iconCode = currentResponse.weather[0].icon;
        var iconURL = "https://openweathermap.org/img/w/" + iconCode + ".png";
        console.log(iconURL);
        $("#current-icon").attr("src", iconURL);

        // City coordinates
        var currentLatitude = currentResponse.coord.lat;
        var currentLongitude = currentResponse.coord.lon;
        console.log(currentLatitude + ", " + currentLongitude);

        // Dark or light mode depending on time of day
        var sunriseTimeStamp = new Date(currentResponse.sys.sunrise * 1000);
        var sunsetTimeStamp = new Date(currentResponse.sys.sunset * 1000);

        console.log("Sunrise: " + sunriseTimeStamp);
        console.log("Sunset: " + sunsetTimeStamp);
        console.log(currentDate);

        
        if (currentDate >= sunriseTimeStamp && currentDate < sunsetTimeStamp) {
            console.log("Day time");
            $("#search-sidebar").addClass("bg-light").removeClass("bg-dark");
            $("#main").addClass("bg-light").removeClass("bg-dark");
            $("body").css({ "background-color": "white", "color": "black" });
        }

        
        else {
            console.log("Night time");
            $("#search-sidebar").addClass("bg-dark").removeClass("bg-light");
            $("#main").addClass("bg-dark").removeClass("bg-light");
            $("body").css({ "background-color": "#222222", "color": "white" });
        }

        forecastedCityWeather(e, currentLatitude, currentLongitude);
    }).catch(function (error) {
        $("#error-message").text("City not found.");
    });
}


function degreesToCompass(degree) {
    var val = Math.floor((degree / 22.5) + 0.5);
    var arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    return arr[(val % 16)];
}

function forecastedCityWeather(e, latitude, longitude) {
    e.preventDefault();


    // 5 day forecasts
    $.ajax({
        url: "api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API key}",
        async: false,
        method: "GET"
    }).then(function (forecastedResponse) {
        console.log(forecastedResponse);

        // City current uv index
        console.log(forecastedResponse.current.uvi);
        $("#city-uv-current").text(forecastedResponse.current.uvi);

        for (var i = 1; i <= 5; i++) {
            console.log("Day " + i + " temp: " + Math.round(forecastedResponse.daily[i].temp.day) + " °F (" +
            Math.round((forecastedResponse.daily[i].temp.day - 32) * (5/9)) + " °C)");
            $("#day" + i + "-temp").text(Math.round(forecastedResponse.daily[i].temp.day) + " °F (" +
            Math.round((forecastedResponse.daily[i].temp.day - 32) * (5/9)) + " °C)");

            console.log("Day " + i + " humidity: " + forecastedResponse.daily[i].humidity + "%");
            $("#day" + i + "-humidity").text(forecastedResponse.daily[i].humidity + "%");

            var iconCode = forecastedResponse.daily[i].weather[0].icon;
            var iconURL = "https://openweathermap.org/img/w/" + iconCode + ".png";
            console.log(iconURL);
            $("#day" + i + "-icon").attr("src", iconURL);
        }
    }).catch(function (error) {
        $("#error-message").text("City not found.");
    })
}