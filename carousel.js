
class Carousel {
    constructor(container, items, options = {}) {
        this.container = container;
        this.items = items;
        this.options = Object.assign({
            autoplayDelay: 5000,
            pauseOnHover: true
        }, options);

        this.state = {
            currentIndex: 0,
            isHovered: false,
            isExpanded: false
        };

        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
        this.startAutoplay();
        this.update();
    }

    render() {
        this.container.classList.add('carousel-container');

        // Track
        this.track = document.createElement('div');
        this.track.className = 'carousel-track';

        this.items.forEach((item, index) => {
            const itemEl = this.createItemElement(item);
            itemEl.dataset.index = index;
            itemEl.addEventListener('click', () => this.expandItem(item));
            this.track.appendChild(itemEl);
        });

        this.container.appendChild(this.track);

        // Indicators
        this.indicatorsContainer = document.createElement('div');
        this.indicatorsContainer.className = 'carousel-indicators-container';
        this.indicators = document.createElement('div');
        this.indicators.className = 'carousel-indicators';

        this.items.forEach((item, index) => {
            const dot = document.createElement('div');
            dot.className = 'carousel-indicator';
            // Inject icon
            dot.innerHTML = item.icon;
            dot.addEventListener('click', () => {
                this.snapTo(index);
                this.startAutoplay(); // Reset timer on manual interaction
            });
            this.indicators.appendChild(dot);
        });

        this.indicatorsContainer.appendChild(this.indicators);
        this.container.appendChild(this.indicatorsContainer);

        // Expansion Overlay (hidden by default)
        this.overlay = document.createElement('div');
        this.overlay.className = 'carousel-overlay';
        this.overlay.style.display = 'none';
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.closeExpansion();
        });
        document.body.appendChild(this.overlay);
    }

    createItemElement(item) {
        const itemEl = document.createElement('div');
        itemEl.className = 'carousel-item';

        // Header/Icon
        const header = document.createElement('div');
        header.className = 'carousel-item-header';
        const iconContainer = document.createElement('span');
        iconContainer.className = 'carousel-icon-container';
        iconContainer.innerHTML = item.icon;
        header.appendChild(iconContainer);

        // Content
        const content = document.createElement('div');
        content.className = 'carousel-item-content';
        const title = document.createElement('div');
        title.className = 'carousel-item-title';
        title.textContent = item.title;
        const desc = document.createElement('p');
        desc.className = 'carousel-item-description';
        desc.textContent = item.description;

        content.appendChild(title);
        content.appendChild(desc);

        itemEl.appendChild(header);
        itemEl.appendChild(content);

        return itemEl;
    }

    bindEvents() {
        if (this.options.pauseOnHover) {
            this.container.addEventListener('mouseenter', () => {
                this.state.isHovered = true;
                this.stopAutoplay();
            });
            this.container.addEventListener('mouseleave', () => {
                this.state.isHovered = false;
                if (!this.state.isExpanded) this.startAutoplay();
            });
        }
    }

    snapTo(index) {
        this.state.currentIndex = index;
        this.update();
    }

    next() {
        const nextIndex = (this.state.currentIndex + 1) % this.items.length;
        this.snapTo(nextIndex);
    }

    update() {
        const items = this.track.children;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (i === this.state.currentIndex) {
                item.classList.add('active');
                item.style.opacity = '1';
                item.style.zIndex = '10';
                item.style.pointerEvents = 'auto';
            } else {
                item.classList.remove('active');
                item.style.opacity = '0';
                item.style.zIndex = '0';
                item.style.pointerEvents = 'none';
            }
        }

        // Update indicators
        const dots = this.indicators.children;
        for (let i = 0; i < dots.length; i++) {
            if (i === this.state.currentIndex) {
                dots[i].classList.add('active');
            } else {
                dots[i].classList.remove('active');
            }
        }
    }

    startAutoplay() {
        this.stopAutoplay();
        this.autoplayTimer = setInterval(() => {
            if (!this.state.isHovered && !this.state.isExpanded) {
                this.next();
            }
        }, this.options.autoplayDelay);
    }

    stopAutoplay() {
        if (this.autoplayTimer) clearInterval(this.autoplayTimer);
    }

    expandItem(item) {
        this.state.isExpanded = true;
        this.stopAutoplay();

        // Populate overlay
        this.overlay.innerHTML = '';
        const expandedCard = this.createItemElement(item);
        expandedCard.classList.add('expanded-card');

        // CRITICAL FIX: Reset all positioning properties that might be inherited from .carousel-item
        expandedCard.style.position = 'relative';
        expandedCard.style.top = 'auto';
        expandedCard.style.left = 'auto';
        expandedCard.style.transform = 'none';
        expandedCard.style.opacity = '1';
        expandedCard.style.zIndex = 'auto';

        // Styling for expanded view
        expandedCard.style.width = '100%';
        expandedCard.style.maxWidth = '800px'; // Increased size
        expandedCard.style.cursor = 'default';
        expandedCard.style.transform = 'scale(1.05)';

        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'carousel-close-btn';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => this.closeExpansion();
        expandedCard.appendChild(closeBtn);

        this.overlay.appendChild(expandedCard);

        // Show overlay
        this.overlay.style.display = 'flex';
        // Force reflow
        this.overlay.offsetHeight;
        this.overlay.classList.add('active');

        // Re-initialize icons for the new content
        if (window.lucide) window.lucide.createIcons();
    }

    closeExpansion() {
        this.state.isExpanded = false;
        this.overlay.classList.remove('active');
        setTimeout(() => {
            this.overlay.style.display = 'none';
        }, 300); // Match transition duration

        if (!this.state.isHovered) this.startAutoplay();
    }
}
