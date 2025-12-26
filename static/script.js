let products = [];
let selectedIngredients = [];

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
        analyzeRoutine();
    }
});

function displayProducts() {
    const list = document.getElementById('productList');
    
    if (products.length === 0) {
        list.innerHTML = '';
        return;
    }
    
    list.innerHTML = `
        <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-white/50">
            <h2 class="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <span class="text-2xl">🧴</span> Your Products
            </h2>
            <div class="space-y-4" id="productItems"></div>
        </div>
    `;
    
    const itemsContainer = document.getElementById('productItems');
    
    products.forEach((product, index) => {
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between p-4 bg-gradient-to-r from-lavender-50 to-rose-50 rounded-2xl border border-lavender-100';
        div.innerHTML = `
            <div>
                <h3 class="font-semibold text-gray-800">${product.name}</h3>
                <p class="text-sm text-gray-500 mt-1">${product.ingredients.join(' • ')}</p>
            </div>
            <button 
                onclick="removeProduct(${index})" 
                class="px-4 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-600 font-medium transition-colors"
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
        document.getElementById('amRoutine').innerHTML = '<p class="text-gray-400 text-center py-8">Add products to see your routine</p>';
        document.getElementById('pmRoutine').innerHTML = '<p class="text-gray-400 text-center py-8">Add products to see your routine</p>';
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
            <div class="bg-rose-50 rounded-3xl shadow-lg p-8 border border-rose-200">
                <h2 class="text-2xl font-semibold text-rose-700 mb-6 flex items-center gap-2">
                    <span class="text-2xl">⚠️</span> Conflicts Detected
                </h2>
                <div class="space-y-4" id="conflictItems"></div>
            </div>
        `;
        
        const conflictItems = document.getElementById('conflictItems');
        data.conflicts.forEach(conflict => {
            const div = document.createElement('div');
            div.className = 'p-4 bg-white rounded-2xl border border-rose-200';
            
            const severityColors = {
                high: 'bg-rose-500',
                medium: 'bg-amber-500',
                low: 'bg-yellow-400'
            };
            
            div.innerHTML = `
                <div class="flex items-start gap-3">
                    <span class="w-2 h-2 rounded-full ${severityColors[conflict.severity] || 'bg-rose-500'} mt-2 flex-shrink-0"></span>
                    <div>
                        <p class="font-semibold text-gray-800">${conflict.pair[0]} + ${conflict.pair[1]}</p>
                        <p class="text-gray-600 text-sm mt-1">${conflict.reason}</p>
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
        div.innerHTML = '<p class="text-gray-400 text-center py-8">No products for this routine</p>';
        return;
    }
    
    div.innerHTML = '';
    
    routine.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'flex items-start gap-4 p-4 bg-white/60 rounded-2xl';
        itemDiv.innerHTML = `
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-lavender-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                ${index + 1}
            </div>
            <div class="flex-1">
                <p class="font-semibold text-gray-800">${item.ingredient}</p>
                <p class="text-sm text-gray-500">${item.product}</p>
                ${item.wait > 0 ? `<p class="text-xs text-lavender-600 mt-1 font-medium">⏱️ Wait ${item.wait} minutes before next step</p>` : ''}
            </div>
        `;
        div.appendChild(itemDiv);
    });
}