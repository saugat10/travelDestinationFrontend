// Function to display custom notification
export function showNotification(message, type) {
    const notification = document.getElementById('notification');
    
    // Check if the notification element exists
    if (!notification) {
        console.error('Notification element not found');
        return; // Exit the function if the element is not found
    }

    // Set the message and visibility
    notification.textContent = message;
    notification.classList.remove('hidden');

    // Apply class based on type (success or error)
    if (type === 'success') {
        notification.classList.remove('error');
        notification.classList.add('success');
    } else if (type === 'error') {
        notification.classList.remove('success');
        notification.classList.add('error');
    }

    // Show notification for 3 seconds, then hide
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}
