# ANIBEATS

> **My personal corner on the internet. Anime. Rap. Beats. Cars. Travel. Built with love, not for a grade.**

ANIBEATS started as **WEB1 Assignment 2** (*Internet and Web Programming 1*). The assignment ended, the love did not, and now I am building it piece by piece — like an album, not a quick mixtape.

## Highlights

- **Spatial 3D Hero Turntable (`HeroSculpture3D`)** — Interactive Three.js WebGL vinyl deck & colored orbital world rings reacting to the active Mood Selector (`Hype`, `Chill`, `Late Night`, `Sad`, `Workout`).
- **Interactive 3D Travel Globe (`TravelGlobe3D`)** — Three.js 3D Dream Map with lat/lon country beacons (`Japan`, `USA`, `Germany`, `Dubai`), orbital arcs, click raycasting, and `0 / 80` progress tracker.
- **Live Spotify & Admin Studio** — Paste or edit real Spotify playlist/track links, official anime posters, Dream Garage builds, travel trips, and dev diary entries directly from the Admin Panel.
- **All 9 Core Worlds** — Home, Anime, Music / Rap, Playlists, Cars, Travel (80 Destinations), Story (Living Timeline + 3 Pillars), Community, and Journal.

## Running Locally

### 1. Frontend + Built-in Node API (Port 3000)

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

### 2. Spring Boot 3 Backend (Java 21, Port 8080)

A full Spring Boot 3 REST backend implementing the exact `/api/anibeats/*` contract lives in `backend-springboot/`:

```bash
cd backend-springboot
mvn spring-boot:run
```

Point the frontend directly to the Spring Boot server by setting:

```bash
VITE_API_BASE=http://localhost:8080/api/anibeats npm run dev
```
