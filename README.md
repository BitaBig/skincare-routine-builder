# ✨ Skincare Routine Builder

A web app that helps you build the perfect AM & PM skincare routine with ingredient conflict detection.

![Python](https://img.shields.io/badge/Python-3.12-blue)
![Flask](https://img.shields.io/badge/Flask-3.1-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4)

## Features

- 🧴 **Add Products** - Input your skincare products and their active ingredients
- ⚠️ **Conflict Detection** - Automatically detects ingredient combinations that shouldn't be used together
- ☀️ **AM Routine** - Generates your optimized morning routine in the correct order
- 🌙 **PM Routine** - Generates your optimized evening routine in the correct order
- ⏱️ **Wait Times** - Shows recommended wait times between active ingredients

## Ingredients Supported

- Vitamin C
- Retinol
- Niacinamide
- AHA (Glycolic Acid)
- BHA (Salicylic Acid)
- Hyaluronic Acid
- Benzoyl Peroxide
- SPF
- Moisturizer
- Cleanser

## Known Conflicts

| Combination | Severity | Reason |
|-------------|----------|--------|
| Vitamin C + Retinol | Medium | Can irritate when used together |
| Retinol + AHA | High | Too much exfoliation can damage skin barrier |
| Retinol + BHA | High | Can cause excessive dryness and irritation |
| Benzoyl Peroxide + Retinol | High | Benzoyl peroxide can oxidize retinol |

## Installation

1. Clone the repository
   ```bash
   git clone https://github.com/BitaBig/skincare-routine-builder.git
   cd skincare-routine-builder
   ```

2. Create a virtual environment
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies
   ```bash
   pip install -r requirements.txt
   ```

4. Run the app
   ```bash
   python app.py
   ```

5. Open your browser to `http://127.0.0.1:5000`

## Tech Stack

- **Backend**: Python, Flask
- **Frontend**: HTML, Tailwind CSS, JavaScript
- **Fonts**: Outfit (Google Fonts)

## How It Works

1. Enter a product name (e.g., "CeraVe PM Moisturizer")
2. Select the active ingredients in that product
3. Click "Add Product to Routine"
4. Repeat for all your products
5. View your optimized AM/PM routines and any ingredient conflicts

## License

MIT License - feel free to use this project however you'd like!

