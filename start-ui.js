const { spawn } = require('child_process');
const path = require('path');

const uiPath = path.join(__dirname, 'services', 'admin-panel-ui');
console.log(`Starting Admin UI in ${uiPath}...`);

const cmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const child = spawn(cmd, ['run', 'dev'], {
    cwd: uiPath,
    stdio: 'inherit',
    shell: true
});

child.on('exit', (code) => {
    console.log(`Admin UI process exited with code ${code}`);
    process.exit(code);
});
