"use strict";

//Global stored values
let store = {
    coordinates : [],
    locationId : "",
    locationName : "",
    apiKeyRapid : "583ca639f9msh2485b7c56c251aap137d5bjsn5fb3b724e00f"
}
//Display functions

//Displays dynamically the description and name of the place inputted by the user
//Shows the other buttons required to navigate to useful information
function displayLocation(response) {
    const locationData = response.data[0].result_object;
    store.coordinates.push(locationData.latitude, locationData.longitude);
    store.locationId = locationData.location_id;
    store.locationName = locationData.name;
    let locationImg = locationData.photo.images.original.url
    $("#location-description").empty();
    $("#results").empty();
    console.log(response);
    if(response.data[0].result_type !== "geo") {
        alert("Unable to find Location, Please try again.");
    }
    else {
        $("#location-description").append(
            `
            <img src="${locationImg}" alt="${locationData.photo.caption}">
            <h2>${store.locationName}</h2>
            <p>${locationData.geo_description}</p>
            <div class="initial-buttons">
                <button type="button" id="restaurants">Restaurants</button>
                <button type="button" id="things-to-do">Things to Do</button>
                <button type="button" id="accommodations">Accommodations</button>
            </div>
            `
        );
        $("#location-description").removeClass("hidden");
    }
}

//Displays a list of restaurants when the corresponding button is pressed
function displayRestaurants(response) {
    $("#results").empty();
    for(let i = 0; i < response.data.length; i++) {
        let restaurant = response.data[i];
        if(restaurant.photo === undefined || restaurant.description === "" || restaurant.price_level === "") {
            console.log("Results filtered...")
        }
        else {
            $("#results").append(
                `
                <div class="results-item">
                    <h4>${restaurant.name}</h4>
                    <img src="${restaurant.photo.images.medium.url}" alt="${restaurant.photo.caption}">
                    <p>${restaurant.description}</p>
                    <p><b>Price Level:</b> ${restaurant.price_level}</p>
                    <p><b>Address:</b> ${restaurant.address}</p>
                    <p><b>Rating:</b> ${restaurant.rating} out of 5</p>
                    <p class="website"><a href="${restaurant.website}" target="_blank">Website</a></p>
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
    for(let i = 0; i < response.data.length; i++) {
        if(response.data[i].location_id > 34515 && response.data[i].description !== "" && response.data[i].photo !== undefined) {
            $("#results").append(
                `
                <div class="results-item">
                    <h4>${response.data[i].name}</h4>
                    <img src="${response.data[i].photo.images.medium.url}" alt="${response.data[i].photo.caption}">
                    <p>${response.data[i].description}<p>
                    <p><b>Address:</b> ${response.data[i].address}</p>
                    <p><b>Phone Number:</b> ${response.data[i].phone}</p>
                    <p class="website"><a href="${response.data[i].website}" target="_blank">Website</a></p>
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

//Creates the Form necessary to grab stay information from user
function createLengthOfStayForm(data) {
    const destinationId = data.suggestions[0].entities[0].destinationId
    const currentDate = new Date();
    $("#results").empty();
    $("#results").append(
        `
        <div class="results-form">
            <form id="length-of-stay">
                <label for="check-in">Check-In Date:</label> 
                <input type="date" id="check-in" class="checkIn" value="${currentDate}" min="${currentDate}" required>
                <label for="check-out">Check-Out Date:</label>
                <input type="date" id="check-out" class="checkOut" value="${currentDate}" min="${currentDate}" required>
                <label for="adults">Number of Adults:</label>
                <input type="number" id="adults" class="numberAdults" value="2" min="0" max="8" required>
                <button type="submit" id="js-hotels-submit">Search</button>
            </form>
        </div>
        <div id="results-list">
        </div>
        `
    )
    $("#results").removeClass("hidden");
    handleHotelsButton(destinationId);
}

//After user has inputted necessary info, displays list of accomodations
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
            "x-rapidapi-key": store.apiKeyRapid
        })
    };
    fetch(url, options)
        .then(response => response.ok ? response.json() : Promise.reject({err: response.status}))
        .then(responseJson => displayLocation(responseJson))
        .catch(err => alert(`Something went wrong: Not enough information - ${err.message}`));
}

function getThingsToDo() {
    const url = `https://tripadvisor1.p.rapidapi.com/attractions/list?lang=en_US&currency=USD&sort=ranking&lunit=km&limit=20&location_id=${encodeURIComponent(store.locationId)}`;
    const options = {
        headers: new Headers({
            "x-rapidapi-host": "tripadvisor1.p.rapidapi.com",
            "x-rapidapi-key": store.apiKeyRapid
        })
    };
    fetch(url, options)
        .then(response => response.ok ? response.json() : Promise.reject({err: response.status}))
        .then(responseJson => displayThingsToDo(responseJson))
        .catch(err => console.log(`Something went wrong: ${err.message}`));
} 

function getRestaurants() {
    const url = `https://tripadvisor1.p.rapidapi.com/restaurants/list?restaurant_tagcategory_standalone=10591&lunit=km&restaurant_tagcategory=10591&limit=30&currency=USD&lang=en_US&location_id=${store.locationId}`;
    const options = {
        headers: new Headers({
            "x-rapidapi-host": "tripadvisor1.p.rapidapi.com",
            "x-rapidapi-key": store.apiKeyRapid
        })
    };
    fetch(url, options)
        .then(response => response.ok ? response.json() : Promise.reject({err: response.status}))
        .then(responseJson => displayRestaurants(responseJson))
        .catch(err => alert(`Something went wrong: No restaurants found - ${err.message}`));
}

function getLocationId() {
    const url = `https://hotels4.p.rapidapi.com/locations/search?locale=en_US&query=${encodeURIComponent(store.locationName)}`
    const options = {
        headers: new Headers({
            "x-rapidapi-host": "hotels4.p.rapidapi.com",
            "x-rapidapi-key": store.apiKeyRapid
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
            "x-rapidapi-key": store.apiKeyRapid
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
        store.coordinates = [];
        store.locationId = "";
        store.locationName = "";
        const userInput = $(".js-destination-input").val();
        event.preventDefault();
        getDestination(userInput);
        handleRestaurantsClicked();
        handleThingsToDoClicked();
        handleAccommodationsClicked();
    });
}

handleFindDestination();