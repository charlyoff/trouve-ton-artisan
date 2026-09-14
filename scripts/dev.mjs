import { spawn } from 'node:child_process';
const children = [
  spawn(process.execPath, ['--watch', 'server/start.js'], { stdio: 'inherit', windowsHide: true }),
  spawn(process.execPath, ['node_modules/vite/bin/vite.js'], { stdio: 'inherit', windowsHide: true }),
];
for (const child of children) child.on('exit', code => { if (code) { children.forEach(p => p.kill()); process.exit(code); } });
process.on('SIGINT', () => { children.forEach(p => p.kill()); process.exit(); });
