// ============================================
// INDEX.JS - Using shared-api.js
// ============================================

// ============================================
// INITIALIZE YEAR AND CORE FUNCTIONS
// ============================================
document.getElementById("currentYear").textContent = new Date().getFullYear();

// ============================================
// HELPERS (counts, featured selection)
// ============================================
function calculateCountsFromProperties(properties) {
    const counts = {
        byLocation: {},
        byType: {},
        byTransaction: { sale: 0, rent: 0, plots: 0 }
    };
    
    properties.forEach(p => {
        if (p.status !== 'available') return;
        
        if (p.location) {
            counts.byLocation[p.location] = (counts.byLocation[p.location] || 0) + 1;
        }
        if (p.type) {
            counts.byType[p.type] = (counts.byType[p.type] || 0) + 1;
        }
        if (p.transaction === 'sale') {
            counts.byTransaction.sale++;
        } else if (p.transaction === 'rent') {
            counts.byTransaction.rent++;
        } else if (p.transaction === 'lease') {
            counts.byTransaction.rent++;
        }
        const landTypes = ['land-res', 'land-comm', 'ranch'];
        if (landTypes.includes(p.type)) {
            counts.byTransaction.plots++;
        }
    });
    return counts;
}

async function getFeaturedProperties(limit = 8) {
    const all = await PropertyAPI.fetchAllProperties();
    const available = all.filter(p => p.status === 'available');
    const saleProps = available.filter(p => p.transaction === 'sale');
    const rentProps = available.filter(p => p.transaction === 'rent');
    const featured = [...saleProps.slice(0, 5), ...rentProps.slice(0, 3)];
    return featured.slice(0, limit);
}

// ============================================
// SHOW LOADING INDICATORS
// ============================================
function showLoadingIndicators() {
    const allDropdownLinks = document.querySelectorAll('.dropdown-menu li a');
    allDropdownLinks.forEach(link => {
        let currentText = link.textContent;
        currentText = currentText.replace(/\s*\([^)]*\)\s*$/, '').trim();
        link.innerHTML = `${currentText} <span class="item-count" style="color: #888; font-size: 11px;">(...)</span>`;
    });
    
    const navLinks = document.querySelectorAll('.nav-links li > a');
    navLinks.forEach(link => {
        if (!link.querySelector('.fa-chevron-down')) return;
        const existingSpan = link.querySelector('.count-loading, .main-count');
        if (!existingSpan) {
            const loadingSpan = document.createElement('span');
            loadingSpan.className = 'count-loading';
            loadingSpan.style.cssText = 'color: #888; font-size: 11px; margin-left: 4px;';
            loadingSpan.textContent = '(...)';
            const chevron = link.querySelector('.fa-chevron-down');
            if (chevron) {
                link.insertBefore(loadingSpan, chevron);
            } else {
                link.appendChild(loadingSpan);
            }
        }
    });
}

// ============================================
// MODAL SYSTEM (same as before)
// ============================================
let currentModalProperty = null;
let currentKeyDownHandler = null;

function createModal() {
    if (document.getElementById('propertyModal')) return;
    
    const modalHTML = `
        <div class="property-modal" id="propertyModal">
            <div class="modal-content">
                <div class="modal-close" id="modalClose">
                    <i class="fas fa-times"></i>
                </div>
                <div class="modal-body" id="modalBody">
                    <div class="modal-gallery">
                        <div class="main-image-container">
                            <img src="" alt="" class="main-image" id="modalMainImage">
                            <button class="gallery-nav gallery-prev" id="modalPrevBtn"><i class="fas fa-chevron-left"></i></button>
                            <button class="gallery-nav gallery-next" id="modalNextBtn"><i class="fas fa-chevron-right"></i></button>
                            <div class="image-counter" id="imageCounter">1 / 1</div>
                        </div>
                        <div class="thumbnails" id="thumbnails"></div>
                    </div>
                    <div class="modal-info">
                        <div class="modal-top">
                            <h2 id="modalTitle">Property Title</h2>
                            <div class="modal-price" id="modalPrice">KES 0</div>
                        </div>
                        <div class="info-grid" id="modalInfoGrid"></div>
                        <div class="modal-section" id="modalDescription"></div>
                        <div class="modal-section" id="modalFeatures"></div>
                    </div>
                    <div class="modal-actions">
                        <a href="#" id="modalWhatsappBtn" class="btn btn-whatsapp" target="_blank"><i class="fab fa-whatsapp"></i> WhatsApp Inquiry</a>
                        <a href="tel:+254721911181" class="btn btn-secondary"><i class="fas fa-phone"></i> Call Now</a>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    if (!document.querySelector('#modal-styles')) {
        const style = document.createElement('style');
        style.id = 'modal-styles';
        style.textContent = `
            .property-modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.85);
                z-index: 10000;
                overflow-y: auto;
            }
            .property-modal.active { display: block; }
            .modal-content {
                position: relative;
                background: white;
                max-width: 900px;
                margin: 50px auto;
                border-radius: 20px;
                overflow: hidden;
                animation: modalFadeIn 0.3s ease;
            }
            @keyframes modalFadeIn {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .modal-close {
                position: absolute;
                top: 15px;
                right: 15px;
                width: 40px;
                height: 40px;
                background: rgba(0,0,0,0.6);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 10;
                transition: 0.2s;
            }
            .modal-close:hover { background: #dc3545; transform: rotate(90deg); }
            .main-image-container {
                position: relative;
                height: 400px;
                background: #f0f0f0;
            }
            .main-image {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .gallery-nav {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                background: rgba(0,0,0,0.6);
                color: white;
                border: none;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
                z-index: 10;
            }
            .gallery-prev { left: 15px; }
            .gallery-next { right: 15px; }
            .image-counter {
                position: absolute;
                bottom: 15px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0,0,0,0.6);
                color: white;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
            }
            .thumbnails {
                display: flex;
                gap: 10px;
                padding: 15px;
                overflow-x: auto;
                background: #f8f9fa;
            }
            .thumbnail {
                width: 80px;
                height: 60px;
                object-fit: cover;
                border-radius: 8px;
                cursor: pointer;
                opacity: 0.6;
                transition: 0.2s;
            }
            .thumbnail.active, .thumbnail:hover { opacity: 1; border: 2px solid #25D366; }
            .modal-info { padding: 25px; }
            .modal-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 15px; }
            .modal-price { font-size: 24px; font-weight: 700; color: #25D366; }
            .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 25px; }
            .info-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .modal-section { margin-bottom: 25px; }
            .modal-section h3 { margin-bottom: 10px; font-size: 18px; }
            .features-grid { display: flex; flex-wrap: wrap; gap: 10px; }
            .feature-tag { background: #e8f5e9; color: #2e7d32; padding: 6px 14px; border-radius: 20px; font-size: 13px; }
            .modal-actions { display: flex; gap: 15px; padding: 20px 25px; background: #f8f9fa; border-top: 1px solid #eee; }
            .modal-actions .btn { flex: 1; text-align: center; padding: 12px; border-radius: 40px; text-decoration: none; font-weight: 600; }
            .btn-whatsapp { background: #25D366; color: white; }
            .btn-secondary { background: #1a5f7a; color: white; }
            @media (max-width: 768px) {
                .modal-content { margin: 0; border-radius: 0; height: 100vh; overflow-y: auto; }
                .main-image-container { height: 300px; }
                .thumbnail { width: 60px; height: 45px; }
                .modal-top { flex-direction: column; align-items: flex-start; }
                .modal-actions { flex-direction: column; }
            }
        `;
        document.head.appendChild(style);
    }
}

function openPropertyModal(property) {
    if (!property) return;
    currentModalProperty = property;
    createModal();
    
    const modal = document.getElementById('propertyModal');
    const modalBody = document.getElementById('modalBody');
    if (!modal || !modalBody) return;
    
    const images = property.images && property.images.length ? property.images : [PropertyAPI.getPlaceholder()];
    let currentImageIndex = 0;
    
    function updateGallery() {
        const mainImage = document.getElementById('modalMainImage');
        const counter = document.getElementById('imageCounter');
        const thumbnails = document.getElementById('thumbnails');
        
        if (mainImage) mainImage.src = images[currentImageIndex];
        if (counter) counter.textContent = `${currentImageIndex + 1} / ${images.length}`;
        
        if (thumbnails) {
            thumbnails.innerHTML = images.map((img, idx) => `
                <img src="${img}" class="thumbnail ${idx === currentImageIndex ? 'active' : ''}" data-index="${idx}" onerror="this.src='${PropertyAPI.getPlaceholder()}'">
            `).join('');
            
            thumbnails.querySelectorAll('.thumbnail').forEach(thumb => {
                thumb.addEventListener('click', () => {
                    currentImageIndex = parseInt(thumb.dataset.index);
                    updateGallery();
                });
            });
        }
    }
    
    document.getElementById('modalTitle').textContent = property.title;
    document.getElementById('modalPrice').textContent = property.priceDisplay;
    document.getElementById('modalMainImage').src = images[0];
    document.getElementById('modalMainImage').onerror = function() { this.src = PropertyAPI.getPlaceholder(); };
    document.getElementById('imageCounter').textContent = `1 / ${images.length}`;
    
    const infoGrid = document.getElementById('modalInfoGrid');
    infoGrid.innerHTML = `
        <div class="info-item"><strong><i class="fas fa-map-marker-alt"></i> Location:</strong> <span>${PropertyAPI.formatLocation(property.location)}</span></div>
        <div class="info-item"><strong><i class="fas fa-home"></i> Type:</strong> <span>${property.type}</span></div>
        ${property.bedrooms > 0 ? `<div class="info-item"><strong><i class="fas fa-bed"></i> Bedrooms:</strong> <span>${property.bedrooms}</span></div>` : ''}
        ${property.bathrooms > 0 ? `<div class="info-item"><strong><i class="fas fa-bath"></i> Bathrooms:</strong> <span>${property.bathrooms}</span></div>` : ''}
        ${property.size ? `<div class="info-item"><strong><i class="fas fa-expand"></i> Size:</strong> <span>${property.size}</span></div>` : ''}
        <div class="info-item"><strong><i class="fas fa-exchange-alt"></i> Status:</strong> <span style="color: #28a745;">${property.status.toUpperCase()}</span></div>
    `;
    
    const descSection = document.getElementById('modalDescription');
    descSection.innerHTML = property.description ? `<h3><i class="fas fa-align-left"></i> Description</h3><p>${property.description}</p>` : '';
    
    const featuresSection = document.getElementById('modalFeatures');
    featuresSection.innerHTML = property.features && property.features.length ? `
        <h3><i class="fas fa-star"></i> Features</h3>
        <div class="features-grid">${property.features.map(f => `<span class="feature-tag">${f}</span>`).join('')}</div>
    ` : '';
    
    const whatsappBtn = document.getElementById('modalWhatsappBtn');
    whatsappBtn.href = `https://wa.me/${property.whatsapp}?text=${encodeURIComponent(`Hi, I'm interested in "${property.title}" at ${PropertyAPI.formatLocation(property.location)}. Price: ${property.priceDisplay}`)}`;
    
    const thumbnails = document.getElementById('thumbnails');
    thumbnails.innerHTML = images.map((img, idx) => `
        <img src="${img}" class="thumbnail ${idx === 0 ? 'active' : ''}" data-index="${idx}" onerror="this.src='${PropertyAPI.getPlaceholder()}'">
    `).join('');
    
    thumbnails.querySelectorAll('.thumbnail').forEach(thumb => {
        thumb.addEventListener('click', () => {
            currentImageIndex = parseInt(thumb.dataset.index);
            updateGallery();
        });
    });
    
    const prevBtn = document.getElementById('modalPrevBtn');
    const nextBtn = document.getElementById('modalNextBtn');
    
    const navigate = (direction) => {
        if (direction === 'prev') {
            currentImageIndex = currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;
        } else {
            currentImageIndex = currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1;
        }
        updateGallery();
    };
    
    prevBtn.onclick = () => navigate('prev');
    nextBtn.onclick = () => navigate('next');
    
    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        if (currentKeyDownHandler) {
            document.removeEventListener('keydown', currentKeyDownHandler);
        }
    };
    
    document.getElementById('modalClose').onclick = closeModal;
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };
    
    currentKeyDownHandler = (e) => {
        if (e.key === 'ArrowLeft') navigate('prev');
        else if (e.key === 'ArrowRight') navigate('next');
        else if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', currentKeyDownHandler);
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// ============================================
// UPDATE NAVBAR WITH COUNTS (using PropertyAPI)
// ============================================
async function updateNavbarWithCounts(retryCount = 0) {
    const maxRetries = 3;
    
    try {
        const properties = await PropertyAPI.fetchAllProperties();
        const counts = calculateCountsFromProperties(properties);
        
        console.log('Property Counts from API:', counts);
        console.log('Total properties loaded:', properties.length);
        
        if (properties.length === 0 && retryCount < maxRetries) {
            console.log(`No properties found, retrying... (${retryCount + 1}/${maxRetries})`);
            setTimeout(() => updateNavbarWithCounts(retryCount + 1), 2000);
            return;
        }
        
        function updateMainLinkText(link, baseText, count) {
            if (!link) return;
            const existingSpan = link.querySelector('.main-count, .count-loading');
            if (existingSpan) existingSpan.remove();
            const countSpan = document.createElement('span');
            countSpan.className = 'main-count';
            countSpan.style.cssText = 'color: #25D366; font-size: 12px; margin-left: 4px;';
            countSpan.textContent = `(${count})`;
            const chevron = link.querySelector('.fa-chevron-down');
            if (chevron) {
                link.insertBefore(countSpan, chevron);
            } else {
                link.appendChild(countSpan);
            }
        }
        
        function updateDropdownItemText(link, itemName, count) {
            if (!link) return;
            let currentText = link.textContent;
            currentText = currentText.replace(/\s*\([^)]*\)\s*$/, '').trim();
            link.innerHTML = `${currentText} <span class="item-count" style="color: #25D366; font-size: 11px; margin-left: 4px;">(${count})</span>`;
        }
        
        // Rentals Section
        const rentalsNav = document.querySelector('.nav-links li:first-child > a');
        if (rentalsNav) updateMainLinkText(rentalsNav, 'Rentals', counts.byTransaction?.rent || 0);
        
        const rentalTypes = ['bungalow', 'maisonette', 'townhouse', 'apartment', 'studio', 'villa', 'furnished'];
        const rentalDropdownLinks = document.querySelectorAll('.nav-links li:first-child .dropdown-menu li a');
        rentalDropdownLinks.forEach((link, index) => {
            if (rentalTypes[index]) updateDropdownItemText(link, rentalTypes[index], counts.byType?.[rentalTypes[index]] || 0);
        });
        
        // For Sale Section
        const forSaleNav = document.querySelector('.nav-links li:nth-child(2) > a');
        if (forSaleNav) updateMainLinkText(forSaleNav, 'For Sale', counts.byTransaction?.sale || 0);
        
        const saleTypes = ['bungalow', 'maisonette', 'townhouse', 'apartment', 'villa'];
        const saleDropdownLinks = document.querySelectorAll('.nav-links li:nth-child(2) .dropdown-menu li a');
        saleDropdownLinks.forEach((link, index) => {
            if (saleTypes[index]) updateDropdownItemText(link, saleTypes[index], counts.byType?.[saleTypes[index]] || 0);
        });
        
        // Lands & Plots Section
        const plotsNav = document.querySelector('.nav-links li:nth-child(3) > a');
        if (plotsNav) updateMainLinkText(plotsNav, 'Lands & Plots', counts.byTransaction?.plots || 0);
        
        const landTypes = ['land-res', 'land-comm', 'ranch'];
        const landDisplay = ['Residential Plot', 'Commercial Land', 'Agricultural'];
        const landDropdownLinks = document.querySelectorAll('.nav-links li:nth-child(3) .dropdown-menu li a');
        landDropdownLinks.forEach((link, index) => {
            if (landTypes[index]) updateDropdownItemText(link, landDisplay[index], counts.byType?.[landTypes[index]] || 0);
        });
        
        // Airbnb Section
        const airbnbNav = document.querySelector('.nav-links li:nth-child(4) > a');
        if (airbnbNav) updateMainLinkText(airbnbNav, 'Airbnb', counts.byTransaction?.rent || 0);
        
        const locations = ['kitengela', 'ngong', 'syokimau', 'ongata-rongai', 'athi-river', 'kilimani'];
        const locationDisplay = ['Kitengela', 'Ngong', 'Syokimau', 'Ongata Rongai', 'Athi River', 'Kilimani'];
        const airbnbLinks = document.querySelectorAll('.nav-links li:nth-child(4) .dropdown-menu li a');
        airbnbLinks.forEach((link, index) => {
            if (locations[index]) updateDropdownItemText(link, locationDisplay[index], counts.byLocation?.[locations[index]] || 0);
        });
        
        // Locations Section
        const locationsNav = document.querySelector('.nav-links li:nth-child(5) > a');
        if (locationsNav) updateMainLinkText(locationsNav, 'Locations', properties.filter(p => p.status === 'available').length);
        
        const locationLinks = document.querySelectorAll('.nav-links li:nth-child(5) .dropdown-menu li a');
        locationLinks.forEach((link, index) => {
            if (locations[index]) updateDropdownItemText(link, locationDisplay[index], counts.byLocation?.[locations[index]] || 0);
        });
        
        console.log('Navbar counts updated successfully!');
        
    } catch (error) {
        console.error('Error updating navbar counts:', error);
        if (retryCount < maxRetries) {
            setTimeout(() => updateNavbarWithCounts(retryCount + 1), 2000);
        }
    }
}

// ============================================
// LOAD DYNAMIC FEATURED PROPERTIES (using getFeaturedProperties)
// ============================================
async function loadFeaturedProperties() {
    const featuredContainer = document.getElementById('featuredPropertiesGrid');
    if (!featuredContainer) return;
    
    featuredContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px;">
            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #25D366;"></i>
            <p style="margin-top: 15px;">Loading verified properties...</p>
        </div>
    `;
    
    try {
        const properties = await getFeaturedProperties(8);
        
        if (properties && properties.length > 0) {
            featuredContainer.innerHTML = properties.map(property => `
                <div class="listing-card" data-property-id="${property.id}">
                    <div class="listing-image">
                        <img src="${property.images?.[0] || PropertyAPI.getPlaceholder()}" 
                             alt="${property.title}" loading="lazy"
                             onerror="this.src='${PropertyAPI.getPlaceholder()}'">
                        <div class="listing-badges"><span class="badge-verified">Verified</span></div>
                        <div class="price-tag">${property.priceDisplay}</div>
                    </div>
                    <div class="listing-body">
                        <p class="listing-location"><i class="fas fa-map-marker-alt"></i> ${PropertyAPI.formatLocation(property.location)}</p>
                        <h3>${property.title.length > 35 ? property.title.substring(0, 35) + '...' : property.title}</h3>
                        <div class="listing-specs">
                            ${property.bedrooms > 0 ? `<span><i class="fas fa-bed"></i> ${property.bedrooms}</span>` : ''}
                            ${property.bathrooms > 0 ? `<span><i class="fas fa-bath"></i> ${property.bathrooms}</span>` : ''}
                            ${property.size ? `<span><i class="fas fa-expand"></i> ${property.size}</span>` : ''}
                        </div>
                        <button class="btn-view-details view-property-btn" data-id="${property.id}">View Property</button>
                    </div>
                </div>
            `).join('');
            
            document.querySelectorAll('.view-property-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = btn.dataset.id;
                    const allProps = await PropertyAPI.fetchAllProperties();
                    const property = allProps.find(p => p.id == id);
                    if (property) openPropertyModal(property);
                });
            });
        } else {
            featuredContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 60px;"><p>No featured properties available at the moment.</p></div>`;
        }
    } catch (error) {
        console.error('Error loading featured properties:', error);
        featuredContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 60px;"><p>Unable to load properties. Please refresh the page.</p><button onclick="location.reload()" style="margin-top: 15px; padding: 10px 24px; background: #25D366; color: white; border: none; border-radius: 40px; cursor: pointer;">Retry</button></div>`;
    }
}

// ============================================
// HERO SEARCH FUNCTIONALITY
// ============================================
function setupHeroSearch() {
    const heroSearchBtn = document.getElementById('heroSearchBtn');
    const heroLocation = document.getElementById('heroLocation');
    const heroType = document.getElementById('heroType');
    
    const performSearch = () => {
        const params = new URLSearchParams();
        if (heroLocation && heroLocation.value) params.set('location', heroLocation.value);
        if (heroType && heroType.value) params.set('type', heroType.value);
        window.location.href = `locations.html?${params.toString()}`;
    };
    
    if (heroSearchBtn) heroSearchBtn.addEventListener('click', performSearch);
    if (heroLocation) heroLocation.addEventListener('keypress', (e) => { if (e.key === 'Enter') performSearch(); });
    if (heroType) heroType.addEventListener('keypress', (e) => { if (e.key === 'Enter') performSearch(); });
}

// ============================================
// NAVBAR LINK HANDLERS
// ============================================
function setupNavbarLinks() {
    const allDropdownLinks = document.querySelectorAll('.dropdown-menu a');
    allDropdownLinks.forEach(link => {
        if (link.hasAttribute('data-listener')) return;
        link.setAttribute('data-listener', 'true');
        link.addEventListener('click', (e) => {
            console.log('Navigating to:', link.getAttribute('href'));
        });
    });
}

// ============================================
// MOBILE MENU FUNCTIONS
// ============================================
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.getElementById("mobileMenu");
const mobileOverlay = document.getElementById("mobileOverlay");
const closeBtn = document.getElementById("closeMobileMenu");

function openMenu() {
    mobileMenu.classList.add("active");
    mobileOverlay.classList.add("active");
    if(menuToggle) menuToggle.classList.add("active");
    document.body.style.overflow = 'hidden';
}

function closeMenu() {
    mobileMenu.classList.remove("active");
    mobileOverlay.classList.remove("active");
    if(menuToggle) menuToggle.classList.remove("active");
    document.body.style.overflow = '';
}

if(menuToggle) menuToggle.addEventListener("click", openMenu);
if(closeBtn) closeBtn.addEventListener("click", closeMenu);
if(mobileOverlay) mobileOverlay.addEventListener("click", closeMenu);
document.addEventListener("keydown", (e) => { 
    if(e.key === "Escape" && mobileMenu.classList.contains("active")) closeMenu(); 
});

const mobileSearchInput = document.getElementById('mobileSearchInput');
if (mobileSearchInput) {
    mobileSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = e.target.value.trim();
            if (query) window.location.href = `locations.html?search=${encodeURIComponent(query)}`;
        }
    });
}

// ============================================
// TESTIMONIALS SWIPER
// ============================================
new Swiper(".reviewSwiper", {
    slidesPerView: 1, spaceBetween: 24, loop: true, autoplay: { delay: 4500 },
    pagination: { el: ".swiper-pagination", clickable: true },
    breakpoints: { 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }
});

// ============================================
// MAP INITIALIZATION
// ============================================
const map = L.map('map').setView([-1.2921, 36.8219], 11);
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
}).addTo(map);

const mapLocations = [
    { coords: [-1.2921, 36.8219], name: "Kilimani" }, { coords: [-1.365, 36.816], name: "Syokimau" },
    { coords: [-1.464, 36.976], name: "Kitengela" }, { coords: [-1.395, 36.789], name: "Ongata Rongai" },
    { coords: [-1.457, 36.978], name: "Athi River" }, { coords: [-1.361, 36.641], name: "Ngong" }
];

mapLocations.forEach(l => {
    const marker = L.marker(l.coords).addTo(map);
    marker.bindPopup(`${l.name} - Verified Properties`);
    marker.on('click', () => {
        window.location.href = `locations.html?location=${l.name.toLowerCase().replace(' ', '-')}`;
    });
});

// ============================================
// INITIALIZE EVERYTHING
// ============================================
document.addEventListener('DOMContentLoaded', async function() {
    // Show loading indicators first
    showLoadingIndicators();
    
    try {
        await updateNavbarWithCounts();
        await loadFeaturedProperties();
    } catch (error) {
        console.error('Initialization error:', error);
        const featuredContainer = document.getElementById('featuredPropertiesGrid');
        if (featuredContainer) {
            featuredContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 60px;"><p>Unable to load properties. Please check your connection.</p><button onclick="location.reload()" style="margin-top: 15px; padding: 10px 24px; background: #25D366; color: white; border: none; border-radius: 40px; cursor: pointer;">Retry</button></div>`;
        }
    }
    
    // Remove loading indicators after update
    document.querySelectorAll('.count-loading').forEach(el => el.remove());
    
    setupHeroSearch();
    setupNavbarLinks();
});