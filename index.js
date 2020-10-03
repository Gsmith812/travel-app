"use strict";

const apiKeyRapid = "583ca639f9msh2485b7c56c251aap137d5bjsn5fb3b724e00f";
const apiKeyZom = "af7764942e15c7d2bff6391d65fd21c8";
let coordinates = [];
let locationId = "";
let locationName = "";
//Display functions

function displayLocation(response) {
    console.log(response);
    coordinates.push(response.data[0].result_object.latitude, response.data[0].result_object.longitude);
    //console.log(coordinates);
    locationId = response.data[0].result_object.location_id;
    locationName = response.data[0].result_object.name;
    console.log(locationId);
    $("#location-description").empty();
    $("#results").empty();
    $("#location-description").append(
        `
        <h2>${locationName}</h2>
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
    $("#results").append(`<h2>List of Restaurants nearby ${response.location.city_name}</h2>`);
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

function displayThingsToDo(response) {
    console.log(response);
    $("#results").empty();
    $("#results").append(`<h2>List of top Things to Do in ${locationName}</h2>`);
    for(let i = 0; i < response.data.length; i++) {
        if(response.data[i].location_id > 34515 && response.data[i].description !== "" && response.data[i].photo !== undefined) {
            $("#results").append(
                `
                <div class="results-item">
                    <h4>${response.data[i].name}</h4>
                    <img src="${response.data[i].photo.images.medium.url}" alt="${response.data[i].photo.caption}">
                    <p>${response.data[i].description}<p>
                    <p>Address: ${response.data[i].address}</p>
                    <p>Phone Number: ${response.data[i].phone}</p>
                    <p><a href="${response.data[i].website}" target="_blank">Website</a></p>
                </div>
                `
            );
        }
        else {
            console.log("Filtered Result");
        }
        
    }
    $("#results").removeClass("hidden");
}

function createLengthOfStayForm(data) {
    const destinationId = data.suggestions[0].entities[0].destinationId
    const currentDate = new Date();
    $("#results").empty();
    $("#results").append(
        `
        <div class="results-form">
            <h3>Just need a little more information...</h3>
            <form id="length-of-stay">
                <label for="check-in">Check-In Date:</label> 
                <input type="date" id="check-in" class="checkIn" value="${currentDate}" min="${currentDate}" required>
                <label for="check-out">Check-Out Date:</label>
                <input type="date" id="check-out" class="checkOut" value="${currentDate}" min="${currentDate}" required>
                <label for="adults">Number of Adults:</label>
                <input type="number" id="adults" class="numberAdults" value="2" min="0" max="8" required>
                <button type="submit" id="js-hotels-submit">Search for Places</button>
            </form>
        </div>
        <div id="results-list">
            <h3>List of places to stay:</h3>
        </div>
        `
    )
    $("#results").removeClass("hidden");
    handleHotelsButton(destinationId);
}

function displayHotelsList(data) {
    console.log(data);
    if(data.result !== "OK") {
        alert("Search failed!");
    }
    else {
        let resultsList = data.data.body.searchResults.results
        for(let i = 0; i < resultsList.length; i++) {
            console.log(resultsList[i]);
            $("#results-list").append( 
                `
                <div class="results-item">
                    <h4>${resultsList[i].name}</h4>
                    <img src="${resultsList[i].thumbnailUrl}" alt="Thumbnail picture of property">
                    <p>Rating: ${resultsList[i].guestReviews.unformattedRating} out of ${resultsList[i].guestReviews.scale} - ${resultsList[i].guestReviews.badgeText} - From ${resultsList[i].guestReviews.total} Reviews</p>
                    <p>Area: ${resultsList[i].neighbourhood}</p>
                    <p>Address: ${resultsList[i].address.streetAddress}, ${resultsList[i].address.locality} , ${resultsList[i].address.postalCode}</p>
                    <p>Average Nightly Price: ${resultsList[i].ratePlan.price.current} per night</p>
                </div>
                `
            );
        }
    }
    
        
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
        .catch(err => alert(`Something went wrong: Not enough information - ${err.message}`));
}

function getThingsToDo() {
    const url = `https://tripadvisor1.p.rapidapi.com/attractions/list?lang=en_US&currency=USD&sort=ranking&lunit=km&limit=20&location_id=${encodeURIComponent(locationId)}`;
    const options = {
        headers: new Headers({
            "x-rapidapi-host": "tripadvisor1.p.rapidapi.com",
            "x-rapidapi-key": apiKeyRapid
        })
    };
    //console.log(url);
    fetch(url, options)
        .then(response => response.ok ? response.json() : Promise.reject({err: response.status}))
        .then(responseJson => displayThingsToDo(responseJson))
        .catch(err => console.log(`Something went wrong: ${err.message}`));
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
        .catch(err => alert(`Something went wrong: No restaurants found - ${err.message}`));
}

function getLocationId() {
    const url = `https://hotels4.p.rapidapi.com/locations/search?locale=en_US&query=${encodeURIComponent(locationName)}`
    const options = {
        headers: new Headers({
            "x-rapidapi-host": "hotels4.p.rapidapi.com",
            "x-rapidapi-key": apiKeyRapid
        })
    };
    fetch(url, options)
        .then(response => response.ok ? response.json() : Promise.reject({err: response.status}))
        .then(responseJson => createLengthOfStayForm(responseJson))
        .catch(err => alert(`Something went wrong: ${err.message}`));
}

function getHotelsList(checkIn, checkOut, numberAdults, destinationId) {
    const url = `https://hotels4.p.rapidapi.com/properties/list?currency=USD&locale=en_US&sortOrder=GUEST_RATING&destinationId=${destinationId}&pageNumber=1&checkIn=${checkIn}&checkOut=${checkOut}&pageSize=25&adults1=${numberAdults}`;
    const options = {
        headers: new Headers({
            "x-rapidapi-host": "hotels4.p.rapidapi.com",
            "x-rapidapi-key": apiKeyRapid
        })
    }
    fetch(url, options)
        .then(response => response.ok ? response.json() : Promise.reject({err: response.status}))
        .then(responseJson => displayHotelsList(responseJson))
        .catch(err => `Something went wrong: ${err.message}`);
}




//Event listeners

function handleHotelsButton(destinationId) {
    console.log(destinationId);
    $("#results").on("click", "#js-hotels-submit", event => {
        event.preventDefault();
        const checkIn = $(".checkIn").val();
        const checkOut = $(".checkOut").val();
        const numberAdults = $(".numberAdults").val();
        if(checkIn > checkOut) {
            alert("Check-In Date must be earlier than Check-Out Date")
        }
        else {
            getHotelsList(checkIn, checkOut, numberAdults, destinationId);
        }
    });

}

function handleAccommodationsClicked() {
    $("#location-description").on("click", "#accommodations", event => {
        event.preventDefault();
        getLocationId();
    });
}

function handleThingsToDoClicked() {
    $("#location-description").on("click", "#things-to-do", event => {
        event.preventDefault();
        getThingsToDo();
    });
}

function handleRestaurantsClicked() {
    $("#location-description").on("click", "#restaurants", event => {
        event.preventDefault();
        getRestaurants();
    });
}

function handleFindDestination() {
    $("form").submit(event => {
        coordinates = [];
        locationId = "";
        locationName = "";
        const userInput = $(".js-destination-input").val();
        event.preventDefault();
        getDestination(userInput);
        handleRestaurantsClicked();
        handleThingsToDoClicked();
        handleAccommodationsClicked();
    });
}

handleFindDestination();
