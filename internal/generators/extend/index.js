const Sfdxtension = require('@alpha-bytes/sfdxtend');
const { scopes } = require('../../../lib/globals');
const cp = require('child_process');
const validate = require('validate-npm-package-name');
const requirePath = require('../../../lib/requireResolver');

function installGlobal(package){
    return new Promise((res, rej)=>{
        // validate package name
        let valid = validate(package);
        if(!valid.validForNewPackages){
            return rej(`${package} is an invalid npm package name`);
        }
        // init process
        let process = cp.exec(`npm install -g ${package}`, (err, stdout, stderr) => {
            if(err){
                rej(err);
            } else if (stderr){
                rej(stderr);
            } else {
                res(stdout);
            }
        });
        process.on('message', (msg) => console.log(msg));
    });
}

class Extend extends Sfdxtension{

    constructor(...args){
        super(...args);
        let [ , sfdxContext] = args;
        this.packageOrPath = sfdxContext.packageOrPath;
    }

    async initializing(){
        let { packageOrPath } = this;
        let { scope } = this.sfdxContext;
        let { root } = this.sfdxContext.config;

        let installResult;
        try{
            // determine if package is already installed
            this.packageOrPath = await requirePath(packageOrPath, root, scope);
        } catch(err){
            if(this.sfdxContext.scope === scopes.global){
                console.log(`${this.packageOrPath} not yet installed. Installing globally.`);
                installResult = await installGlobal(packageOrPath);
            } else {
                console.log(`Installing and adding ${packageOrPath} as a project dev dependency.`)
                installResult = await this.addDevDependencies(packageOrPath);
            }
        }
    }

    installing(){
        debugger;
    }

}

module.exports = Extend;