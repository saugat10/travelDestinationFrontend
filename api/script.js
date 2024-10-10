import { getDestinations, getUserDestinations } from "./model.js";

window.addEventListener("load", async () => {
  const destinations = await getDestinations();

  destinations.forEach((destination) => {
    renderDestinations(destination);
  });

  const token = sessionStorage.getItem("token");
  if (token) {
    const userDestinations = await getUserDestinations();
    //TODO: create the my destinations section in the landing page.
  }
});

function renderDestinations(destination) {
  const destinationsContainer = document.getElementById("destinations-container");
  const template = document.getElementById("destination-template").content;
  const dateTo = new Date(destination.dateTo);
  const dateFrom = new Date(destination.dateFrom);
  const card = document.importNode(template, true);
  card.querySelector(".destination-title").textContent = `#${destination.title}`;
  // card.querySelector('.destination-dates').textContent = `From: ${dateFrom.toLocaleDateString('en-CA')} To: ${dateTo.toLocaleDateString('en-CA')}`;
  destinationsContainer.appendChild(card);
}
