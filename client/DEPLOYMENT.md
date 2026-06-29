# Devify Frontend Production Deployment Guide

This document describes the instructions to generate production assets and deploy the **Devify** React + Vite frontend application to production hosting platforms (e.g. Netlify, Vercel, or custom cloud services).

---

## 1. Production Build Compilation

Before deploying, build the optimized static assets:

```bash
# Navigate to the client directory
cd client

# Install packages
npm install

# Run Vite production build command
npm run build
```

This compiles your source files and outputs production-ready assets to the `client/dist/` directory.

---

## 2. Environment Variables Configuration

In production, do not hardcode your local API paths. Configure environment variables in your hosting provider's dashboard:

| Variable Name | Description | Example Production Value |
|---|---|---|
| `VITE_API_URL` | The production REST API endpoint | `https://api.devify.com/api` |
| `VITE_SOCKET_URL` | The production WebSocket socket server | `https://api.devify.com` |

Vite will inject these during build compilation time.

---

## 3. Client-Side Routing Configurations (SPAs)

Since Devify uses React Router DOM for routing, reloading a page (like `/profile`) directly in the browser will result in a server `404 Not Found` error. This is because the hosting platform looks for a physical file named `profile` instead of serving `index.html`.

Use the following platform-specific redirect configurations:

### A. Netlify Deployment
Create a file named `_redirects` inside the `public/` directory (or the output `dist/` directory):

```text
/*    /index.html   200
```

### B. Vercel Deployment
Create a `vercel.json` file in the root of the `client/` project directory:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### C. Nginx Configuration (VPS / Self-Hosted)
If deploying to a custom Linux server with Nginx, use `try_files` inside your site block:

```nginx
location / {
    root /var/www/devify/client/dist;
    index index.html index.htm;
    try_files $uri $uri/ /index.html;
}
```

---

## 4. Verification Check

To test your production assets locally:

```bash
# Preview build assets using a local server
npm run preview
```
This launches a local web server serving files directly from the `dist/` folder, letting you test production configurations locally before pushing to the cloud.
