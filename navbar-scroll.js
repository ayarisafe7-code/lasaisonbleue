document.addEventListener('DOMContentLoaded', () => {
    const nav = document.getElementById('mainNav');
    if (!nav) return;

    // Add transition classes if not present (safety check, though we should add them in HTML)
    nav.classList.add('transition-opacity', 'duration-300', 'hover:!opacity-100');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('opacity-30'); // Lower opacity to 30% as requested
            nav.classList.remove('opacity-70', 'opacity-50'); // Remove old classes
        } else {
            nav.classList.remove('opacity-30', 'opacity-50', 'opacity-70');
        }
    });
});
