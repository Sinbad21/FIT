# FitControl

PWA personale per allenamento, dieta, progressi, PDF dieta, pasti AI e notifiche.
Stack: **Next.js 15 (App Router) · React 19 · TypeScript · better-sqlite3 · Tailwind**.

## Avvio rapido

```bash
npm install
npm run setup:db      # crea data/fitcontrol.sqlite con dati demo
npm run dev           # http://localhost:3000 (HTTP)
```

Reset del database: `npm run reset:db`.

---

## PWA su iPhone (HTTPS locale)

Service worker, offline serio e Web Push richiedono **HTTPS** (anche in rete locale).
Usiamo [mkcert](https://github.com/FiloSottile/mkcert) per un certificato fidato.

### 1. Installa mkcert e crea i certificati

```bash
# macOS:    brew install mkcert nss
# Windows:  choco install mkcert
mkcert -install

# trova il tuo IP LAN
npm run lan:ip
# esempio output: https://192.168.1.50:3443

mkdir -p certs
mkcert -key-file certs/key.pem -cert-file certs/cert.pem localhost 127.0.0.1 192.168.1.50
```

### 2. Avvia il server HTTPS

```bash
npm run dev:https
# Locale:    https://localhost:3443
# Da iPhone: https://192.168.1.50:3443
```

(`PORT` e `HOST` sono configurabili via env.)

### 3. Accesso da iPhone

1. iPhone e computer sulla **stessa rete Wi-Fi**.
2. Safari → `https://<IP-LAN>:3443`.
   - Certificato non fidato? Su iPhone installa la **root CA di mkcert**
     (`mkcert -CAROOT` → invia `rootCA.pem` all'iPhone via AirDrop/email →
     Impostazioni → Profilo scaricato → installa → Generali → Info →
     Impostazioni certificati → abilita la fiducia completa).
3. **Aggiungi alla schermata Home**: Condividi → *Aggiungi a Home*.
4. Apri l'app dalla Home (modalità standalone).

### 4. Verifica del service worker

Apri l'app, vai in **Impostazioni → Notifiche**. Se vedi lo stato push e il
badge di sincronizzazione compare quando vai offline, il service worker è attivo.
Da Safari desktop: *Sviluppo → Service Workers*.

---

## Offline scrivibile

Le azioni di scrittura (completamento esercizi, log peso/reps/RPE, conferma/modifica
pasti, acqua, peso corporeo) passano da `postWithOffline`:

- online → invio diretto all'API;
- offline o errore di rete → l'azione viene messa in coda in **IndexedDB**;
- al ritorno online la coda viene **sincronizzata** automaticamente (last-write-wins).

UI: un badge in alto mostra *Offline · N in coda* / *Sincronizzo…* / *N da
sincronizzare · Riprova* (retry manuale).

File principali:
`lib/offline/db.ts` · `lib/offline/queue.ts` · `lib/offline/sync.ts` ·
`hooks/useOnlineStatus.ts` · `components/SyncStatusBadge.tsx`.

---

## Notifiche push (Web Push + VAPID)

```bash
npm run vapid:generate     # stampa le chiavi
```

Aggiungi a `.env.local`:

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:tu@example.com
```

Poi in **Impostazioni → Notifiche** premi *Attiva notifiche push* e *Invia prova*.

### Scheduler dei promemoria

Lo scheduler legge le regole (`notifications`) e invia i promemoria scaduti:

```bash
npm run push:run           # one-shot; non reinvia due volte lo stesso giorno
```

Esempio cron (ogni 5 minuti):

```
*/5 * * * * cd /path/to/FIT && node scripts/notify-scheduler.mjs >> /tmp/fitcontrol-notify.log 2>&1
```

Sono supportati i tipi: allenamento, colazione, pranzo, cena, spuntini, acqua,
peso, riepilogo serale. Testo, orario, frequenza e on/off sono configurabili.

### Limiti su iPhone / PWA

- Web Push su iOS richiede **iOS 16.4+** e l'app **aggiunta alla schermata Home**.
- Le notifiche arrivano solo se la subscription è valida; le subscription morte
  (404/410) vengono rimosse automaticamente.
- Senza VAPID l'app continua a funzionare: lo stato mostra *non configurate*.

---

## Provider AI

Configurabile via env (fallback rule-based sempre disponibile):

```
AI_PROVIDER=none        # none | openai | local
AI_API_KEY=...          # opzionale
AI_MODEL=gpt-4o-mini    # opzionale
```

Vedi `lib/ai/`.

---

## Sicurezza

- Non esporre il server oltre la LAN di cui ti fidi (`-H 0.0.0.0` ascolta su tutte
  le interfacce).
- Nessun segreto nei log; le chiavi VAPID stanno in `.env.local` (gitignored).
- `npm audit` per le vulnerabilità delle dipendenze.

---

## Script npm

| script | descrizione |
|---|---|
| `dev` | dev server HTTP |
| `dev:https` | dev server HTTPS (certs in `certs/`) |
| `build` / `start` | build e avvio produzione |
| `setup:db` / `reset:db` | inizializza / reset database |
| `lan:ip` | stampa l'IP LAN per l'iPhone |
| `vapid:generate` | genera chiavi VAPID |
| `push:run` | esegue lo scheduler dei promemoria |
