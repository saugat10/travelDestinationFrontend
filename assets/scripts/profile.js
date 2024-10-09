window.addEventListener('load', async function () {
    const token = sessionStorage.getItem('token');

    // Function to redirect with a message
    const redirectToLogin = (message) => {
        //TODO: improve ux/ui on error handling
        document.body.innerHTML = `<h2>${message}, redirecting to login...</h2>`;
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    };

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

// Event listener for submitting the new travel destination form
document.getElementById('destination-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    // Get form data
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const location = document.getElementById('location').value;
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
            fetchTravelDestinations(userData.user.email, token)
        } else {
            const errorData = await response.json();
            console.error('Error adding destination:', errorData);
        }
    } catch (error) {
        console.error('Error submitting form:', error);
    }
});

document.querySelector("#destination-table tbody").addEventListener('click', async function (e) {
    e.preventDefault();

    if (e.target.classList.contains('delete-btn')) {
        const destinationId = e.target.getAttribute('data-id');

        const userConfirmed = confirm('Are you sure you want to delete this item?');

        if (userConfirmed) {
            await deleteDestination(destinationId);
        }
    }
});

document.getElementById('destination-table').addEventListener('click', async function (e) {
    if (e.target.classList.contains('edit-btn')) {
        const row = e.target.closest('tr');
        const cells = row.querySelectorAll('td');
        const destId = e.target.dataset.id;
        // Store the original values before editing
        const originalTitle = cells[0].textContent.trim();
        const originalDescription = cells[1].textContent.trim();
        const originalLocation = cells[2].textContent.trim();
        const originalCountry = cells[3].textContent.trim();
        const originalStartDate = cells[4].textContent.trim();
        const originalEndDate = cells[5].textContent.trim();

        // Replace description with a text input (fits existing styles)
        cells[0].innerHTML = `<input type="text" value="${cells[0].textContent}" id="edit-title" class="edit-input-box">`;
        cells[1].innerHTML = `<input type="text" value="${cells[1].textContent}" id="edit-description" class="edit-input-box">`;

        // Get the original location value
        //TODO: attach eventlistener so that when selecting a new location, update the country
        cells[2].innerHTML = `
        <select id="edit-location" class="input-box">
        </select>
        `
        const token = sessionStorage.getItem('token');
        const locationResponse = await fetch(`http://localhost:8080/api/locations/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const locations = await locationResponse.json();
        populateLocationDropdown(locations, 'edit-location', originalLocation);

        // Convert start and end dates to input fields
        cells[4].innerHTML = `<input type="date" value="${new Date(cells[4].textContent).toISOString().split('T')[0]}" id="edit-start-date" class="input-box">`;
        cells[5].innerHTML = `<input type="date" value="${new Date(cells[5].textContent).toISOString().split('T')[0]}" id="edit-end-date" class="input-box">`;

        // Replace the action buttons with "Edit" and "Delete"
        cells[6].innerHTML = `
        <button id="save-btn" class="save-btn" data-id="${destId}">Save</button>
        <button id="cancel-btn" class="cancel-btn" data-id="${destId}">Undo</button>
        `;

        // Attach event listener to the "Cancel" button to revert the changes
        cells[6].querySelector('.cancel-btn').addEventListener('click', function () {
            // Revert the cells back to their original values
            cells[0].textContent = originalTitle;
            cells[1].textContent = originalDescription;
            cells[2].textContent = originalLocation;
            cells[3].textContent = originalCountry;
            cells[4].textContent = originalStartDate;
            cells[5].textContent = originalEndDate;

            // Replace the action buttons with "Edit" and "Delete"
            cells[6].innerHTML = `
          <button class="edit-btn" data-id="${destId}">Edit</button>
            <button class="delete-btn" data-id="${destId}">Delete</button>
        `;
        });

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
    document.getElementById('username').value = user.username;
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

//Populates table with data fetched
function populateDestinationsTable(travelDestinations) {
    const tableBody = document.querySelector("#destination-table tbody");
    tableBody.innerHTML = ""; // Clear any existing rows

    travelDestinations.forEach(dest => {
        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${dest.title}</td>
          <td>${dest.description}</td>
          <td>${dest.location}</td>
          <td>${dest.country}</td>
          <td>${new Date(dest.dateFrom).toISOString().split('T')[0]}</td>
          <td>${new Date(dest.dateTo).toISOString().split('T')[0]}</td>
         <td class="action-buttons">
            <button class="edit-btn" data-id="${dest._id}">Edit</button>
            <button class="delete-btn" data-id="${dest._id}">Delete</button>
        </td>
        `;

        tableBody.appendChild(row);
    });
}

// Function to handle deleting a destination
async function deleteDestination(destinationId) {
    const token = sessionStorage.getItem('token');
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
        } else {
            console.error(`Failed to delete destination with ID ${destinationId}.`);
        }
    } catch (error) {
        console.error('Error deleting destination:', error);
    }
}
