import {
  readFileSync,
  appendFileSync,
  existsSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

const dir = process.env.PUBLISH_FIXTURE;
const settings = JSON.parse(readFileSync(join(dir, 'scenario.json'), 'utf8'));
const [command, ...args] = process.argv.slice(2);
appendFileSync(
  join(dir, 'calls.jsonl'),
  JSON.stringify([command, ...args]) + '\n',
);
const validated = existsSync(join(dir, 'validated'));
const repo = 'carlos-ed-ferreira/oddiary-pwa';
const remote = `https://github.com/${repo}.git`;
function result(output = '', status = 0) {
  process.stdout.write(output + '\n');
  process.exit(status);
}

if (command === 'docker') result();
if (command === 'make') {
  writeFileSync(join(dir, 'validated'), 'true');
  result('', settings.validationFails ? 2 : 0);
}
if (command === 'git') {
  if (args[0] === 'branch') result(settings.branch ?? 'chore/pilot');
  if (args[0] === 'status')
    result(
      settings.dirty || (validated && settings.changedTree)
        ? ' M unexpected.txt'
        : '',
    );
  if (args[0] === 'rev-parse')
    result(validated && settings.changedHead ? 'changed456' : 'abc123');
  if (args[0] === 'remote')
    result(
      args.includes('--push')
        ? (settings.pushRemote ?? remote)
        : (settings.remote ?? remote),
    );
  if (args[0] === 'rev-list') result(settings.emptyBranch ? '0' : '1');
  if (args[0] === 'log') result('Configure operational CI');
  result();
}
if (command === 'gh') {
  if (args[0] === 'auth') result('', settings.unauthenticated ? 1 : 0);
  if (args[0] === 'repo') result(`${repo}\tmain\tADMIN`);
  if (args[0] === 'api' && args[1].includes('/runs?'))
    result(settings.reliableCI && !settings.unprovenMain ? '1' : '0');
  if (args[0] === 'api')
    result(
      settings.reliableCI
        ? args[1].includes('workflows')
          ? 'active'
          : 'true'
        : '',
      settings.reliableCI ? 0 : 1,
    );
  if (args[1] === 'list') result(settings.existing ? '7' : '');
  if (args[1] === 'view' && args.includes('statusCheckRollup'))
    result(settings.noChecks ? '0' : '1');
  if (args[1] === 'create' || args[1] === 'view')
    result(`https://github.com/${repo}/pull/7`);
  if (args[1] === 'checks') result('quality pending', settings.pending ? 8 : 0);
  result();
}
result('', 1);
