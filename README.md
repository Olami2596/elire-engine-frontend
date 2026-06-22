# ELIRE Lead Gateway — Frontend

A lightweight, static lead-capture form for the ELIRE AI lead qualification pipeline. Pure HTML, CSS, and vanilla JavaScript — no build step, no framework, no dependencies beyond two Google Fonts loaded via CDN.

The form collects a prospect's details, validates them client-side, and submits them to the ELIRE FastAPI gateway, which queues the lead for AI-powered scoring, enrichment, and routing.

## What this is

```
Visitor fills out form
        ↓
This frontend (static site)
        ↓  POST /webhook/lead
FastAPI gateway (validates + dedupes + queues)
        ↓
Make.com automation → AI analysis → CRM + Slack routing
```
## Files

| File | Purpose |
|---|---|
| `index.html` | Form markup — six fields (first name, last name, email, company, job title, notes) |
| `styles.css` | Visual styling — dark theme with an animated "intake · analysis · routing" status strip |
| `script.js` | Client-side validation, the fetch call to the backend, and response handling (success / duplicate / validation error / network error) |
| `config.js` | The single place that holds the backend URL — edit this, not `script.js`, when the API location changes |

## Setup

No installation needed. This is static HTML/CSS/JS — there is nothing to compile or `npm install`.

### Run it locally

Open `index.html` directly by double-clicking it.

### Point it at your backend

Open `config.js` and set `WEBHOOK_URL` to wherever the FastAPI gateway is running:

```javascript
const ELIRE_CONFIG = {
  WEBHOOK_URL: "http://127.0.0.1:8000/webhook/lead"
};
```

For a deployed backend, use its public URL instead, e.g.:

```javascript
const ELIRE_CONFIG = {
  WEBHOOK_URL: "https://elire-lead-gateway.onrender.com/webhook/lead"
};
```

This is the only line that needs to change between environments.

