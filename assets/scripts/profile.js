import { showNotification } from "./notification.js";

window.addEventListener('load', async function () {
    const token = sessionStorage.getItem('token');
    if (token) {
        try {
            /*RETRIEVE USER INFO*/
            const userData = await fetchUser(token);
            displayUserData(userData.user);

            /*RETRIEVE USER TRAVEL DEST*/
            const userEmail = userData.user.email;
            
            fetchTravelDestinations(userEmail, token);

            /*RETRIEVE LOCATION*/
            const locationResponse = await fetch(`http://localhost:8080/api/locations/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const locations = await locationResponse.json();
            populateLocationDropdown(locations, 'location-create')

        } catch (error) {
            console.error('Error fetching profile:', error);
            //redirectToLogin('An error occurred while fetching your profile');
        }
    } else {
        // No token found, redirect to login
        redirectToLogin('No authentication token found');
    }
});

//  new travel destination form
document.getElementById('destination-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    // Get form data
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const location = document.getElementById('location-create').value;
    const dateFrom = document.getElementById('start-date').value;
    const dateTo = document.getElementById('end-date').value;

    // Prepare the data for submission
    const newDestination = {
        title,
        description,
        location,
        picture: "",
        dateFrom,
        dateTo,
    };

    try {
        const token = sessionStorage.getItem('token');
        const userData = await fetchUser(token);

        // Combine newDestination and userData into one object
        const destinationWithUser = {
            ...newDestination,
            user: userData.user
        };

        const response = await fetch('http://localhost:8080/api/traveldestinations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(destinationWithUser) // Send the combined object
        });

        if (response.ok) {
            const createdDestination = await response.json();
            showNotification("Trave Destination creates.", "success")
            fetchTravelDestinations(userData.user.email, token)
        } else {
            const errorData = await response.json();
            console.error('Error adding destination:', errorData);
        }
    } catch (error) {
        console.error('Error submitting form:', error);
    }
});


/*FUNCTIONS*/
// fetches user with token
async function fetchUser(token) {
    try {
        const userResponse = await fetch('http://localhost:8080/api/users/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!userResponse.ok) {
            const errorData = await userResponse.json();
            redirectToLogin(errorData.message || 'You are not logged in');
        }


        const userData = await userResponse.json();
        return userData;
    } catch (error) {
        console.error('Error fetching profile:', error);
        redirectToLogin('An error occurred while fetching your profile');
    }
}

// Function to display user data in the input fields
function displayUserData(user) {
    document.getElementById('first-name').value = user.firstname;
    document.getElementById('last-name').value = user.lastname;
    document.getElementById('username-profile').value = user.username;
    document.getElementById('email-profile').value = user.email;
    //TODO: understand if password is needed or not
}

// Function to populate the location dropdown
function populateLocationDropdown(locations, dropdownId, selectedLocation) {
    const locationSelect = document.getElementById(dropdownId);
    locationSelect.innerHTML = '<option value="">Select a location</option>';

    locations.forEach(location => {
        const option = document.createElement('option');
        option.value = location._id; // Assuming _id is the value you want to use
        option.textContent = location.location; // Display the location name

        // Set the default selected option
        if (location.location === selectedLocation) {
            option.selected = true;
        }

        locationSelect.appendChild(option);
    });
}

//Fetches travel destination and then call populateTable
async function fetchTravelDestinations(userEmail, token) {
    try {
    
        const travelDestinationsResponse = await fetch(`http://localhost:8080/api/traveldestinations/byUserEmail/${userEmail}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const travelDestinations = await travelDestinationsResponse.json();

        populateDestinationsTable(travelDestinations)
    } catch (error) {
        console.error('Error fetching destinations:', error);
    }
}

// Populates table with data fetched
function populateDestinationsTable(travelDestinations) {
    const tableBody = document.querySelector("#destination-table tbody");
    tableBody.innerHTML = ""; // Clear any existing rows

    if (travelDestinations.length > 0) {

        travelDestinations.forEach(dest => {
            const row = document.createElement("tr");

            row.innerHTML = `
            <td><input type="text" value="${dest.title}" disabled></td>
            <td><input type="text" value="${dest.description}" disabled></td>
            <td>
            <select id="location-${dest._id}" disabled>
            <option value="${dest.location}" selected>${dest.location}</option>
            </select>
            </td>
            <td><input type="text" value="${dest.country}" disabled></td>
            <td><input type="date" value="${new Date(dest.dateFrom).toISOString().split('T')[0]}" disabled></td>
            <td><input type="date" value="${new Date(dest.dateTo).toISOString().split('T')[0]}" disabled></td>
            <td class="action-buttons">
            <button class="edit-btn" data-id="${dest._id}">Edit</button>
            <button id="delete-btn" class="delete-btn" data-id="${dest._id}">Delete</button>
            </td>
            `;

            tableBody.appendChild(row);
        });

    }
    // Add event listeners for the edit buttons
    addEditButtonListeners();
    // Add event listenr for the delete button
    addDeleteButtonListeners();
}

// Function to add event listeners to the edit buttons
function addEditButtonListeners() {
    const editButtons = document.querySelectorAll(".edit-btn");
    editButtons.forEach(button => {
        button.addEventListener("click", (e) => {
            handleEditButtonClick(e);
        });
    });
}

// Function to add event listeners to delete buttons
function addDeleteButtonListeners() {
    const deleteButtons = document.querySelectorAll(".delete-btn");
    deleteButtons.forEach(button => {
        button.addEventListener("click", (e) => {
            const destinationId = e.target.dataset.id;
            deleteDestination(destinationId);
        });
    });
}

// Function to handle deleting a destination
async function deleteDestination(destinationId) {
    const token = sessionStorage.getItem('token');

    // Ask for confirmation before proceeding with the deletion
    const confirmDelete = window.confirm("Are you sure you want to delete this travel destination?");

    if (confirmDelete) {
        try {
            const response = await fetch(`http://localhost:8080/api/traveldestinations/${destinationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                document.querySelector(`button[data-id="${destinationId}"]`).closest('tr').remove();
                showNotification("Travel destination deleted successfully.", "success")
            } else {
                console.error(`Failed to delete destination with ID ${destinationId}.`);
                showNotification("Failed to delete the travel destination. Please try again.", "error")
            }

        } catch (error) {
            console.error('Error deleting destination:', error);
            showNotification("An error occurred while deleting the destination.", "error")
        }
    }
}

// Function to handle the edit button click event
async function handleEditButtonClick(event) {
    const row = event.target.closest("tr");
    const inputs = row.querySelectorAll("input");
    const select = row.querySelector("select");
    const isDisabled = inputs[0].disabled; // Check the disabled state of the first input
    const originalId = event.target.dataset.id; // Store the original ID

    // Store original values for undo
    const originalValues = Array.from(inputs).map(input => input.value);
    const originalLocation = select.value; // Store the original location

    // Toggle disabled attribute on inputs and select
    inputs.forEach((input, index) => {
        if (index !== 2) { // Assuming the country input is at index 3
            input.disabled = !isDisabled; // Set the opposite state for all inputs except country
        }
    });
    select.disabled = !isDisabled; // Set the opposite state for the select

    const token = sessionStorage.getItem('token');
    const locationResponse = await fetch(`http://localhost:8080/api/locations/`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const locations = await locationResponse.json();
    // Populate the location dropdown with the original value selected
    populateLocationDropdown(locations, select.id, originalLocation);

    // Change the button text and functionality
    const editButton = event.target;
    const saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    saveButton.className = "save-btn";
    saveButton.dataset.id = originalId; // Maintain the same ID
    saveButton.addEventListener("click", () => {
        handleSaveButtonClick(inputs, select, saveButton);
    });

    // Create the undo button
    const undoButton = document.createElement("button");
    undoButton.textContent = "Undo";
    undoButton.className = "undo-btn";
    undoButton.addEventListener("click", () => {
        handleUndoButtonClick(inputs, select, originalValues, originalLocation, originalId);
    });

    // Replace edit and delete buttons with save and undo
    const actionButtons = row.querySelector(".action-buttons");
    actionButtons.innerHTML = ""; // Clear existing buttons
    actionButtons.appendChild(saveButton);
    actionButtons.appendChild(undoButton);
}

// Function to handle the save button click event
function handleSaveButtonClick(inputs, select, saveButton) {
    const updatedObject = {
        title: inputs[0].value,
        description: inputs[1].value,
        locationId: select.value,
        dateFrom: inputs[3].value,
        dateTo: inputs[4].value,
    };

    // Get the destination ID from the save button dataset
    const destinationId = saveButton.dataset.id;

    // Call the update endpoint (PUT request)
    const token = sessionStorage.getItem('token');

    fetch(`http://localhost:8080/api/traveldestinations/${destinationId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedObject),
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to update travel destination');
            }
        })
        .then(data => {

            //get from the response the country name and set it to the input[3]
            console.log(data);
            inputs[2].value = data.country.country

            showNotification("Data succesfully updated!", "success")

            // Disable inputs after saving
            inputs.forEach(input => {
                input.disabled = true;
            });
            select.disabled = true; // Disable the select

            // Restore the edit button
            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.className = "edit-btn";
            editButton.dataset.id = saveButton.dataset.id;
            editButton.addEventListener("click", (e) => {
                handleEditButtonClick(e);
            });

            // Restore the delete button
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.className = "delete-btn";
            deleteButton.dataset.id = saveButton.dataset.id;

            // Replace save and undo buttons with edit and delete
            const actionButtons = saveButton.parentElement;
            actionButtons.innerHTML = ""; // Clear existing buttons
            actionButtons.appendChild(editButton);
            actionButtons.appendChild(deleteButton);
        })
        .catch(error => {
            console.error("Error updating destination:", error);
            showNotification("An error occurred while updating the destination.", "error")
        });
}

// Function to handle the undo button click event
function handleUndoButtonClick(inputs, select, originalValues, originalLocation, originalId) {
    // Restore original values and disable inputs
    inputs.forEach((input, index) => {
        input.value = originalValues[index]; // Set original value
        input.disabled = true; // Disable input
    });

    // Disable the select and set its value to the original location
    select.innerHTML = ''; // Clear existing options
    const option = document.createElement('option');
    option.value = originalLocation; // Set the value to the original location
    option.textContent = originalLocation; // Display the original location
    select.appendChild(option); // Add the original location as the only option
    select.disabled = true; // Disable the select

    // Restore the edit button
    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.className = "edit-btn";
    editButton.dataset.id = originalId; // Use the passed original ID
    editButton.addEventListener("click", (e) => {
        handleEditButtonClick(e);
    });

    // Restore the delete button
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-btn";
    deleteButton.dataset.id = originalId; // Ensure ID is reassigned

    // Replace undo and save buttons with edit and delete
    const actionButtons = inputs[0].closest("td").parentElement.querySelector(".action-buttons");
    actionButtons.innerHTML = ""; // Clear existing buttons
    actionButtons.appendChild(editButton);
    actionButtons.appendChild(deleteButton);
}

// Function to redirect with a message
const redirectToLogin = (message) => {
    //TODO: improve ux/ui on error handling
    document.body.innerHTML = `<h2>${message}, redirecting to login...</h2>`;
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 3000);
};