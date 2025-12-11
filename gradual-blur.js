class GradualBlur {
    constructor(config = {}) {
        this.defaultConfig = {
            position: 'bottom',
            strength: 2,
            height: '6rem',
            divCount: 8, // Increased for smoothness
            exponential: false,
            zIndex: 50,
            opacity: 1,
            curve: 'linear',
            target: document.body,
            className: ''
        };

        this.config = { ...this.defaultConfig, ...config };
        this.container = null;

        this.init();
    }

    init() {
        this.createContainer();
        this.generateLayers();
        this.mount();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.className = `gradual-blur gradual-blur-${this.config.position} ${this.config.className}`;

        // Apply base styles
        const style = this.container.style;
        style.position = 'fixed';
        style.zIndex = this.config.zIndex;
        style.pointerEvents = 'none'; // Crucial
        style.left = '0';
        style.right = '0';

        if (this.config.position === 'top') {
            style.top = '0';
            style.height = this.config.height;
            style.background = 'transparent'; // Ensure no background color interferes
        } else if (this.config.position === 'bottom') {
            style.bottom = '0';
            style.height = this.config.height;
            style.background = 'transparent';
        }
    }

    getGradientDirection(position) {
        const map = {
            top: 'to top',
            bottom: 'to bottom',
            left: 'to left',
            right: 'to right'
        };
        return map[position] || 'to bottom';
    }

    curveFunction(p) {
        switch (this.config.curve) {
            case 'bezier': return p * p * (3 - 2 * p);
            case 'ease-in': return p * p;
            case 'ease-out': return 1 - Math.pow(1 - p, 2);
            case 'ease-in-out': return (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
            case 'linear':
            default: return p;
        }
    }

    generateLayers() {
        const { divCount, strength, exponential, opacity, position } = this.config;
        const increment = 100 / divCount;
        const direction = this.getGradientDirection(position);

        for (let i = 1; i <= divCount; i++) {
            let progress = i / divCount;
            progress = this.curveFunction(progress);

            let blurValue;
            if (exponential) {
                blurValue = Math.pow(2, progress * 4) * 0.0625 * strength;
            } else {
                blurValue = 0.0625 * (progress * divCount + 1) * strength;
            }

            // Calculate gradient stops
            const p1 = Math.round((increment * i - increment) * 10) / 10;
            const p2 = Math.round(increment * i * 10) / 10;
            const p3 = Math.round((increment * i + increment) * 10) / 10;
            const p4 = Math.round((increment * i + increment * 2) * 10) / 10;

            let gradient = `transparent ${p1}%, black ${p2}%`;
            if (p3 <= 100) gradient += `, black ${p3}%`;
            if (p4 <= 100) gradient += `, transparent ${p4}%`;

            const layer = document.createElement('div');
            layer.style.position = 'absolute';
            layer.style.inset = '0';
            layer.style.pointerEvents = 'none';

            // Apply Mask
            const maskImage = `linear-gradient(${direction}, ${gradient})`;
            layer.style.maskImage = maskImage;
            layer.style.webkitMaskImage = maskImage;

            // Apply Blur
            const blurFilter = `blur(${blurValue.toFixed(3)}rem)`;
            layer.style.backdropFilter = blurFilter;
            layer.style.webkitBackdropFilter = blurFilter;

            layer.style.opacity = opacity;

            this.container.appendChild(layer);
        }
    }

    mount() {
        if (this.config.target) {
            // If target is a string selector, find it
            if (typeof this.config.target === 'string') {
                const el = document.querySelector(this.config.target);
                if (el) el.appendChild(this.container);
            } else {
                // Assume it's a DOM element
                this.config.target.appendChild(this.container);
            }
        }

        // Add scroll listener if position is bottom to hide it when reaching the end
        if (this.config.position === 'bottom') {
            this.handleScroll = this.handleScroll.bind(this);
            window.addEventListener('scroll', this.handleScroll, { passive: true });
            this.handleScroll(); // Initial check
        }
    }

    handleScroll() {
        if (!this.container) return;

        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const bodyHeight = document.documentElement.scrollHeight;

        // Distance from bottom
        const dist = bodyHeight - (scrollY + windowHeight);

        // Fade out when within 100px of bottom
        const threshold = 100;

        if (dist < threshold) {
            // Calculate opacity: 0 at bottom, 1 at threshold
            const opacity = Math.max(0, dist / threshold);
            this.container.style.opacity = opacity;
        } else {
            this.container.style.opacity = this.config.opacity;
        }
    }
}

// Auto-initialize if requested via data attributes or global config could be added here
// For now, we export the class globally
window.GradualBlur = GradualBlur;
