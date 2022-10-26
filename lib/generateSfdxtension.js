const yo = require('yeoman-environment');

async function run(){
    const env = yo.createEnv();
    env.register(require.resolve('@alpha-bytes/generator-sfdxtend'), 'sfdxtension');
    await env.run('sfdxtension');
}

module.exports = run;