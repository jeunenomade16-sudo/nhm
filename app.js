document.addEventListener('DOMContentLoaded', () => {
    // Configurations and State
    const state = {
        top: 'charcoal', // charcoal, oak, marble, glass
        base: 'metal',  // metal, brass, chrome
        size: 200,      // 160, 200, 240
        basePrice: 1890,
        cartCount: 0
    };

    // Mapping combinations of [top] + [base] to realistic images
    const imageMapping = {
        // Charcoal wood combinations
        'charcoal+metal': 'charcoal_table.png',
        'charcoal+brass': 'charcoal_brass.png',
        'charcoal+chrome': 'charcoal_chrome.png',

        // Oak wood combinations
        'oak+metal': 'oak_black.png',
        'oak+brass': 'oak_brass.png',
        'oak+chrome': 'oak_chrome.png',

        // White Marble combinations
        'marble+metal': 'marble_metal.png',
        'marble+brass': 'marble_brass.png',
        'marble+chrome': 'marble_metal.png', // Fallback for marble+chrome

        // Glass combinations
        'glass+chrome': 'glass_chrome.png',
        'glass+metal': 'glass_chrome.png',  // Fallback for glass+metal
        'glass+brass': 'glass_chrome.png'   // Fallback for glass+brass
    };

    // DOM Elements
    const tablePreview = document.getElementById('table-preview');
    const selectedTopLabel = document.getElementById('selected-top');
    const selectedBaseLabel = document.getElementById('selected-base');
    const selectedSizeLabel = document.getElementById('selected-size');
    const productPriceEl = document.getElementById('product-price');

    const swatchBtns = document.querySelectorAll('.swatch-btn');
    const sizeBtns = document.querySelectorAll('.size-btn');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    const btnAddToCart = document.getElementById('btn-add-to-cart');
    const cartBadge = document.querySelector('.cart-badge');

    // Modal Elements
    const cartModal = document.getElementById('cart-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const btnContinueShopping = document.getElementById('btn-continue-shopping');
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalDescText = document.getElementById('modal-description-text');
    const modalPriceVal = document.getElementById('modal-price-val');

    // UI Action buttons on Preview
    const btnZoom = document.getElementById('btn-zoom');
    const btnRotate = document.getElementById('btn-rotate');
    const btnShare = document.getElementById('btn-share');

    // Function to calculate and update price
    function updatePrice() {
        let price = state.basePrice;

        // Add modifier for top
        const activeTopBtn = document.querySelector('.swatch-btn[data-type="top"].active');
        if (activeTopBtn) {
            price += parseInt(activeTopBtn.getAttribute('data-price-mod') || '0', 10);
        }

        // Add modifier for base
        const activeBaseBtn = document.querySelector('.swatch-btn[data-type="base"].active');
        if (activeBaseBtn) {
            price += parseInt(activeBaseBtn.getAttribute('data-price-mod') || '0', 10);
        }

        // Add modifier for size
        const activeSizeBtn = document.querySelector('.size-btn.active');
        if (activeSizeBtn) {
            price += parseInt(activeSizeBtn.getAttribute('data-price-mod') || '0', 10);
        }

        // Format price
        productPriceEl.textContent = price.toLocaleString('fr-FR') + ' €';
        productPriceEl.classList.add('updating');
        setTimeout(() => productPriceEl.classList.remove('updating'), 300);
        return price;
    }

    // Function to update preview image based on state
    function updatePreviewImage() {
        const key = `${state.top}+${state.base}`;
        const targetImage = imageMapping[key] || 'charcoal_table.png';

        // Apply smooth fade out, change source, and fade in
        tablePreview.classList.remove('active');

        setTimeout(() => {
            tablePreview.src = targetImage;
            tablePreview.classList.add('active');
        }, 150);
    }

    // Swatches selection logic
    swatchBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = btn.getAttribute('data-type');
            const value = btn.getAttribute('data-value');
            const label = btn.getAttribute('data-label');

            if (type === 'top') {
                state.top = value;
                selectedTopLabel.textContent = label;

                // Toggle active class for tabletop swatches
                document.querySelectorAll('.swatch-btn[data-type="top"]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            } else if (type === 'base') {
                state.base = value;
                selectedBaseLabel.textContent = label;

                // Toggle active class for base swatches
                document.querySelectorAll('.swatch-btn[data-type="base"]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }

            updatePreviewImage();
            updatePrice();
        });
    });

    // Size selection logic
    sizeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sizeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            state.size = parseInt(btn.getAttribute('data-size'), 10);
            selectedSizeLabel.textContent = btn.getAttribute('data-label');

            updatePrice();
        });
    });

    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetTab = btn.getAttribute('data-tab');
            document.getElementById(`tab-${targetTab}`).classList.add('active');
        });
    });

    // Zoom and quick preview actions
    let isZoomed = false;
    btnZoom.addEventListener('click', () => {
        isZoomed = !isZoomed;
        if (isZoomed) {
            tablePreview.style.transform = 'scale(1.25)';
            btnZoom.innerHTML = '<i class="fa-solid fa-compress"></i>';
        } else {
            tablePreview.style.transform = 'scale(1)';
            btnZoom.innerHTML = '<i class="fa-solid fa-expand"></i>';
        }
    });

    let angle = 0;
    btnRotate.addEventListener('click', () => {
        angle = (angle + 90) % 360;
        tablePreview.style.filter = `hue-rotate(${angle}deg) drop-shadow(0 15px 30px rgba(0,0,0,0.7))`;

        // Visual notification
        btnRotate.style.transform = 'scale(1.15)';
        setTimeout(() => {
            btnRotate.style.transform = 'scale(1)';
        }, 150);
    });

    btnShare.addEventListener('click', () => {
        if (navigator.share) {
            navigator.share({
                title: 'Ma configuration de table Atelier NHM',
                text: `Découvrez ma table NHM-1 configurée en ${selectedTopLabel.textContent} avec piètement ${selectedBaseLabel.textContent}.`,
                url: window.location.href
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(window.location.href).then(() => {
                alert('Lien de partage copié dans le presse-papiers !');
            }).catch(() => {
                alert('Impossible de copier le lien. Veuillez copier l\'URL de votre navigateur.');
            });
        }
    });

    // Cart loading and modal display
    btnAddToCart.addEventListener('click', () => {
        btnAddToCart.classList.add('loading');

        setTimeout(() => {
            btnAddToCart.classList.remove('loading');

            // Increment cart count
            state.cartCount++;
            cartBadge.textContent = state.cartCount;
            cartBadge.style.transform = 'scale(1.3)';
            setTimeout(() => {
                cartBadge.style.transform = 'scale(1)';
            }, 300);

            // Populate and show Modal
            const currentPrice = updatePrice();
            const key = `${state.top}+${state.base}`;
            modalImg.src = imageMapping[key] || 'charcoal_table.png';
            modalDescText.textContent = `${selectedTopLabel.textContent} & ${selectedBaseLabel.textContent} - ${state.size} cm`;
            modalPriceVal.textContent = currentPrice.toLocaleString('fr-FR') + ' €';

            cartModal.classList.add('active');
            document.body.classList.add('no-scroll');
            modalCloseBtn.focus();
        }, 1200);
    });

    // Close Modal
    function closeModal() {
        cartModal.classList.remove('active');
        document.body.classList.remove('no-scroll');
        btnAddToCart.focus();
    }

    modalCloseBtn.addEventListener('click', closeModal);
    btnContinueShopping.addEventListener('click', closeModal);
    cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) closeModal();
    });

    // Focus Trap & Escape to close
    cartModal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
        if (e.key === 'Tab') {
            const focusableElements = cartModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusableElements.length === 0) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        }
    });

    // Initial setup
    updatePrice();
});
