document.addEventListener('DOMContentLoaded', () => {
    const searchToggle = document.getElementById('globalSearchToggle');
    const searchInput = document.getElementById('globalSearchInput');
    const suggestionsBox = document.getElementById('globalSearchSuggestions');

    if (!searchToggle || !searchInput || !suggestionsBox) return;

    // Toggle Logic
    searchToggle.addEventListener('click', (e) => {
        e.preventDefault();
        const isHidden = searchInput.classList.contains('hidden');

        if (isHidden) {
            searchInput.classList.remove('hidden');
            // Small delay to allow display:block to apply before opacity transition if we added one
            setTimeout(() => searchInput.focus(), 50);
        } else {
            searchInput.classList.add('hidden');
            suggestionsBox.classList.add('hidden');
        }
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchToggle.contains(e.target) && !searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
            if (!searchInput.classList.contains('hidden')) {
                searchInput.classList.add('hidden');
                suggestionsBox.classList.add('hidden');
            }
        }
    });

    // Search Data
    const siteContent = [
        { url: 'index.html', title: 'Accueil', content: 'Saison Bleue, littoral tunisien, économie bleue, protection océan, baleines, accueil, home' },
        { url: 'wao.html', title: 'Initiative WAO', content: 'Women Actions for the Ocean, femmes, tortues marines, pollution plastique, Bouteillou, sensibilisation, initiative, wao' },
        { url: 'grande-maree.html', title: 'La Grande Marée', content: 'La Grande Marée, Festival mer, Paris, Musée de la Marine, 28 mars, Trocadéro, événement, agenda, marée, culture' },
        { url: 'contact.html', title: 'Contact', content: 'Contact, Adresse Paris, téléphone, email, formulaire, 94 avenue Emile Zola, nous joindre, mail' },
        { url: 'videos.html', title: 'Vidéos', content: 'Nos Vidéos, Actualités, média, youtube, reportages, galerie, film, visionner' }
    ];

    // Search Function
    function performSearch(query) {
        if (!query || query.length < 2) {
            suggestionsBox.innerHTML = '';
            suggestionsBox.classList.add('hidden');
            return;
        }

        const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        const results = siteContent.filter(page => {
            const normalizedContent = (page.title + " " + page.content).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return normalizedContent.includes(normalizedQuery);
        });

        displaySuggestions(results);
    }

    function displaySuggestions(results) {
        if (results.length === 0) {
            const lang = localStorage.getItem('preferredLanguage') || 'fr';
            const msg = (typeof translations !== 'undefined' && translations[lang]) ? translations[lang]['search_no_results'] : "Aucun résultat trouvé";
            suggestionsBox.innerHTML = `<div class="p-3 text-sm text-gray-500">${msg}</div>`;
            suggestionsBox.classList.remove('hidden');
            return;
        }

        const html = results.map(page => `
      <a href="${page.url}" class="block px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-0 transition-colors text-left">
        <div class="font-semibold text-blue-900">${page.title}</div>
        <div class="text-xs text-gray-500 truncate">${page.content}</div>
      </a>
    `).join('');

        suggestionsBox.innerHTML = html;
        suggestionsBox.classList.remove('hidden');
    }

    searchInput.addEventListener('input', (e) => {
        performSearch(e.target.value);
    });
});
