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
        let { attachLifecycle, Command, global } = sfdxContext;
        this.explicit = Command !== undefined;
        this.packageOrPath = sfdxContext.packageOrPath;
        this.global = global;
        this.requireRoot = global ? configStore.globalDir : configStore.projectDir;
        this.attachLifecycle = attachLifecycle;
    }

    async initializing(){
        // if packageOrPath is a relative path, make it absolute
        this.packageOrPath = (()=>{
            let given = path.resolve(process.cwd(), this.packageOrPath);

            return existsSync(given) ? given : this.packageOrPath;
        })();
        // set the sf-x config condiationally on scope, defaulting to project-level package.json
        let { global } = this;
        if(!global && !configStore.projectConfigPath){
            throw new Error('Project-scoped extensions can only be added from an sfdx project directory')
        }
        this.rc = this.createStorage(global ? configStore.globalConfigPath : configStore.projectConfigPath);
    }

    async prompting(){
        if(this.explicit){
            // determine existing configs
            let { attachLifecycle, Command } = this.sfdxContext;
            let { id } = Command;
            await this._prompting(id);
        }
    }

    async _prompting(id, attachLifecycle=this.attachLifecycle, autoApprove=true){
        if(!attachLifecycle){
            attachLifecycle = (await this.prompt([
                {
                    name: 'attachLifecycle',
                    message: 'When do you want extension to run?',
                    choices: Object.keys(lifecycle),
                    default: lifecycle.after,
                    type: 'list'
                }
            ])).attachLifecycle;
            this.attachLifecycle = attachLifecycle;
        }
        let { packageOrPath } = this;
        let { global } = this;
        let lodashPath = `${global ? '' : 'sf-x.'}${attachLifecycle}.${id}`;
        let cmdExtensions = this.rc.getPath(lodashPath),
            mutated = false;
        if(!cmdExtensions || cmdExtensions.length === 0){
            cmdExtensions = [ packageOrPath ];
            mutated = true;
        } else if(!cmdExtensions.includes(packageOrPath)){
            let { order } = (await prompter.addExtension(id, cmdExtensions));
            cmdExtensions.splice(order, 0, packageOrPath);
            mutated = true;
        }
        // set the config
        if(mutated){
            let approved = autoApprove ? true :  
                (await this.prompt([
                    {
                        name: 'approved',
                        type: 'confirm', 
                        default: true, 
                        message: `Extend ${id} `
                    }
                ])).approved;
            if(approved) this.rc.setPath(lodashPath, cmdExtensions);
        }
    }

    async install(){
        let { packageOrPath, requireRoot } = this;
        let { global } = this;

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
            let cmds = pkgJson.getPath(`sf-x.${cycle}`)
            if(cmds && cmds.length > 0){
                let answers;
                const handleImplicit = async (viewCnt)=>{
                    const message = viewCnt > 0 ?
                        'Now what?' : `This extension would like to run ${cycle} certain sfdx commands. How would you like to review?`;
                    return await this.prompt([
                        {
                            message,
                            type: 'expand',
                            choices: [
                                {
                                    key: 'a',
                                    value: 'approve',
                                    name: 'Approve All'
                                },
                                {
                                    key: 'c', 
                                    value: 'consolidate',
                                    name: 'View consolidate list of commands requested for extension'
                                },
                                {
                                    key: 'i',
                                    value: 'individual',
                                    name: 'Approve/Deny commands individually'
                                },
                                {
                                    key: 'd',
                                    value: 'deny',
                                    name: 'Deny all'
                                }
                            ],
                            name: 'decision'
                        }
                    ]);
                };
                let viewCnt = 0;
                while(!answers || answers.decision === 'consolidate'){
                    answers = await handleImplicit(viewCnt);
                    if(answers.decision === 'consolidate'){
                        console.log(cmds);
                    }
                    viewCnt++;
                }
                let { decision } = answers;
                if(decision !== 'deny'){
                    let autoApprove = decision === 'approve';
                    for(let cmd of cmds){
                        await this._prompting(cycle, cmd, autoApprove);
                    }
                }
            }
        }
    }
}

module.exports = Extend;