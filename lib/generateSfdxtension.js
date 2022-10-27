const yo = require('yeoman-environment');

async function run(){
    const env = yo.createEnv();
    let genPath = require.resolve('@alpha-bytes/generator-sfdxtend');
    env.register(genPath, 'sfdxtension');
    await env.run('sfdxtension');
}

module.exports = run;