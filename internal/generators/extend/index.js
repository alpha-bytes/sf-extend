const Sfdxtension = require('../../../lib/types/Sfdxtension');
const { configFileName } = require('../../../lib/globals');
const cp = require('child_process');
const validate = require('validate-npm-package-name');
const requirePath = require('../../../lib/requireResolver');
const { existsSync } = require('fs');
const { mkdir, writeFile } = require('fs/promises');
const path = require('path');
const { addExtension } = require('../../../lib/prompt');

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
        // if packageOrPath is a relative path, make it absolute
        this.packageOrPath = (()=>{
            let given = path.resolve(process.cwd(), this.packageOrPath);

            return existsSync(given) ? given : this.packageOrPath;
        })();
        // set the sfdxtend config condiationally on scope, defaulting to project-level package.json
        let configDir = this.destinationRoot(),
            configPath = `${configDir}/package.json`;
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

    async prompting(){
        // determine existing configs
        let { lifecycle, command, global } = this.sfdxContext;
        let { id } = command;
        let lodashPath = `${global ? '' : 'sfdxtend.'}${lifecycle}.${id}`;
        let cmdExtensions = this.rc.getPath(lodashPath);
        if(!cmdExtensions){
            cmdExtensions = [ this.packageOrPath ];
        } else{
            let configs = await addExtension(id, cmdExtensions);
            cmdExtensions.splice(configs.order, 0, this.packageOrPath);
        }
        // set the config
        this.rc.setPath(lodashPath, cmdExtensions);
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