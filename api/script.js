import { getDestinations } from "./model.js";

window.addEventListener("load", async () => {
    const destinations = await getDestinations();
    console.log(destinations);

    destinations.forEach((destination) => {
        renderDestinations(destination);
    })
})


function renderDestinations(destination) {
    const destinationsContainer = document.getElementById('destinations-container');
    const template = document.getElementById('destination-template').content;
    const dateTo = new Date(destination.dateTo);
    const dateFrom = new Date(destination.dateFrom);
    const card = document.importNode(template, true);
    card.querySelector('img').src = destination.picture;
    card.querySelector('.destination-title').textContent = destination.title;
    card.querySelector('.destination-dates').textContent = `From: ${dateFrom.toLocaleDateString('en-CA')} To: ${dateTo.toLocaleDateString('en-CA')}`;
    destinationsContainer.appendChild(card);
  }