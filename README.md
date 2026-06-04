# Howdy (Static)

## Run locally

1. Install dependencies (only needed if you want to use `npm run dev` / Next.js):
   - `npm install`

2. Serve this static `index.html` + `assets/` folder:
   - `npm run dev:static`

Then open the URL printed in your terminal (defaults to `http://localhost:5173`).

### If port-binding is restricted

If `npm run dev:static` can’t bind to a port in your environment, you can still serve the folder with:

- `python3 -m http.server 5173`

## Notes

- Opening `index.html` via `file://` may work, but a local server is recommended so relative assets and browser features behave consistently.
- `static-server.js` includes common MIME types (images/video/fonts) for local development.
