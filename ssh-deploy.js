const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function deploy() {
  console.log('Connecting to server 178.128.127.161 via password authentication...');
  try {
    await ssh.connect({
      host: '178.128.127.161',
      username: 'root',
      tryKeyboard: true,
      onKeyboardInteractive: (name, instructions, instructionsLang, prompts, finish) => {
        if (prompts.length > 0 && prompts[0].prompt.toLowerCase().includes('password')) {
          finish(['wErew@lf17john']);
        } else {
          finish([]);
        }
      }
    });

    console.log('Connected successfully!');
    console.log('Executing: cd /var/www/est-website && git pull origin main && npm run build && pm2 reload all');
    
    const result = await ssh.execCommand('cd /var/www/est-website && git pull origin main && npm run build && pm2 reload all', {
      cwd: '/var/www/est-website',
      onStdout(chunk) {
        process.stdout.write(chunk.toString('utf8'));
      },
      onStderr(chunk) {
        process.stderr.write(chunk.toString('utf8'));
      }
    });

    console.log('\n=== Deployment Execution Result ===');
    console.log('STDOUT:\n' + result.stdout);
    if (result.stderr) console.log('STDERR:\n' + result.stderr);
    
    ssh.dispose();
  } catch (error) {
    console.error('Connection or Execution Failed:', error);
    ssh.dispose();
  }
}

deploy();
