// shared-api.js - Shared property API for all pages

const API_BASE = 'https://propertybyfridahnew-db-user.onrender.com';

// Helper: format price
function formatPrice(priceNum, transaction = 'sale', rawPrice = '') {
    if (!priceNum || priceNum === 0) return 'Price on request';
    const tx = (transaction || 'sale').toLowerCase();
    if (tx === 'rent' || tx === 'lease') {
        const period = detectPeriod(rawPrice);
        return `KES ${Math.round(priceNum).toLocaleString('en-KE')}${period}`;
    }
    if (priceNum >= 1_000_000) {
        const millions = priceNum / 1_000_000;
        const formatted = millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1).replace(/\.0$/, '');
        return `KES ${formatted}M`;
    }
    if (priceNum >= 1000) return `KES ${(priceNum / 1000).toFixed(0)}K`;
    return `KES ${priceNum.toLocaleString('en-KE')}`;
}

function detectPeriod(rawPrice = '') {
    const s = (rawPrice || '').toLowerCase();
    if (s.includes('/month') || s.includes('per month') || s.includes('monthly')) return ' / month';
    if (s.includes('/week') || s.includes('per week') || s.includes('weekly')) return ' / week';
    if (s.includes('/day') || s.includes('per day') || s.includes('daily')) return ' / day';
    if (s.includes('/year') || s.includes('per year') || s.includes('yearly') || s.includes('annum')) return ' / year';
    return ' / month';
}

function extractPriceNumber(property) {
    if (property.priceNum !== undefined && property.priceNum !== null) {
        const n = Number(property.priceNum);
        return isFinite(n) ? n : 0;
    }
    if (!property.price) return 0;
    const raw = String(property.price).toLowerCase().trim();
    const cleaned = raw
        .replace(/\/\s*(month|mo|week|wk|day|yr|year)\b/g, '')
        .replace(/\b(per|a)\s*(month|mo|week|wk|day|yr|year)\b/g, '')
        .replace(/\b(monthly|weekly|daily|yearly|annum)\b/g, '')
        .trim();
    const match = cleaned.match(/(\d[\d,]*\.?\d*)\s*([mk])?\b/);
    if (!match) return 0;
    let num = parseFloat(match[1].replace(/,/g, ''));
    if (!isFinite(num)) return 0;
    const suffix = match[2];
    if (suffix === 'm') num *= 1_000_000;
    if (suffix === 'k') num *= 1_000;
    return num;
}

function processProperty(property) {
    const id = property._id || property.id;
    let location = (property.location || 'unknown').toLowerCase().trim();
    const locationMap = {
        'kitengela': 'kitengela', 'ngong': 'ngong', 'syokimau': 'syokimau',
        'ongata rongai': 'ongata-rongai', 'ongata-rongai': 'ongata-rongai',
        'athi river': 'athi-river', 'kilimani': 'kilimani'
    };
    location = locationMap[location] || location;

    let transaction = 'sale';
    if (property.transaction) transaction = property.transaction.toLowerCase();
    else if (property.purpose === 'rent' || property.listingType === 'rent') transaction = 'rent';

    const priceNum = extractPriceNumber(property);

    let type = 'unknown';
    if (property.type) type = property.type.toLowerCase();
    else if (property.category) type = property.category.toLowerCase();

    const typeMap = {
        'bungalow': 'bungalow', 'maisonette': 'maisonette', 'townhouse': 'townhouse',
        'apartment': 'apartment', 'flat': 'apartment', 'studio': 'studio', 'bedsitter': 'studio',
        'villa': 'villa', 'furnished': 'furnished', 'airbnb': 'airbnb',
        'office': 'office', 'shop': 'shop', 'warehouse': 'warehouse', 'godown': 'warehouse',
        'land': 'land-res', 'plot': 'land-res', 'residential plot': 'land-res',
        'commercial land': 'land-comm', 'agricultural': 'ranch', 'ranch': 'ranch'
    };
    type = typeMap[type] || type;

    return {
        id: id,
        title: property.title || 'Untitled Property',
        location: location,
        type: type,
        transaction: transaction,
        status: (property.status || 'available').toLowerCase(),
        priceNum: priceNum,
        priceDisplay: formatPrice(priceNum, transaction, property.price),
        bedrooms: parseInt(property.bedrooms) || 0,
        bathrooms: parseInt(property.bathrooms) || 0,
        parking: parseInt(property.parking) || 0,
        size: property.size || property.area || '',
        description: property.description || 'No description available',
        whatsapp: property.whatsapp || '254721911181',
        images: Array.isArray(property.images) ? property.images : [],
        features: property.features || property.amenities || [],
        createdAt: property.createdAt || new Date().toISOString()
    };
}

// Main API functions
async function fetchAllProperties(limit = 200) {
    try {
        const response = await fetch(`${API_BASE}/api/properties?limit=${limit}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        let properties = Array.isArray(data) ? data : (data.properties || []);
        return properties.map(processProperty);
    } catch (error) {
        console.error('API fetch failed:', error);
        return []; // Return empty array – you can also return sample data
    }
}

async function getPropertyById(id) {
    const all = await fetchAllProperties();
    return all.find(p => p.id == id);
}

// Expose to global scope for use in pages
window.PropertyAPI = {
    fetchAllProperties,
    getPropertyById,
    formatPrice,
    formatLocation: (loc) => {
        const names = {
            kitengela:'Kitengela', ngong:'Ngong', syokimau:'Syokimau',
            'ongata-rongai':'Ongata Rongai', 'athi-river':'Athi River', kilimani:'Kilimani'
        };
        return names[loc] || loc || 'Unknown';
    },
    getPlaceholder: () => 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'
};