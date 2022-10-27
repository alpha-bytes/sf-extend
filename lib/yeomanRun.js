const yo = require('yeoman-environment');

async function runSingle(packageOrPath, ns){
    const env = yo.createEnv();
    let genPath = require.resolve(packageOrPath, ns);
    env.register(genPath, ns);
    await env.run(ns)
}

module.exports.runSingle = runSingle;