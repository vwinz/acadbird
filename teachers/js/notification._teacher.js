document.addEventListener('DOMContentLoaded', () => {
    // Select all "Mark As Read" links
    const markAsReadLinks = document.querySelectorAll('.mark-as-read-btn');

    // Add a click event listener to each link
    markAsReadLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            // Prevent the default link behavior (e.g., navigating to #)
            event.preventDefault();

            // Find the parent notification item
            const notificationItem = link.closest('.notification-item');

            // Add the 'read' class to the parent item
            if (notificationItem) {
                notificationItem.classList.add('read');
                notificationItem.classList.remove('unread');
                // You could also change the text of the link here if desired
                // link.textContent = 'Read';
            }
        });
    });
});