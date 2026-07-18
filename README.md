# 🗺️ District Tehri – GIS Viewer

An interactive, map-based portal for **Tehri District**, built with React, TypeScript and Leaflet. The app lets citizens and administrators explore geospatial data, layers, and district information through a fast, modern web interface.

> **Live demo:** https://district-tehri.onrender.com/

---

## 📖 About

This repository hosts the **Tehri GIS Viewer** — a web application for visualizing geographic and administrative data for Tehri District, Uttarakhand.

## ✨ Features

- 🗺️ **Interactive mapping** with [Leaflet](https://leafletjs.com/) and [proj4](https://github.com/proj4js/proj4js) for coordinate/projection handling
- ⚛️ **Modern frontend** built with React 19, TypeScript, and Vite
- 🤖 **AI-assisted features** powered by the [`@google/genai`](https://www.npmjs.com/package/@google/genai) (Gemini) SDK
- 🎨 **Styled with Tailwind CSS** and animated with [Motion](https://motion.dev/)
- 🖥️ **Node/Express backend** (`server.ts`) serving the app and API routes
- 🗄️ **MongoDB** integration for persisting application data
- 🎛️ Icons via [Lucide](https://lucide.dev/)

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| Mapping | Leaflet, proj4 |
| Backend | Node.js, Express, tsx |
| Database | MongoDB |
| Animation / UI | Motion, Lucide React |
| Tooling | esbuild, TypeScript compiler |

## 📂 Project Structure

```
District-Tehri/
├── src/                  # Application source (components, map logic, etc.)
├── index.html            # App entry HTML
├── server.ts             # Express server entry point
├── check-properties.js   # Utility/validation script
├── metadata.json         # App metadata (used by AI Studio)
├── vite.config.ts        # Vite build configuration
├── tsconfig.json         # TypeScript configuration
├── .env.example           # Environment variable template
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/RawatGitLab/District-Tehri.git

# Navigate into the project directory
cd District-Tehri

# Install dependencies
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `APP_URL` | The URL where the app is hosted (used for self-referential links/callbacks) |

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server (`tsx server.ts`) |
| `npm run build` | Build the frontend with Vite and bundle the server with esbuild |
| `npm start` | Run the production build (`dist/server.cjs`) |
| `npm run preview` | Preview the production Vite build |
| `npm run lint` | Type-check the project (`tsc --noEmit`) |
| `npm run clean` | Remove build artifacts |

### Running Locally

```bash
npm run dev
```

Then open the URL printed in your terminal (typically `http://localhost:5173` or the port configured by Vite/Express).

### Building for Production

```bash
npm run build
npm start
```

## 🤝 Contributing

Contributions are welcome!

1. 🍴 Fork the repository
2. 🌿 Create a feature branch: `git checkout -b feature/AmazingFeature`
3. 💾 Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. 📤 Push to the branch: `git push origin feature/AmazingFeature`
5. 🎉 Open a Pull Request

## 📜 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## 📞 Contact

For queries or issues related to this project, reach out via the repository's [Issues](https://github.com/RawatGitLab/District-Tehri/issues) page.

---

<p align="center">Built for Tehri District 🏔️</p>
