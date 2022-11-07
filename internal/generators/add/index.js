const Sfdxtension = require('../../../lib/types/Sfdxtension');
const cp = require('child_process');
const validate = require('validate-npm-package-name');
const requireResolver = require('../../../lib/requireResolver');
const { existsSync } = require('fs');
const path = require('path');
const prompter = require('../../../lib/prompter');
const { lifecycle } = require('../../../lib/globals');
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
        let { Command, global } = sfdxContext;
        this.explicit = Command !== undefined;
        this.packageOrPath = sfdxContext.packageOrPath;
        this.sfdxContext.global = global ? global : false
        this.requireRoot = global ? configStore.globalDir : configStore.projectDir;
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
        if(this.explicit){
            // determine existing configs
            let { lifecycle, Command } = this.sfdxContext;
            let { id } = Command;
            await this._prompting(lifecycle, id);
        }
    }

    async _prompting(lifecycle, id){
        let { global } = this.sfdxContext;
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
        let { packageOrPath, requireRoot } = this;
        let { global } = this.sfdxContext;

        let installResult;
        try{
            // determine if package is already installed
            installResult = await requireResolver(packageOrPath, requireRoot);
        } catch(err){
            console.log(`${this.packageOrPath} not yet installed. Installing ${global ? 'as global package' : 'as dev dependency'}.`);
            if(this.global){
                installResult = await installGlobal(packageOrPath);
            } else {
                installResult = await this.addDevDependencies(packageOrPath);
            }
        } finally{
            console.log(`Successfully installed to ${installResult}`);
        }
    }

    async end(){
        // read installed extension's package.json file to see if it has any preconfigured command hooks
        let { packageOrPath, requireRoot } = this;
        let resolved = await requireResolver(packageOrPath, requireRoot),
            dir = path.dirname(resolved),
            pkgJson = (()=>{
                function getFirstPkgJson(root){
                    let pkgPath = `${root}/package.json`;
                    
                    return existsSync(pkgPath) ? pkgPath : getFirstPkgJson(path.resolve(root, '..'));
                }
                
                return this.createStorage(getFirstPkgJson(dir));
            })();

        for(let cycle in lifecycle){
            let cmds = pkgJson.getPath(`sfdxtend.${cycle}`)
            if(cmds && cmds.length > 0){
                let answer = await this.prompt([
                    {
                        message: `Extension has defined hooks for the ${cycle} lifecycle. Review/add now?`,
                        type: 'confirm',
                        name: 'review'
                    }
                ]);
                if(answer.review){
                    for(let cmd of cmds){
                        await this._prompting(cycle, cmd);
                    }
                }
            }
        }
    }
}

module.exports = Extend;