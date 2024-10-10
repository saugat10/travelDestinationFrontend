const url = "http://localhost:8080/api/traveldestinations"

export async function getUserDestinations() {
  const token = sessionStorage.getItem('token');
  const user = await fetchUser(token);

  if (user) {

    const travelDestinationsResponse = await fetch(`http://localhost:8080/api/traveldestinations/byUserEmail/${user.user.email}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const travelDestinations = await travelDestinationsResponse.json();    
  }

}

export async function getDestinations() {
  try {
    const responseJson = await fetch(url);
    if (!responseJson.ok) {
      throw new Error(`Response status: ${responseJson.status}`);
    }

    const response = await responseJson.json();
    return response;
  } catch (error) {
    console.error(error);
  }
}

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
