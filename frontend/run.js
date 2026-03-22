import { spawnSync } from 'child_process';
import { writeFileSync } from 'fs';
const result = spawnSync('npm', ['run', 'lint'], { shell: true, encoding: 'utf8' });
writeFileSync('lint.txt', (result.stdout || '') + '\n' + (result.stderr || ''));
