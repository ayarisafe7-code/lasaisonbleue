document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('menuToggle');
    const closeBtn = document.getElementById('menuCloseBtn');
    const drawer = document.getElementById('menuDrawer');
    const backdrop = document.getElementById('menuBackdrop');
    const links = document.querySelectorAll('.nav-link');

    function openMenu() {
        if (drawer && backdrop) {
            drawer.classList.add('active');
            backdrop.classList.add('active');

            // Stagger Animation for links
            if (typeof gsap !== 'undefined' && links.length > 0) {
                gsap.fromTo(links,
                    { x: 50, opacity: 0 },
                    { x: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out", delay: 0.2 }
                );
            }
        }
    }

    function closeMenu() {
        if (drawer && backdrop) {
            drawer.classList.remove('active');
            backdrop.classList.remove('active');
        }
    }

    if (toggleBtn) toggleBtn.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    if (backdrop) backdrop.addEventListener('click', closeMenu); // Close on click outside
});
