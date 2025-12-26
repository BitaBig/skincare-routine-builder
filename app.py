from flask import Flask, render_template, request, jsonify
app = Flask(__name__)

INGREDIENTS = {
    'Vitamin C': {'type': 'active', 'time': 'AM', 'order': 3, 'wait': 5},
    'Retinol': {'type': 'active', 'time': 'PM', 'order': 4, 'wait': 20},
    'Niacinamide': {'type': 'active', 'time': 'Both', 'order': 3, 'wait': 0},
    'AHA (Glycolic Acid)': {'type': 'active', 'time': 'PM', 'order': 3, 'wait': 10},
    'BHA (Salicylic Acid)': {'type': 'active', 'time': 'Both', 'order': 3, 'wait': 10},
    'Hyaluronic Acid': {'type': 'hydrator', 'time': 'Both', 'order': 2, 'wait': 0},
    'Benzoyl Peroxide': {'type': 'active', 'time': 'Both', 'order': 4, 'wait': 5},
    'SPF': {'type': 'protection', 'time': 'AM', 'order': 6, 'wait': 0},
    'Moisturizer': {'type': 'hydrator', 'time': 'Both', 'order': 5, 'wait': 0},
    'Cleanser': {'type': 'cleanser', 'time': 'Both', 'order': 1, 'wait': 0},
}

CONFLICTS = [
    {
        'pair': ['Vitamin C', 'Retinol'],
        'reason': 'Can irritate when used together. Use Vitamin C in AM, Retinol in PM.',
        'severity': 'medium'
    },
    {
        'pair': ['Retinol', 'AHA (Glycolic Acid)'],
        'reason': 'Both are strong actives. Too much exfoliation can damage skin barrier.',
        'severity': 'high'
    },
    {
        'pair': ['Retinol', 'BHA (Salicylic Acid)'],
        'reason': 'Can cause excessive dryness and irritation when combined.',
        'severity': 'high'
    },
    {
        'pair': ['Benzoyl Peroxide', 'Retinol'],
        'reason': 'Benzoyl peroxide can oxidize retinol, making it less effective.',
        'severity': 'high'
    },
    {
        'pair': ['BHA (Salicylic Acid)', 'Benzoyl Peroxide'],
        'reason': 'Mixing acids on the same night can cause irritation and dryness. Alternate nights instead.',
        'severity': 'high'
    },
    {
        'pair': ['AHA (Glycolic Acid)', 'Benzoyl Peroxide'],
        'reason': 'Using multiple acids together can over-exfoliate and damage skin barrier.',
        'severity': 'high'
    },
    {
        'pair': ['AHA (Glycolic Acid)', 'BHA (Salicylic Acid)'],
        'reason': 'Layering AHA and BHA together can be too harsh. Use on alternate nights.',
        'severity': 'medium'
    },
]

@app.route('/')
def index():
    return render_template('index.html', ingredients=INGREDIENTS.keys())

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    products = data.get('products', [])
    
    # Get all ingredients from products
    all_ingredients = []
    for product in products:
        all_ingredients.extend(product['ingredients'])
    
    # Find conflicts
    conflicts = []
    for conflict in CONFLICTS:
        if conflict['pair'][0] in all_ingredients and conflict['pair'][1] in all_ingredients:
            conflicts.append(conflict)
    
    # Build routines
    am_routine = build_routine(products, 'AM')
    pm_routine = build_routine(products, 'PM')
    
    return jsonify({
        'conflicts': conflicts,
        'am_routine': am_routine,
        'pm_routine': pm_routine
    })

def build_routine(products, time_of_day):
    items = []
    for product in products:
        for ingredient in product['ingredients']:
            if ingredient in INGREDIENTS:
                info = INGREDIENTS[ingredient]
                if info['time'] == time_of_day or info['time'] == 'Both':
                    items.append({
                        'product': product['name'],
                        'ingredient': ingredient,
                        'order': info['order'],
                        'wait': info['wait']
                    })
    
    # Sort by order
    items.sort(key=lambda x: x['order'])
    return items

if __name__ == '__main__':
    app.run(debug=True)