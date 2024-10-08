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
            const response = await fetch('http://localhost:8080/api/users/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                redirectToLogin(errorData.message || 'You are not logged in');
            }

            const data = await response.json();
            displayUserData(data.user); // Call function to display user data

            const userEmail = data.user.email;
            const travelDestinationsResponse = await fetch(`http://localhost:8080/api/traveldestinations/byUserEmail/${userEmail}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const travelDestinations = await travelDestinationsResponse.json();
            console.log(travelDestinations);

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
            
        } catch (error) {
            console.error('Error fetching profile:', error);
            redirectToLogin('An error occurred while fetching your profile');
        }
    } else {
        // No token found, redirect to login
        redirectToLogin('No authentication token found');
    }

    // Function to display user data
    function displayUserData(user) {
        document.getElementById('first-name').value = user.firstname;
        document.getElementById('last-name').value = user.lastname;
        document.getElementById('username').value = user.username;
        document.getElementById('email-profile').value = user.email;
        //TODO: understand if password is needed or not
    }
});
