function initBlurAnimation() {
    const titles = document.querySelectorAll('.animate-title, .animate-agissons');

    if (titles.length === 0) return;

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const words = entry.target.querySelectorAll('.blur-word');
                words.forEach((word, index) => {
                    setTimeout(() => {
                        word.classList.add('blur-word-active');
                    }, index * 150); // 150ms delay per word
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    titles.forEach(title => {
        // Prepare the text
        const text = title.innerText.trim();
        const words = text.split(/\s+/); // Split by whitespace

        // Clear content
        title.innerHTML = '';

        // Rebuild with spans
        words.forEach(wordText => {
            const span = document.createElement('span');
            span.textContent = wordText;
            span.className = 'blur-word';
            title.appendChild(span);
            // Add space after word (handled by CSS margin-right usually, but let's be safe for accessibility/copy-paste if needed, though CSS is better for visual)
            // Actually, CSS margin-right is better for layout.
        });

        // Start observing
        observer.observe(title);
    });
}

document.addEventListener('DOMContentLoaded', initBlurAnimation);
