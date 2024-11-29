# Wahlkreis 113 Kampagnenmanager

Eine Webanwendung zur Unterstützung der SPD-Kampagne im Wahlkreis 113.

## Funktionen

- Dashboard mit Echtzeit-Statistiken
- Aufgabenverwaltung
- Kalenderintegration
- Tür-zu-Tür-Kampagnenmanagement
- Chat-System
- Gamification-Elemente
- Dokumenten- und Ressourcenverwaltung

## Installation

### Voraussetzungen

- Node.js (Version 14 oder höher)
- MongoDB
- npm oder yarn

### Setup

1. Repository klonen:
   ```bash
   git clone [repository-url]
   cd wahlkreis113-kampagnenmanager
   ```

2. Backend-Dependencies installieren:
   ```bash
   npm install
   ```

3. Frontend-Dependencies installieren:
   ```bash
   cd client
   npm install
   ```

4. Umgebungsvariablen konfigurieren:
   - .env-Datei im Root-Verzeichnis erstellen
   - Notwendige Umgebungsvariablen eintragen

5. MongoDB starten:
   ```bash
   mongod
   ```

6. Anwendung starten:
   ```bash
   # Im Root-Verzeichnis
   npm run dev:full
   ```

Die Anwendung ist nun unter http://localhost:3000 erreichbar.

## Entwicklung

- Backend: Node.js mit Express
- Frontend: React mit Material-UI
- Datenbank: MongoDB
- Echtzeit-Kommunikation: Socket.io

## Lizenz

Dieses Projekt ist lizenziert unter der MIT-Lizenz.
