const Sfdxtension = require('../../../lib/types/Sfdxtension');
const { configFileName } = require('../../../lib/globals');
const cp = require('child_process');
const validate = require('validate-npm-package-name');
const requirePath = require('../../../lib/requireResolver');
const { existsSync } = require('fs');
const { mkdir, writeFile } = require('fs/promises');
const path = require('path');

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
        // set the sfdxtend config condiationally on scope, defaulting to project-level package.json
        let configDir = this.destinationRoot(),
            configPath = `${configDir}/${configFileName}`;
        let { global } = this.sfdxContext;
        if(global){
            configDir = (()=>{
                let { configDir } = this.sfdxContext.config;
                let baseName = path.basename(configDir);

                return configDir.replace(baseName, 'sfdxtend');
            })();
            configPath = `${configDir}/${configFileName}`;
            if(!existsSync(configDir)) await mkdir(configDir);
        }
        // create file if it doesn't exist
        if(!existsSync(configPath)){
            let content = await this.readTemplate(configFileName);
            await writeFile(configPath, content, 'utf-8');
        }
        // intialize a Storage instance
        this.rc = this.createStorage(configPath);
    }

    async configuring(){
        // write explicit configs passed by user to storage
        
    }

    async install(){
        let { packageOrPath } = this;
        let { global } = this.sfdxContext;
        let { root } = this.sfdxContext.config;

        let absPath, installResult;
        try{
            // determine if package is already installed
            absPath = await requirePath(packageOrPath, root, global);
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