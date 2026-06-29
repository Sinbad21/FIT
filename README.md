# FitControl

PWA personale per allenamento, dieta, progressi e promemoria.

## Avvio
```powershell
npm install
npm run setup:db
npm run dev
```

PC: http://localhost:3000

iPhone nella stessa Wi-Fi: trova l'IP del PC con `ipconfig`, poi apri `http://IP_DEL_PC:3000`.

Nota: per service worker, offline e push su iPhone serve HTTPS/secure context. HTTP via LAN è utile per testare UI e API.

Documentazione progetto: `docs/architecture.md`.