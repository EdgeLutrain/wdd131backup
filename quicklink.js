document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        card.addEventListener('click', () => {
            const cardId = card.id;

            // Save the ID in localStorage
            localStorage.setItem('selectedCardId', cardId);
            console.log(`ID saved in localStorage: ${cardId}`);

            // Redirect to the second page
            window.location.href = 'second_page.html';
        });
    });
});
