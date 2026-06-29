// Prints the LAN IPv4 address(es) so you know what to type on the iPhone.
import os from 'node:os';

const nets = os.networkInterfaces();
const found = [];
for (const name of Object.keys(nets)) {
  for (const net of nets[name] || []) {
    if (net.family === 'IPv4' && !net.internal) found.push({ name, address: net.address });
  }
}
if (found.length === 0) {
  console.log('Nessun IP LAN trovato (sei connesso al Wi-Fi?).');
} else {
  console.log('IP LAN disponibili (usa questo sull\'iPhone):');
  for (const f of found) console.log(`  ${f.name}: https://${f.address}:3443`);
}
