const yo = require('yeoman-environment');
const path = require('path');

async function run(){
    const env = yo.createEnv();
    let resolvePath = path.dirname(require.resolve('@alpha-bytes/generator-sfdxtend'));
    env.register(`${resolvePath}/generators/app/index.js`, 'sfdxtension');
    await env.run('sfdxtension');
}

module.exports = run;