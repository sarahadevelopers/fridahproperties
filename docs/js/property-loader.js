// js/property-loader.js - Reusable property loader for all pages
const PropertyLoader = {
    apiBase: 'https://propertybyfridahnew-db-user.onrender.com',
    
    async loadProperties(pageType, containerId, filters = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // Show loading skeletons
        container.innerHTML = this.getSkeletons();
        
        try {
            // Fetch all properties
            const response = await fetch(`${this.apiBase}/api/properties?limit=100`);
            const data = await response.json();
            let properties = Array.isArray(data) ? data : (data.properties || []);
            
            // Apply page-specific filters
            properties = this.applyPageFilters(properties, pageType, filters);
            
            if (properties.length === 0) {
                container.innerHTML = this.getEmptyState(pageType);
                return;
            }
            
            // Render properties
            container.innerHTML = properties.map(prop => this.createPropertyCard(prop)).join('');
            
            // Update page title with count
            this.updatePageTitle(pageType, properties.length);
            
        } catch (error) {
            console.error('Error loading properties:', error);
            container.innerHTML = this.getErrorState();
        }
    },
    
    applyPageFilters(properties, pageType, filters) {
        switch(pageType) {
            case 'rentals':
                return properties.filter(p => 
                    p.transaction === 'rent' && p.status === 'available'
                );
            case 'forsale':
                return properties.filter(p => 
                    p.transaction === 'sale' && p.status === 'available'
                );
            case 'land':
                return properties.filter(p => 
                    (p.type === 'land-res' || p.type === 'land-comm' || p.type === 'ranch') && 
                    p.status === 'available'
                );
            case 'airbnb':
                return properties.filter(p => 
                    p.transaction === 'rent' && 
                    p.status === 'available' &&
                    ['kitengela', 'kilimani', 'syokimau'].includes(p.location)
                );
            default:
                return properties;
        }
    },
    
    createPropertyCard(property) {
        const locationName = this.formatLocationName(property.location);
        const priceDisplay = this.formatPrice(property.priceNum, property.transaction);
        
        return `
            <div class="listing-card">
                <div class="listing-image">
                    <img src="${property.images?.[0] || this.getPlaceholderImage()}" 
                         alt="${property.title}"
                         loading="lazy"
                         onerror="this.src='${this.getPlaceholderImage()}'">
                    <div class="listing-badges">
                        <span class="badge-verified">Verified</span>
                    </div>
                    <div class="price-tag">${priceDisplay}</div>
                </div>
                <div class="listing-body">
                    <p class="listing-location"><i class="fas fa-map-marker-alt"></i> ${locationName}</p>
                    <h3>${property.title.length > 35 ? property.title.substring(0, 35) + '...' : property.title}</h3>
                    <div class="listing-specs">
                        ${property.bedrooms > 0 ? `<span><i class="fas fa-bed"></i> ${property.bedrooms}</span>` : ''}
                        ${property.bathrooms > 0 ? `<span><i class="fas fa-bath"></i> ${property.bathrooms}</span>` : ''}
                        ${property.size ? `<span><i class="fas fa-expand"></i> ${property.size}</span>` : ''}
                    </div>
                    <button class="btn-view-details view-property-btn" data-id="${property._id || property.id}">
                        View Property
                    </button>
                </div>
            </div>
        `;
    },
    
    formatLocationName(location) {
        const map = {
            'kitengela': 'Kitengela', 'ngong': 'Ngong', 'syokimau': 'Syokimau',
            'ongata-rongai': 'Ongata Rongai', 'athi-river': 'Athi River', 'kilimani': 'Kilimani'
        };
        return map[location] || location || 'Unknown';
    },
    
    formatPrice(priceNum, transaction) {
        if (!priceNum) return 'Price on request';
        if (transaction === 'rent') {
            return `KES ${priceNum.toLocaleString('en-KE')} / month`;
        }
        if (priceNum >= 1000000) {
            return `KES ${(priceNum / 1000000).toFixed(1)}M`.replace('.0M', 'M');
        }
        return `KES ${priceNum.toLocaleString('en-KE')}`;
    },
    
    getPlaceholderImage() {
        return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800';
    },
    
    getSkeletons() {
        return Array(6).fill().map(() => `
            <div class="listing-card skeleton-card">
                <div class="listing-image"><div class="skeleton-img"></div></div>
                <div class="listing-body">
                    <div class="skeleton-line" style="width: 60%"></div>
                    <div class="skeleton-line" style="width: 80%; height: 20px"></div>
                    <div class="skeleton-line" style="width: 50%"></div>
                </div>
            </div>
        `).join('');
    },
    
    getEmptyState(pageType) {
        const titles = {
            rentals: 'No Rental Properties Available',
            forsale: 'No Properties for Sale Currently',
            land: 'No Land/Plots Available',
            airbnb: 'No Airbnb Listings Available'
        };
        return `
            <div class="no-properties">
                <i class="fas fa-home" style="font-size: 48px; color: #cbd5e1;"></i>
                <h3>${titles[pageType] || 'No Properties Found'}</h3>
                <p>Check back soon for new listings or contact us directly.</p>
                <a href="https://wa.me/254721911181" class="btn-whatsapp" style="display: inline-block; margin-top: 20px;">
                    <i class="fab fa-whatsapp"></i> WhatsApp Us
                </a>
            </div>
        `;
    },
    
    getErrorState() {
        return `
            <div class="no-properties">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #dc3545;"></i>
                <h3>Unable to Load Properties</h3>
                <p>Please refresh the page or try again later.</p>
                <button onclick="location.reload()" class="btn-primary" style="margin-top: 20px;">Retry</button>
            </div>
        `;
    },
    
    updatePageTitle(pageType, count) {
        const titles = {
            rentals: `Rentals (${count}) | Property By Fridah`,
            forsale: `Properties for Sale (${count}) | Property By Fridah`,
            land: `Land & Plots (${count}) | Property By Fridah`,
            airbnb: `Airbnb Short Stays (${count}) | Property By Fridah`
        };
        if (titles[pageType]) {
            document.title = titles[pageType];
        }
    }
};