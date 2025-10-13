# Tools

## Inventory Dashboard Prototype

A lightweight static prototype of the Inventory Health Dashboard. It mirrors the inline HTML snippet that powers the NetSuite-based dashboard so you can preview the experience locally and iterate without connecting to the production backend.

### Project structure

```
inventory-dashboard/
├── app.js          # Dashboard logic and rendering helpers
├── index.html      # Page layout
├── styles.css      # Visual styling
└── data/
    └── sample-data.json  # Example API response used as a local fallback
```

### Running the prototype

Any static file server can host the dashboard. If you have Python installed, the quickest option is:

```bash
cd inventory-dashboard
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

The app will attempt to load data from `/inventory/dashboard`. When that route is unavailable it automatically falls back to the bundled `data/sample-data.json` payload so you can explore the UI offline.

### Customising

* Replace `data/sample-data.json` with a payload generated from your environment. The file shape matches the API contract expected by `app.js`.
* Update the URLs in `index.html` if your NetSuite account or export routes differ.
* Adjust styling by editing `styles.css`. The palette and spacing variables are defined at the top of the file.
