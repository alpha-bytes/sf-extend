const Sfdxtension = require('sfdxtend');
const cp = require('child_process');
const validate = require('validate-npm-package-name');
const requireResolver = require('../../../lib/requireResolver');
const { existsSync } = require('fs');
const path = require('path');
const prompter = require('../../../lib/prompter');
const configStore = require('../../../lib/types/ConfigStore')();

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
        let { global } = sfdxContext;
        this.packageOrPath = sfdxContext.packageOrPath;
        this.sfdxContext.global = global ? global : false
    }

    async initializing(){
        // if packageOrPath is a relative path, make it absolute
        this.packageOrPath = (()=>{
            let given = path.resolve(process.cwd(), this.packageOrPath);

            return existsSync(given) ? given : this.packageOrPath;
        })();
        // set the sfdxtend config condiationally on scope, defaulting to project-level package.json
        let { global } = this.sfdxContext;
        this.rc = this.createStorage(global ? configStore.globalConfigPath : configStore.projectConfigPath);
    }

    async prompting(){
        // determine existing configs
        let { lifecycle, Command, global } = this.sfdxContext;
        let { id } = Command;
        let lodashPath = `${global ? '' : 'sfdxtend.'}${lifecycle}.${id}`;
        let cmdExtensions = this.rc.getPath(lodashPath);
        if(!cmdExtensions){
            cmdExtensions = [ this.packageOrPath ];
        } else{
            let configs = await prompter.addExtension(id, cmdExtensions);
            cmdExtensions.splice(configs.order, 0, this.packageOrPath);
        }
        // set the config
        this.rc.setPath(lodashPath, cmdExtensions);
    }

    async install(){
        let { packageOrPath } = this;
        let { global } = this.sfdxContext;

        let absPath, installResult;
        try{
            // determine if package is already installed
            absPath = await requireResolver(packageOrPath, global ? configStore.globalConfigPath : configStore.projectConfigPath);
        } catch(err){
            console.log(`${this.packageOrPath} not yet installed. Installing ${global ? 'as global package' : 'as dev dependency'}.`);
            if(this.global){
                installResult = await installGlobal(packageOrPath);
            } else {
                installResult = await this.addDevDependencies(packageOrPath);
            }
        }
    }
}

module.exports = Extend;