import { spawn } from 'node:child_process';
import { mkdir, access, writeFile, open, readFile } from 'node:fs/promises';
import path from 'node:path';
import net from 'node:net';
import { randomBytes } from 'node:crypto';

const root = path.resolve('.local');
const base = process.env.MYSQL_BASE || 'C:/wamp64/bin/mysql/mysql8.4.7';
const executable = path.join(base, 'bin', process.platform === 'win32' ? 'mysqld.exe' : 'mysqld');
const data = path.join(root, 'mysql-data');
await access(executable);
await mkdir(root, { recursive: true });
const listening = await new Promise(resolve => { const c = net.connect(3307, '127.0.0.1'); c.once('connect', () => { c.destroy(); resolve(true); }); c.once('error', () => resolve(false)); });
if (listening) { console.log('Port 3307 already in use. No new MySQL instance started.'); process.exit(0); }
const exists = await access(path.join(data, 'auto.cnf')).then(() => true, () => false);
const args = ['--no-defaults', `--basedir=${base}`, `--datadir=${data}`];
if (!exists) {
  await mkdir(data, { recursive: true });
  console.log('Initializing an isolated local MySQL database...');
  await new Promise((resolve, reject) => {
    const p = spawn(executable, [...args, '--initialize-insecure', '--console'], { windowsHide: true, stdio: 'inherit' });
    p.on('exit', code => code === 0 ? resolve() : reject(new Error(`MySQL init: ${code}`))); p.on('error', reject);
  });
}
const log = await open(path.join(root, 'mysql.log'), 'a');
const child = spawn(executable, [...args, '--port=3307', '--bind-address=127.0.0.1', '--mysqlx=0', '--console'], {
  detached: true, windowsHide: true, stdio: ['ignore', log.fd, log.fd],
});
child.unref(); await log.close();
await writeFile(path.join(root, 'mysql.pid'), String(child.pid));
for (let i = 0; i < 60; i++) {
  const ready = await new Promise(resolve => { const c = net.connect(3307, '127.0.0.1'); c.once('connect', () => { c.destroy(); resolve(true); }); c.once('error', () => resolve(false)); });
  if (ready) break;
  if (i === 59) throw new Error('MySQL failed to start. See .local/mysql.log.');
  await new Promise(r => setTimeout(r, 500));
}
if (!(await access('.env').then(() => true, () => false))) {
  const template = await readFile('.env.example', 'utf8');
  await writeFile('.env', template.replace('API_KEY=replace-with-at-least-32-random-characters', `API_KEY=${randomBytes(32).toString('hex')}`).replace('DB_PASSWORD=replace-with-a-strong-password', `DB_PASSWORD=${randomBytes(24).toString('hex')}`));
}
console.log('Dedicated MySQL ready on 127.0.0.1:3307. Run npm run db:setup on the first launch.');
