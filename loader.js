document.addEventListener('DOMContentLoaded', () => {
    // 1. Inject Loader HTML
    const loaderHTML = `
    <div id="lsb-loader">
        <svg width="300" height="150" viewBox="0 0 300 150">
            <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:#38bdf8;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#ffffff;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#38bdf8;stop-opacity:1" />
                </linearGradient>
            </defs>
            <!-- Using text element for "LSB" -->
            <text x="50%" y="50%" dy=".35em" text-anchor="middle" class="lsb-text">LSB</text>
        </svg>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', loaderHTML);

    const loader = document.getElementById('lsb-loader');

    // 2. Handle Navigation
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');

        // Ignore if no link, or external link, or anchor link, or modifier keys
        if (!link ||
            link.target === '_blank' ||
            link.href.startsWith('javascript:') ||
            link.href.startsWith('mailto:') ||
            link.href.startsWith('tel:') ||
            link.href.includes('#') ||
            e.ctrlKey || e.metaKey || e.shiftKey || e.altKey ||
            link.hostname !== window.location.hostname
        ) {
            return;
        }

        e.preventDefault();
        const targetUrl = link.href;

        // Show loader
        loader.classList.add('visible');

        // Wait for animation then navigate
        setTimeout(() => {
            window.location.href = targetUrl;
        }, 800); // 800ms delay
    });

    // Optional: Hide loader on page load (if it was visible from previous page cache)
    window.addEventListener('pageshow', () => {
        loader.classList.remove('visible');
    });
});
