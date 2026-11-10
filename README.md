# Gilbros Hardware & Construction Supply — Website

Storefront prototype for **Gilbros Hardware & Construction Supply** in the Philippines. It is a static site (HTML, CSS and plain JavaScript) with no build step, so it runs on GitHub Pages or any web host as-is.

> **Status: prototype.** Branch addresses, phone numbers, product names, brands and prices are sample data. Checkout, document downloads and quote submission show a confirmation but do not send anything yet.

## Features

- **Homepage:** hero, delivery checker by province/region, department tiles, featured products, contractor account banner and branch list.
- **Category pages:** filters for brand, voltage, application, price and "in stock at my branch", plus sorting and a grid/table view toggle.
- **Product pages:** bulk-price table that updates with quantity, stock at each branch, and tabs for specifications, documents and delivery/returns.
- **Cart:** subtotal, delivery, 12% VAT and total, with GCash, Maya, card, bank transfer and COD shown.
- **Contractor portal:**
  - Paste SKUs or upload a CSV file; each line is matched against the catalogue.
  - Build a quote list and request a quote with TIN, project, site and delivery method.
- **Site-wide:** pesos (₱) with a VAT-inclusive / VAT-exclusive switch, branch selector, light and dark themes, and phone-friendly layout.

## Project structure

```
gilbros-website/
├── index.html          Page markup, header, footer and icon set
├── css/
│   └── styles.css      Design tokens (colors, fonts) and all styles
├── js/
│   ├── data.js         Branches, categories and products (edit this for real data)
│   └── app.js          Cart, quote list, filters, routing and page rendering
├── assets/
│   ├── gilbros-logo.jpg  Original logo file
│   └── favicon.svg       Browser tab icon
├── .nojekyll           Tells GitHub Pages to serve files as-is
└── .gitignore
```

## Run it locally

Open `index.html` in a browser, or serve the folder:

```bash
cd gilbros-website
python3 -m http.server 8000
# then open http://localhost:8000
```

## Publish on GitHub Pages

1. Create a new repository on GitHub, for example `gilbros-website`.
2. Upload the files:
   - **In the browser:** on the new repository page, choose **Add file → Upload files**. Drag in everything inside this folder, including `.nojekyll` and `.gitignore`, then commit.
   - **With Git:**
     ```bash
     cd gilbros-website
     git init
     git add .
     git commit -m "Initial Gilbros storefront"
     git branch -M main
     git remote add origin https://github.com/<your-username>/gilbros-website.git
     git push -u origin main
     ```
3. In the repository, open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, pick **main** and **/ (root)**, then **Save**.
4. After a minute or two the site is live at `https://<your-username>.github.io/gilbros-website/`.

To use your own domain (for example `www.gilbros.ph`), add it under **Settings → Pages → Custom domain** and point your DNS to GitHub Pages.

## Customizing

| What | Where |
|------|-------|
| Products, prices, stock, specs | `js/data.js` → `P` array. Prices are **before VAT**; the site adds 12%. |
| Branches and hours | `js/data.js` → `BRANCHES` |
| Categories and menu links | `js/data.js` → `CATS` |
| Brand colors | `css/styles.css` → `:root` tokens (`--brand`, `--steel`, `--logo-blue`, `--logo-green`, `--logo-grey`) |
| Delivery zones and fees | `js/app.js` → `zoneCheck()` |
| Delivery fee and free-delivery threshold | `js/app.js` → `renderDrawer()` |

Each product needs a unique `id` and `sku`. Bulk tiers use the form `[[minQty, discount], …]`, for example `[[1,0],[50,.04],[200,.08]]`.

## Next steps for a live store

- **Payments:** connect a Philippine payment gateway that supports GCash, Maya and cards.
- **Product data:** load the catalogue and branch stock from your inventory or POS system instead of `data.js`.
- **Quotes:** send quote requests to email or a CRM, and store orders in a database.
- **Images:** replace the placeholder icons with real product photos.
- **BIR requirements:** confirm invoicing and receipt rules with your accountant before taking online payments.

## License

No license has been chosen yet. Until one is added, all rights are reserved by Gilbros Hardware & Construction Supply.
