import { config, validateConfig } from './config.js';
import { db } from './models.js';
import { api } from './api.js';
import { gateway } from './gateway.js';

validateConfig();
await db.authenticate();
const privateServer = api.listen(config.apiPort, config.apiHost, () => console.log(`Private API ready on ${config.apiHost}:${config.apiPort}`));
const publicServer = gateway.listen(config.port, '0.0.0.0', () => console.log(`Application ready on http://localhost:${config.port}`));
async function shutdown() {
  publicServer.close(); privateServer.close();
  await db.close(); process.exit(0);
}
process.on('SIGINT', shutdown); process.on('SIGTERM', shutdown);
