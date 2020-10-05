"use strict";

//Global stored values (Would like to create a global state object to store these in..)
const apiKeyRapid = "583ca639f9msh2485b7c56c251aap137d5bjsn5fb3b724e00f";
const apiKeyZom = "af7764942e15c7d2bff6391d65fd21c8";
let coordinates = [];
let locationId = "";
let locationName = "";
//Display functions

//Displays dynamically the description and name of the place inputted by the user
//Shows the other buttons required to navigate to useful information
function displayLocation(response) {
    const locationData = response.data[0].result_object;
    coordinates.push(locationData.latitude, locationData.longitude);
    locationId = locationData.location_id;
    locationName = locationData.name;
    $("#location-description").empty();
    $("#results").empty();
    $("#location-description").append(
        `
        <h2>${locationName}</h2>
        <img src="${locationData.photo.images.large.url}" alt="Picture of ${locationData.name}">
        <p>${locationData.geo_description}</p>
        <p>What information would you like to find for ${locationData.name} (Choose one of the following):</p>
        <button type="button" id="restaurants">Restaurants</button>
        <button type="button" id="things-to-do">Things to Do</button>
        <button type="button" id="accommodations">Accommodations</button>
        `
    );
    $("#location-description").removeClass("hidden");
}

//Displays a list of restaurants when the corresponding button is pressed
function displayRestaurants(response) {
    $("#results").empty();
    $("#results").append(`<h2>List of Restaurants nearby ${locationName}</h2>`);
    for(let i = 0; i < response.data.length; i++) {
        let restaurant = response.data[i];
        if(restaurant.photo === undefined || restaurant.description === "" || restaurant.price_level === "") {
            console.log("Results filtered...")
        }
        else {
            $("#results").append(
                `
                <div class="results-item">
                    <h4>Name of Restaurant: ${restaurant.name}</h4>
                    <img src="${restaurant.photo.images.medium.url}" alt="${restaurant.photo.caption}">
                    <p>${restaurant.description}</p>
                    <p>Price Level: ${restaurant.price_level}</p>
                    <p>Address: ${restaurant.address}</p>
                    <p>Rating: ${restaurant.rating} out of 5</p>
                    <p><a href="${restaurant.website}" target="_blank">Website</a></p>
                </div>
                `
            );
        }
        
    }
    $("#results").removeClass("hidden");
}

//Function controls displaying the html dynamically after the things to button is pressed
function displayThingsToDo(response) {
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
    if(data.result !== "OK") {
        alert("Search failed!");
    }
    else {
        let resultsList = data.data.body.searchResults.results
        for(let i = 0; i < resultsList.length; i++) {
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
    fetch(url, options)
        .then(response => response.ok ? response.json() : Promise.reject({err: response.status}))
        .then(responseJson => displayThingsToDo(responseJson))
        .catch(err => console.log(`Something went wrong: ${err.message}`));
} 

function getRestaurants() {
    const url = `https://tripadvisor1.p.rapidapi.com/restaurants/list?restaurant_tagcategory_standalone=10591&lunit=km&restaurant_tagcategory=10591&limit=30&currency=USD&lang=en_US&location_id=${locationId}`;
    const options = {
        headers: new Headers({
            "x-rapidapi-host": "tripadvisor1.p.rapidapi.com",
            "x-rapidapi-key": apiKeyRapid
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
    $("#results").on("click", "#js-hotels-submit", event => {
        event.preventDefault();
        const currentDate = new Date();
        const checkIn = $(".checkIn").val();
        const checkOut = $(".checkOut").val();
        const numberAdults = $(".numberAdults").val();
        if(checkIn > checkOut) {
            alert("Check-In Date must be earlier than Check-Out Date")
        }
        else if (new Date(checkIn) <= currentDate || new Date(checkOut) < currentDate) {
            alert("Check-In and Out dates cannot be in the past.")
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
