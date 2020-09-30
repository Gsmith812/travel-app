"use strict";

const apiKeyRapid = "583ca639f9msh2485b7c56c251aap137d5bjsn5fb3b724e00f";

//Display functions

function displayLocation(response) {
    console.log(response);
    $("#location-description").empty();
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


//Event listeners

function handleFindDestination() {
    $("form").submit(event => {
        const userInput = $(".js-destination-input").val();
        event.preventDefault();
        getDestination(userInput);
    });
}

handleFindDestination();
