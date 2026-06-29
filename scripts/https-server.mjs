// HTTPS dev server for FitControl.
// Serves Next.js over HTTPS so the PWA (service worker + Web Push) works on iPhone.
// Certificates are expected in ./certs (generate them with mkcert, see README).
//
//   mkcert -install
//   mkcert -key-file certs/key.pem -cert-file certs/cert.pem localhost 127.0.0.1 <your-LAN-IP>
//   npm run dev:https
//
import { createServer } from 'node:https';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import next from 'next';

const port = Number(process.env.PORT || 3443);
const host = process.env.HOST || '0.0.0.0';
const dev = process.env.NODE_ENV !== 'production';

const certDir = path.join(process.cwd(), 'certs');
const keyPath = process.env.SSL_KEY || path.join(certDir, 'key.pem');
const certPath = process.env.SSL_CERT || path.join(certDir, 'cert.pem');

if (!existsSync(keyPath) || !existsSync(certPath)) {
  console.error('\n[FitControl] Certificati mancanti.');
  console.error('Genera i certificati con mkcert:');
  console.error('  mkcert -install');
  console.error('  mkcert -key-file certs/key.pem -cert-file certs/cert.pem localhost 127.0.0.1 <IP-LAN>\n');
  process.exit(1);
}

const httpsOptions = { key: readFileSync(keyPath), cert: readFileSync(certPath) };

const app = next({ dev, hostname: host, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => handle(req, res)).listen(port, host, () => {
    console.log(`\n[FitControl] HTTPS attivo`);
    console.log(`  Locale:   https://localhost:${port}`);
    console.log(`  Da iPhone: https://<IP-LAN-del-Mac/PC>:${port}\n`);
  });
});
