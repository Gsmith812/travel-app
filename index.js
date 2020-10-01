"use strict";

const apiKeyRapid = "583ca639f9msh2485b7c56c251aap137d5bjsn5fb3b724e00f";
const apiKeyZom = "af7764942e15c7d2bff6391d65fd21c8";
let coordinates = [];
//Display functions

function displayLocation(response) {
    //console.log(response);
    coordinates.push(response.data[0].result_object.latitude, response.data[0].result_object.longitude);
    //console.log(coordinates);
    $("#location-description").empty();
    $("#results").empty();
    $("#location-description").append(
        `
        <h2>${response.data[0].result_object.name}</h2>
        <img src="${response.data[0].result_object.photo.images.large.url}" alt="Picture of ${response.data[0].result_object.name}">
        <p>${response.data[0].result_object.geo_description}</p>
        <p>What information would you like to find for ${response.data[0].result_object.name} (Choose one of the following):</p>
        <button type="button" id="restaurants">Restaurants</button>
        <button type="button" id="things-to-do">Things to Do</button>
        <button type="button" id="accommodations">Accommodations</button>
        `
    );
    $("#location-description").removeClass("hidden");
}

function displayRestaurants(response) {
    //console.log(response);
    $("#results").empty();
    $("#results").append(`List of Restaurants nearby ${response.location.city_name}`);
    for(let i = 0; i < response.nearby_restaurants.length; i++) {
        //console.log(response.nearby_restaurants[i]);
        $("#results").append(
            `
            <div class="results-item">
                <h4>Name of Restaurant: ${response.nearby_restaurants[i].restaurant.name}</h4>
                <img src="images/restaurant-img.jpg" alt="Stock photo of food dishes">
                <p>Type of Cuisines: ${response.nearby_restaurants[i].restaurant.cuisines}</p>
                <p>Average Price(for 2 people): ${response.nearby_restaurants[i].restaurant.currency}${response.nearby_restaurants[i].restaurant.average_cost_for_two}</p>
                <p>Address: ${response.nearby_restaurants[i].restaurant.location.address}</p>
                <p>Rating: ${response.nearby_restaurants[i].restaurant.user_rating.rating_text} from ${response.nearby_restaurants[i].restaurant.user_rating.votes} people's votes.</p>
                <p><a href="${response.nearby_restaurants[i].restaurant.menu_url}" target="_blank">Menu</a><a href="${response.nearby_restaurants[i].restaurant.url}" target="_blank">More info..</a></p>
            </div>
            `
        );
    }
    $("#results").removeClass("hidden");
}


//Fetch API functions (retrieve data)
function getDestination(location) {
    const url = `https://tripadvisor1.p.rapidapi.com/locations/search?location_id=1&limit=1&sort=relevance&offset=0&lang=en_US&currency=USD&units=km&query=${encodeURIComponent(location)}`;
    const options = {
        headers: new Headers({
            "x-rapidapi-host": "tripadvisor1.p.rapidapi.com",
            "x-rapidapi-key": apiKeyRapid
        })
    };
    fetch(url, options)
        .then(response => response.ok ? response.json() : Promise.reject({err: response.status}))
        .then(responseJson => displayLocation(responseJson))
        .catch(err => alert(`Something went wrong: ${err.message}`));
}

function getRestaurants() {
    const url = `https://developers.zomato.com/api/v2.1/geocode?lat=${coordinates[0]}&lon=${coordinates[1]}`;
    const options = {
        headers: new Headers({
            "Accept": "application/json",
            "user-key": apiKeyZom
        })
    };
    fetch(url, options)
        .then(response => response.ok ? response.json() : Promise.reject({err: response.status}))
        .then(responseJson => displayRestaurants(responseJson))
        .catch(err => alert(`Something went wrong: ${err.message}`));
}


//Event listeners

function handleRestaurantsClicked() {
    $("#location-description").on("click", "#restaurants", event => {
        event.preventDefault();
        getRestaurants();
    });
}

function handleFindDestination() {
    $("form").submit(event => {
        coordinates = [];
        const userInput = $(".js-destination-input").val();
        event.preventDefault();
        getDestination(userInput);
        handleRestaurantsClicked();
    });
}

handleFindDestination();
