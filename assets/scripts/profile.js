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
            const travelDestinationsResponse = await fetch(`http://localhost:8080/api/traveldestinations/byUserEmail/${userEmail}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const travelDestinations = await travelDestinationsResponse.json();


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
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                  </td>
                `;

                tableBody.appendChild(row);
            });

            /*RETRIEVE LOCATION*/
            const locationResponse = await fetch(`http://localhost:8080/api/locations/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const locations = await locationResponse.json();
            populateLocationDropdown(locations)

        } catch (error) {
            console.error('Error fetching profile:', error);
            redirectToLogin('An error occurred while fetching your profile');
        }
    } else {
        // No token found, redirect to login
        redirectToLogin('No authentication token found');
    }
});


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

// Function to display user data
function displayUserData(user) {
    document.getElementById('first-name').value = user.firstname;
    document.getElementById('last-name').value = user.lastname;
    document.getElementById('username').value = user.username;
    document.getElementById('email-profile').value = user.email;
    //TODO: understand if password is needed or not
}

// Function to populate the location dropdown
function populateLocationDropdown(locations) {
    const locationSelect = document.getElementById('location');
    locationSelect.innerHTML = '<option value="">Select a location</option>'; // Reset the dropdown

    locations.forEach(location => {
        const option = document.createElement('option');
        option.value = location._id; // Assuming _id is the value you want to use
        option.textContent = location.location; // Display the location name
        locationSelect.appendChild(option);
    });
}


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
        const userData = await fetchUser(token); // Assuming fetchUser(token) returns the user data

        // Combine newDestination and userData into one object
        const destinationWithUser = {
            ...newDestination, 
            user: userData.user 
        };
        console.log(destinationWithUser);
    
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
            console.log('New travel destination added:', createdDestination);
            // Optionally: refresh or update the travel destinations table
        } else {
            const errorData = await response.json();
            console.error('Error adding destination:', errorData);
        }
    } catch (error) {
        console.error('Error submitting form:', error);
    }
});
