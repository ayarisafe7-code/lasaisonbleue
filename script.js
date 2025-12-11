
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. BACKGROUND SLIDER (Hero Section) ---
    const bgSlides = [
        'assets/cover/1.jpg',
        'assets/cover/2.jpg',
        'assets/cover/3.jpg',
        'assets/cover/4.jpg',
        'assets/cover/5.jpg',
        'assets/cover/6.jpeg',
        'assets/cover/7.jpeg'
    ];

    const bgContainer = document.getElementById('background-slider');

    if (bgContainer) {
        bgContainer.innerHTML = ''; // Reset

        // Création des slides
        bgSlides.forEach((src, index) => {
            const div = document.createElement('div');
            div.classList.add('bg-slide');
            div.style.backgroundImage = `url('${src}')`;
            if (index === 0) div.classList.add('active');
            bgContainer.appendChild(div);
        });

        // Animation (4 secondes)
        let bgIndex = 0;
        const bgDivs = document.querySelectorAll('.bg-slide');

        setInterval(() => {
            if (bgDivs.length > 0) {
                bgDivs[bgIndex].classList.remove('active');
                bgIndex = (bgIndex + 1) % bgDivs.length;
                bgDivs[bgIndex].classList.add('active');
            }
        }, 4000);
    }

    // --- 2. COVER PHOTO ROTATION (Cross-Fade Enchaîné) ---
    const coverFront = document.getElementById('about-cover-img');
    const coverBack = document.getElementById('about-cover-bg');

    const coverSlides = [
        'assets/cover/1.jpg',
        'assets/cover/2.jpg',
        'assets/cover/3.jpg',
        'assets/cover/4.jpg',
        'assets/cover/5.jpg',
        'assets/cover/6.jpeg',
        'assets/cover/7.jpeg',
        'assets/cover/8.jpg'
    ];

    if (coverFront && coverBack && coverSlides.length > 0) {
        let currentIndex = 0;

        setInterval(() => {
            const nextIndex = (currentIndex + 1) % coverSlides.length;
            const nextSlide = coverSlides[nextIndex];

            // 1. Préparer l'image arrière avec la PROCHAINE photo
            coverBack.src = nextSlide;

            // CONDITION SPECIALE : Si c'est la photo 8.jpg, on aligne en haut (object-top)
            // Sinon on garde le centrage par défaut (on enlève la classe)
            if (nextSlide.includes('8.jpg')) {
                coverBack.classList.add('object-top');
            } else {
                coverBack.classList.remove('object-top');
            }

            // 2. Faire disparaître l'image avant (révélant l'image arrière)
            coverFront.style.opacity = '0';

            // 3. Une fois la transition finie (1s), on met à jour l'avant et on le réaffiche instantanément
            setTimeout(() => {
                currentIndex = nextIndex;
                coverFront.src = coverSlides[currentIndex];

                // Appliquer la même logique de classe sur l'image de devant
                if (coverSlides[currentIndex].includes('8.jpg')) {
                    coverFront.classList.add('object-top');
                } else {
                    coverFront.classList.remove('object-top');
                }

                // Hack pour éviter un glitch : On enlève la transition, on remet l'opacité, on remet la transition
                coverFront.style.transition = 'none';
                coverFront.style.opacity = '1';

                // Force reflow
                void coverFront.offsetWidth;

                // Rétablir la transition pour la prochaine fois
                coverFront.style.transition = 'opacity 1000ms';
            }, 1000); // 1000ms correspond à duration-1000 CSS

        }, 4000);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // 1. Fonction Switch Tabs
    window.switchTab = function (tabName) {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');

        if (loginForm && registerForm) {
            loginForm.style.display = (tabName === 'login') ? 'block' : 'none';
            registerForm.style.display = (tabName === 'register') ? 'block' : 'none';
        }

        const btnLogin = document.getElementById('btn-login');
        const btnReg = document.getElementById('btn-register');

        if (btnLogin && btnReg) {
            if (tabName === 'login') {
                btnLogin.classList.add('active');
                btnReg.classList.remove('active');
            } else {
                btnLogin.classList.remove('active');
                btnReg.classList.add('active');
            }
        }
    };

    // 2. Gestion Input Fichier (Afficher nom)
    const fileInput = document.getElementById('fileInput');
    const fileNameSpan = document.getElementById('fileName');
    if (fileInput) {
        fileInput.addEventListener('change', function () {
            if (this.files && this.files.length > 0) {
                fileNameSpan.textContent = this.files[0].name;
                fileNameSpan.style.color = '#2dd4bf';
                fileNameSpan.style.fontWeight = 'bold';
            }
        });
    }

    // 3. Logique de Connexion (Mot de passe hardcodé)
    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const passInput = document.getElementById('loginPass');
            const pass = passInput ? passInput.value : '';
            const errorMsg = document.getElementById('loginError');

            // PASSWORD SECRET
            if (pass === "Wao2025!") {
                window.location.href = "wao-interface.html";
            } else {
                if (errorMsg) errorMsg.style.display = 'block';
                authForm.animate([
                    { transform: 'translateX(0)' },
                    { transform: 'translateX(-10px)' },
                    { transform: 'translateX(10px)' },
                    { transform: 'translateX(0)' }
                ], { duration: 300 });
            }
        });
    }
});

/* --- STACK GALLERY LOGIC --- */
document.addEventListener('DOMContentLoaded', () => {
    const stack = document.getElementById('waoStack');
    if (stack) {
        const cards = Array.from(stack.querySelectorAll('.card-item'));

        // 1. Initialisation : Donner une rotation aléatoire à chaque carte
        cards.forEach((card, index) => {
            const randomRotation = Math.random() * 10 - 5; // Entre -5deg et +5deg
            card.style.zIndex = cards.length - index; // Les premières devant
            card.style.transform = `scale(${1 - index * 0.05}) translateY(${index * 10}px) rotate(${randomRotation}deg)`;
        });

        // 2. Gestion du clic pour envoyer la carte du dessus vers le dessous
        stack.addEventListener('click', () => {
            // On prend la carte du dessus (la première dans le DOM visuel, mais z-index max)
            const topCard = stack.firstElementChild;

            // Animation de sortie (Fly out)
            topCard.style.transform = `translate(200px, -50px) rotate(20deg)`;
            topCard.style.opacity = '0';

            setTimeout(() => {
                // On la déplace physiquement à la fin de la liste (au fond)
                stack.appendChild(topCard);

                // On réinitialise son style pour qu'elle revienne au fond proprement
                topCard.style.opacity = '1';

                // On recalcule les positions de TOUTES les cartes
                const newOrder = Array.from(stack.querySelectorAll('.card-item'));
                newOrder.forEach((card, index) => {
                    const randomRotation = Math.random() * 10 - 5;
                    card.style.zIndex = newOrder.length - index;
                    card.style.transform = `scale(${1 - index * 0.05}) translateY(${index * 10}px) rotate(${randomRotation}deg)`;
                });
            }, 300); // Temps court pour l'effet
        });
    }
});

/* --- MAGNETIC MAGNET BUTTON EFFECT --- */
document.addEventListener('DOMContentLoaded', () => {
    const magnetBtn = document.getElementById('btn-wao-neon');

    if (magnetBtn) {
        // Configuration
        const padding = 100;       // Zone d'activation autour du bouton
        const magnetStrength = 3;  // Plus le chiffre est haut, moins ça bouge (Résistance)

        // Fonction de mouvement
        const handleMouseMove = (e) => {
            const rect = magnetBtn.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Calcul de la distance souris / bouton
            const distX = Math.abs(centerX - e.clientX);
            const distY = Math.abs(centerY - e.clientY);

            // Si la souris est dans la zone d'effet
            if (distX < (rect.width / 2 + padding) && distY < (rect.height / 2 + padding)) {

                const offsetX = (e.clientX - centerX) / magnetStrength;
                const offsetY = (e.clientY - centerY) / magnetStrength;

                // Note : On garde le translateY(-50%) du CSS initial !
                magnetBtn.style.transform = `translate(${offsetX}px, calc(-50% + ${offsetY}px)) scale(1.1)`;

                // Transition rapide quand on est dedans (Snappy)
                magnetBtn.style.transition = 'transform 0.1s ease-out, background 0.3s, box-shadow 0.3s';

            } else {
                // Remise à zéro (Reset)
                magnetBtn.style.transform = `translate(0px, -50%) scale(1)`;

                // Transition douce quand on sort (Smooth return)
                magnetBtn.style.transition = 'transform 0.5s ease-in-out, background 0.3s, box-shadow 0.3s';
            }
        };

        // Écouteur global
        window.addEventListener('mousemove', handleMouseMove);
    }
});

/* --- FINAL MENU LOGIC (HOVER REVEAL FIX) --- */
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('menuToggle');
    const closeBtn = document.getElementById('menuCloseBtn');
    const overlay = document.getElementById('fullMenu');
    const links = document.querySelectorAll('.nav-link'); // Pour l'animation
    
    function openMenu() {
        if(overlay) overlay.classList.add('active');
        // Animation d'entrée GSAP (Stagger)
        if(typeof gsap !== 'undefined' && links.length > 0) {
            gsap.fromTo(links, 
                { y: 100, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power4.out" }
            );
        }
    }

    function closeMenu() {
        if(overlay) overlay.classList.remove('active');
    }

    if(toggleBtn) toggleBtn.addEventListener('click', openMenu);
    if(closeBtn) closeBtn.addEventListener('click', closeMenu);
});
