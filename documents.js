const folderData = [
    {
        title: "Blue Africa Summit 2025",
        files: [
            { name: "Booklet-Blue-Africa-Summit-2025.pdf", path: "Booklet-Blue-Africa-Summit-2025.pdf" },
            { name: "Brochure-Blue-Africa-Summit-2025.pdf", path: "Brochure-Blue-Africa-Summit-2025.pdf" },
            { name: "Declaration-de-Tanger-2025-FR.pdf", path: "Declaration-de-Tanger-2025-FR.pdf" },
            { name: "Tangier-Declaration-–-Blue-Africa-Summit-2025.docx.pdf", path: "Tangier-Declaration-–-Blue-Africa-Summit-2025.pdf" }
        ]
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('documents-grid');
    const modal = document.getElementById('pdf-modal');
    const closeBtn = document.getElementById('close-pdf-modal');
    const pdfContainer = document.getElementById('pdf-flipbook-container');

    // Render Folders
    folderData.forEach((folderItem, folderIndex) => {
        const folderWrapper = document.createElement('div');
        folderWrapper.className = 'folder-wrapper flex flex-col items-center justify-center p-4 relative'; // relative for click outside check if needed

        // Generate Papers HTML
        // We will generate a div for each file.
        // The visual stacking will be handled by CSS/JS.
        const papersHtml = folderItem.files.map((file, i) => `
            <div class="paper" data-pdf="${file.path}" data-index="${i}" title="${file.name}">
                <div class="w-full h-full bg-white flex flex-col items-center justify-center text-xs text-center p-1 overflow-hidden border border-gray-100">
                     <i data-lucide="file-text" class="w-8 h-8 mb-2 text-blue-500"></i>
                     <span class="line-clamp-2 leading-tight">${file.name}</span>
                </div>
            </div>
        `).join('');

        // Folder HTML Structure
        folderWrapper.innerHTML = `
            <div class="folder-container">
                <div class="folder" data-index="${folderIndex}">
                    <div class="folder__back">
                        ${papersHtml}
                        <div class="folder__front"></div>
                        <div class="folder__front right"></div>
                    </div>
                </div>
            </div>
            <div class="folder-label mt-8 max-w-[250px] leading-tight text-center font-semibold text-slate-700 text-lg">${folderItem.title}</div>
        `;

        grid.appendChild(folderWrapper);

        // Re-initialize icons for the new content
        if (window.lucide) window.lucide.createIcons();

        // Event Listeners for this folder
        const folder = folderWrapper.querySelector('.folder');
        const papers = folder.querySelectorAll('.paper');

        // Click to open folder
        folder.addEventListener('click', (e) => {
            // Prevent toggling if clicking on a paper to open PDF (handled in paper click)
            if (e.target.closest('.paper') && folder.classList.contains('open')) return;

            e.stopPropagation(); // Prevent document click from closing immediately

            // Close other folders
            document.querySelectorAll('.folder-wrapper').forEach(w => {
                if (w !== folderWrapper && w.querySelector('.folder').classList.contains('open')) {
                    if (w.close) w.close();
                }
            });

            if (folder.classList.contains('open')) {
                if (folderWrapper.close) folderWrapper.close();
            } else {
                folder.classList.add('open');
            }
        });

        // Magnet Effect & Fan Out for Papers
        papers.forEach((paper, i) => {
            // Calculate random-ish but deterministic rotation/position for "messy folder" look or fanned out
            // We'll use the index to fan them out.

            paper.addEventListener('mousemove', (e) => {
                if (!folder.classList.contains('open')) return;

                const rect = paper.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                // Calculate offset
                const offsetX = (e.clientX - centerX) * 0.3;
                const offsetY = (e.clientY - centerY) * 0.3;

                const baseTransform = getFanTransform(i, folderItem.files.length);
                paper.style.transform = `translate(calc(${baseTransform.x} + ${offsetX}px), calc(${baseTransform.y} + ${offsetY}px)) rotateZ(${baseTransform.r}) scale(1.1)`;
                paper.style.zIndex = 10 + i; // Bring hovered to front? Or just keep order.
            });

            paper.addEventListener('mouseleave', () => {
                if (!folder.classList.contains('open')) return;
                const baseTransform = getFanTransform(i, folderItem.files.length);
                paper.style.transform = `translate(${baseTransform.x}, ${baseTransform.y}) rotateZ(${baseTransform.r})`;
                paper.style.zIndex = i + 1;
            });

            // Click on paper to open PDF
            paper.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!folder.classList.contains('open')) {
                    folder.classList.add('open');
                    return;
                }

                const pdfPath = paper.getAttribute('data-pdf');
                if (pdfPath) {
                    openPDF(pdfPath);
                }
            });
        });

        // Initial positioning (hidden inside folder)
        // We rely on CSS for the closed state (all centered/hidden)
        // But we need to set the "open" state transforms dynamically in CSS or JS?
        // Let's use a MutationObserver or just set custom properties if we were using CSS.
        // Since we are using JS for the fan out, we can update the style attribute when 'open' class changes.

        // Actually, simpler: Update styles whenever 'open' class is added/removed? 
        // Or just use the CSS transition with CSS variables?
        // Problem: CSS needs to know the "open" state. 
        // Solution: We'll set CSS variables on the paper elements for their "open" position.

        papers.forEach((paper, i) => {
            const transform = getFanTransform(i, folderItem.files.length);
            paper.style.setProperty('--open-x', transform.x);
            paper.style.setProperty('--open-y', transform.y);
            paper.style.setProperty('--open-r', transform.r);
            paper.style.zIndex = i + 1;
            paper.style.setProperty('--open-r', transform.r);
            paper.style.zIndex = i + 1;
        });

        // Helper to close folder and reset papers
        folderWrapper.close = function () {
            folder.classList.remove('open');
            // Clear inline transforms so CSS closed state takes over
            papers.forEach(p => {
                p.style.transform = '';
            });
        };
    });

    // Helper for Fan Out Transforms
    function getFanTransform(index, total) {
        // Distribute papers horizontally and vertically
        // Center is roughly 50% 50% relative to folder back
        // We want them to pop out.

        // Example distribution:
        // If 2 items: left-ish, right-ish
        // If 4 items: spread out

        // We'll use a simple spread logic
        const spreadX = 40; // %
        const spreadY = 60; // %

        // Normalize index to -1 to 1 range
        const t = total > 1 ? index / (total - 1) : 0.5;
        const offsetT = (t - 0.5) * 2; // -1 to 1

        // Randomize slightly to look natural
        const randomRot = (index % 2 === 0 ? 1 : -1) * (5 + index * 5);

        // X: -50% is center. We want to go from say -80% to -20%
        const x = -50 + (offsetT * 40) + '%';

        // Y: -100% is top (out of folder). We want them to stick out.
        // Let's stagger Y slightly
        const y = -90 - (Math.abs(offsetT) * 20) + '%';

        return { x: x, y: y, r: `${randomRot}deg` };
    }

    // Click Outside to Close Folders
    document.addEventListener('click', (e) => {
        // If the click is NOT inside a folder (or its children), close all open folders
        if (!e.target.closest('.folder')) {
            document.querySelectorAll('.folder-wrapper').forEach(w => {
                if (w.close) w.close();
            });
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.folder-wrapper').forEach(w => {
                if (w.close) w.close();
            });
            // Also close modal if open
            if (!modal.classList.contains('hidden')) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
                pdfContainer.innerHTML = '';
            }
        }
    });

    // PDF Modal Logic
    function openPDF(path) {
        pdfContainer.innerHTML = '';
        modal.classList.remove('hidden');
        modal.classList.add('flex');

        setTimeout(() => {
            const options = {
                height: '100%',
                duration: 800,
                backgroundColor: "#2f3640"
            };

            const flipbookDiv = document.createElement('div');
            flipbookDiv.className = '_df_book';
            flipbookDiv.setAttribute('source', path);
            flipbookDiv.setAttribute('id', 'df_book_custom');
            pdfContainer.appendChild(flipbookDiv);

            if (window.jQuery && window.jQuery(flipbookDiv).flipBook) {
                window.jQuery(flipbookDiv).flipBook(path, options);
            }
        }, 100);
    }

    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        pdfContainer.innerHTML = '';
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            pdfContainer.innerHTML = '';
        }
    });
});
