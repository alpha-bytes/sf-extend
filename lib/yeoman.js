const yo = require('yeoman-environment');
const env = yo.createEnv();
const argMap = new Map();
const requireResolver = require('../lib/requireResolver');
let nsctr = 0;

function register(packageOrPath, args){
    let pseudoNs = `ns${nsctr}`, 
        path = require.resolve(packageOrPath);
    env.register(path, pseudoNs);
    argMap.set(pseudoNs, args);
    nsctr++;
}

async function run(){
    for(let ns of env.getGeneratorNames()){
        await env.run(ns, argMap.get(ns));
    }
}

module.exports = {
    register, 
    run
}