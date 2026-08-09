# Ultra Aluminum Pvt Ltd — Industrial Dashboard

A production management dashboard for Ultra Aluminum Pvt Ltd, built with React + Vite + Tailwind CSS. Connects to a Google Apps Script backend API for real-time manufacturing data.

## ✨ Features

- 10 industrial modules (Extrusion, Powder Coat, Wood Finish, Anodizing)
- 11 live data tables with API integration
- Date range filtering, text search, CSV/PDF export
- Dark mode toggle, glassmorphism UI
- Row-click detail popups

## 🚀 Tech Stack

- **React 19** + **TypeScript**
- **Vite 7** (build tool)
- **Tailwind CSS v4** (styling)
- **jsPDF** + **jspdf-autotable** (PDF export)
- **Google Apps Script** (backend API)

## 🛠 Local Development

```bash
npm install
npm run dev      # start dev server
npm run build    # production build to ./dist
```

## 📦 Deploy to Netlify

This project is pre-configured for Netlify via `netlify.toml`.

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 20

## 📁 Project Structure

```
src/
├── components/         # React components
│   ├── Header.tsx
│   ├── Logo.tsx
│   ├── Welcome.tsx
│   ├── Sections.tsx
│   ├── Modal.tsx
│   ├── DateFilter.tsx
│   ├── ExportButton.tsx
│   └── *Table.tsx     # 10 module tables
├── hooks/              # Custom React hooks
└── App.tsx             # Entry point
```

## 🌐 API

Data is fetched from: `https://script.google.com/macros/s/AKfycbxahN3PXcPFgt8YY3IU3B07a8s_cSKTU1Q7nzawsiFDh39a3PGQNIlUy-mmhBuuPWzB/exec?category=<module>`
