const yo = require('yeoman-environment');
const path = require('path');

async function run(){
    const env = yo.createEnv();
    env.register(path.resolve('generator-sfdxtend'));
    await env.run(env.rootGenerator);
}

module.exports = run;