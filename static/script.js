let products = [];
let selectedIngredients = [];

// ===== AUTOCOMPLETE FUNCTIONALITY =====

// Debounce function to limit API calls
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Small fallback list for common products that APIs might miss
const FALLBACK_PRODUCTS = [
    "CeraVe Moisturizing Cream", "CeraVe Hydrating Cleanser", "CeraVe PM Lotion",
    "The Ordinary Niacinamide 10%", "The Ordinary Retinol 0.5%", "The Ordinary Hyaluronic Acid",
    "COSRX Snail Mucin Essence", "COSRX BHA Blackhead Power Liquid",
    "Beauty of Joseon Glow Serum", "Beauty of Joseon Relief Sun",
    "Laneige Water Sleeping Mask", "Klairs Supple Preparation Toner",
    "Paula's Choice 2% BHA", "La Roche-Posay Effaclar", "Anua Heartleaf Toner"
];

// Fetch products from Open Beauty Facts API
async function searchProducts(query) {
    if (query.length < 2) return [];
    
    const lowerQuery = query.toLowerCase();
    
    // Check fallback list first for instant results
    const fallbackResults = FALLBACK_PRODUCTS.filter(p => p.toLowerCase().includes(lowerQuery));
    
    // Try Open Beauty Facts API (cosmetics-specific database)
    const url = `https://world.openbeautyfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        const apiProducts = data.products || [];
        
        // Filter valid products from API
        const validApiProducts = apiProducts.filter(p => {
            const name = p.product_name;
            // Must have a name, be at least 3 chars, not just numbers, and contain the query
            return name && 
                   name.length >= 3 && 
                   !/^\d+$/.test(name) &&
                   name.toLowerCase().includes(lowerQuery);
        });
        
        // Combine: fallback first (instant), then API results
        const combinedResults = [
            ...fallbackResults.map(name => ({ product_name: name, brands: '', isLocal: true })),
            ...validApiProducts
        ];
        
        // Remove duplicates based on product name
        const seen = new Set();
        const uniqueResults = combinedResults.filter(p => {
            const name = p.product_name.toLowerCase();
            if (seen.has(name)) return false;
            seen.add(name);
            return true;
        });
        
        return uniqueResults.slice(0, 10); // Limit to 10 results
        
    } catch (error) {
        console.error('API error:', error);
        // On error, use fallback list only
        return fallbackResults.map(name => ({ product_name: name, brands: '' }));
    }
}

// Setup autocomplete
const productInput = document.getElementById('productName');
const autocompleteList = document.getElementById('autocomplete-list');

productInput.addEventListener('input', debounce(async function() {
    const query = this.value.trim();
    
    if (query.length < 2) {
        autocompleteList.classList.add('hidden');
        return;
    }
    
    // Show loading state
    autocompleteList.innerHTML = '<div class="px-4 py-3 text-taupe-400">Searching...</div>';
    autocompleteList.classList.remove('hidden');
    
    const foundProducts = await searchProducts(query);
    
    if (foundProducts.length === 0) {
        autocompleteList.innerHTML = '<div class="px-4 py-3 text-taupe-400">No products found. You can still type your own!</div>';
        return;
    }
    
    autocompleteList.innerHTML = foundProducts.map(p => {
        const name = p.product_name;
        const brand = p.brands || '';
        return `
            <div class="px-4 py-3 hover:bg-sand-100 cursor-pointer text-taupe-700 border-b border-sand-100 last:border-0" data-name="${name}${brand ? ' - ' + brand : ''}">
                <span class="font-medium">${name}</span>
                ${brand ? `<span class="text-taupe-400 text-sm ml-2">${brand}</span>` : ''}
            </div>
        `;
    }).join('');
    
}, 300));

// Handle clicking on a suggestion
autocompleteList.addEventListener('click', function(e) {
    const item = e.target.closest('[data-name]');
    if (item) {
        productInput.value = item.dataset.name;
        autocompleteList.classList.add('hidden');
    }
});

// Hide dropdown when clicking outside
document.addEventListener('click', function(e) {
    if (!productInput.contains(e.target) && !autocompleteList.contains(e.target)) {
        autocompleteList.classList.add('hidden');
    }
});

// Hide dropdown on Escape key
productInput.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        autocompleteList.classList.add('hidden');
    }
});

// ===== END AUTOCOMPLETE =====

// Handle ingredient selection
document.querySelectorAll('.ingredient-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const ingredient = this.dataset.ingredient;
        this.classList.toggle('selected');
        
        if (selectedIngredients.includes(ingredient)) {
            selectedIngredients = selectedIngredients.filter(i => i !== ingredient);
        } else {
            selectedIngredients.push(ingredient);
        }
    });
});

// Add product
document.getElementById('addProduct').addEventListener('click', function() {
    const name = document.getElementById('productName').value;
    
    if (name && selectedIngredients.length > 0) {
        products.push({
            name: name,
            ingredients: [...selectedIngredients]
        });
        
        // Reset
        document.getElementById('productName').value = '';
        selectedIngredients = [];
        document.querySelectorAll('.ingredient-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        displayProducts();
    }
});

// Analyze routine button
document.getElementById('analyzeRoutine').addEventListener('click', function() {
    document.getElementById('routinesSection').style.display = 'grid';
    analyzeRoutine();
});

function displayProducts() {
    const list = document.getElementById('productList');
    
    if (products.length === 0) {
        list.innerHTML = '';
        return;
    }
    
    list.innerHTML = `
        <div class="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-sand-200">
            <h2 class="text-3xl font-medium text-taupe-700 mb-6 flex items-center gap-3">
                <span class="text-2xl"></span> Your Products
            </h2>
            <div class="space-y-4" id="productItems"></div>
        </div>
    `;
    
    const itemsContainer = document.getElementById('productItems');
    
    products.forEach((product, index) => {
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between p-4 bg-gradient-to-r from-sand-50 to-cream-100 rounded-xl border border-sand-200';
        div.innerHTML = `
            <div>
                <h3 class="font-semibold text-taupe-700">${product.name}</h3>
                <p class="text-sm text-taupe-500 mt-1">${product.ingredients.join(' • ')}</p>
            </div>
            <button 
                onclick="removeProduct(${index})" 
                class="px-4 py-2 rounded-lg bg-sand-200 hover:bg-sand-300 text-taupe-600 font-medium transition-colors"
            >
                Remove
            </button>
        `;
        itemsContainer.appendChild(div);
    });
}

function removeProduct(index) {
    products.splice(index, 1);
    displayProducts();
    analyzeRoutine();
}

async function analyzeRoutine() {
    if (products.length === 0) {
        document.getElementById('conflicts').innerHTML = '';
        document.getElementById('amRoutine').innerHTML = '<p class="text-taupe-400 text-center py-8 font-light">Add products to see your routine</p>';
        document.getElementById('pmRoutine').innerHTML = '<p class="text-taupe-400 text-center py-8 font-light">Add products to see your routine</p>';
        return;
    }
    
    const response = await fetch('/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: products })
    });
    
    const data = await response.json();
    
    // Display conflicts
    const conflictsDiv = document.getElementById('conflicts');
    if (data.conflicts.length > 0) {
        conflictsDiv.innerHTML = `
            <div class="bg-amber-50/80 rounded-2xl shadow-lg p-8 border border-amber-200">
                <h2 class="text-3xl font-medium text-amber-800 mb-6 flex items-center gap-3" style="font-family: 'Cormorant Garamond', serif;">
                    <span class="text-2xl"></span> Conflicts Detected
                </h2>
                <div class="space-y-4" id="conflictItems"></div>
            </div>
        `;
        
        const conflictItems = document.getElementById('conflictItems');
        data.conflicts.forEach(conflict => {
            const div = document.createElement('div');
            div.className = 'p-4 bg-white/80 rounded-xl border border-amber-200';
            
            const severityColors = {
                high: 'bg-amber-600',
                medium: 'bg-amber-500',
                low: 'bg-amber-400'
            };
            
            div.innerHTML = `
                <div class="flex items-start gap-3">
                    <span class="w-2 h-2 rounded-full ${severityColors[conflict.severity] || 'bg-amber-500'} mt-2 flex-shrink-0"></span>
                    <div>
                        <p class="font-semibold text-taupe-700">${conflict.pair[0]} + ${conflict.pair[1]}</p>
                        <p class="text-taupe-600 text-sm mt-1 font-light">${conflict.reason}</p>
                    </div>
                </div>
            `;
            conflictItems.appendChild(div);
        });
    } else {
        conflictsDiv.innerHTML = '';
    }
    
    // Display routines
    displayRoutine('amRoutine', data.am_routine);
    displayRoutine('pmRoutine', data.pm_routine);
}

function displayRoutine(elementId, routine) {
    const div = document.getElementById(elementId);
    
    if (routine.length === 0) {
        div.innerHTML = '<p class="text-taupe-400 text-center py-8 font-light">No products for this routine</p>';
        return;
    }
    
    div.innerHTML = '';
    
    routine.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        // Add amber border if this ingredient conflicts with another in the routine
        const borderClass = item.alternate ? 'border-amber-300 bg-amber-50/60' : 'border-sand-200 bg-white/60';
        itemDiv.className = `flex items-start gap-4 p-4 rounded-xl border ${borderClass}`;
        
        // Build the alternate nights warning if needed
        let alternateWarning = '';
        if (item.alternate && item.conflicts_with.length > 0) {
            alternateWarning = `
                <p class="text-xs text-amber-600 mt-2 font-medium bg-amber-100 px-2 py-1 rounded-lg inline-block">
                     Alternate nights with: ${item.conflicts_with.join(', ')}
                </p>
            `;
        }
        
        itemDiv.innerHTML = `
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-taupe-400 to-taupe-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                ${index + 1}
            </div>
            <div class="flex-1">
                <p class="font-semibold text-taupe-700">${item.ingredient}</p>
                <p class="text-sm text-taupe-500 font-light">${item.product}</p>
                ${item.wait > 0 ? `<p class="text-xs text-taupe-600 mt-1 font-medium">Wait ${item.wait} minutes before next step</p>` : ''}
                ${alternateWarning}
            </div>
        `;
        div.appendChild(itemDiv);
    });
}