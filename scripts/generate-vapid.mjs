// Generates a VAPID key pair for Web Push and prints the .env lines to add.
import webpush from 'web-push';

const keys = webpush.generateVAPIDKeys();
console.log('Aggiungi queste righe a .env.local:\n');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:you@example.com`);
