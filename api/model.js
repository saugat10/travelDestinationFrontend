const url = "http://localhost:8080/api/traveldestinations"

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