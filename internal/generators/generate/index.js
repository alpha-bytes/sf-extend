const SfExtension = require('sf-extension');
const pkg = require('../../../package.json');
const glob = require('glob');
const path = require('path');
const fs = require('fs');
const { lifecycle } = require('../../../lib/globals');

class SfExtensionGenerator extends SfExtension{

    constructor(args, opts){
        super(args, opts);
        this.commands = Array.from(this.sfContext.config._commands.keys()).sort();
        this.forceOverwrite = true;
    }

    initializing(){
        let { name, version, dependencies } = pkg;
        let baseVersion = dependencies['sf-extension'];
        this.tmplData = {
            pkg: {
                name,
                version
            }, 
            baseVersion,
            config: Object.keys(lifecycle).reduce((prev, curr) => {
                if(curr) prev[curr] = [];
                
                return prev;
            }, {})
        };
    }
    
    async prompting(){
        let answers = {},
            defName = 'MySfExtension';
        // get basic configs
        Object.assign(answers, await this.prompt([
            {
                name: 'extName',
                message: 'What is the name of your extension?',
                default: defName,
                filter: (val) => {
                    if(val && val.length > 0){
                        let trimmed = val.replace(/\s/g, ''),
                            cleaned = `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}`;

                        return cleaned;
                    }

                    return defName;
                }
            }
        ]));
        Object.assign(answers, await this.prompt([
            {
                name: 'directory',
                message: 'Which directory?',
                default: answers.extName.toLowerCase(),
                filter: (val) => {
                    return path.resolve(process.cwd(), val);
                }
            },
            {
                name: 'extVersion',
                message: 'What is the version?',
                default: '1.0.0'
            }
        ]));
        // write full answers to tmplData
        Object.assign(this.tmplData, answers);
        // get commands for extension to attach to
        let { config } = this.tmplData;
        for(let when in lifecycle){
            let proceed = (await this.prompt([
                {
                    name: 'proceed',
                    type: 'confirm',
                    message: `Do you want to prescribe any commands for your extension to run **${when.toUpperCase()}**?`
                }
            ])).proceed;
            if(proceed){
                let { commands } = this;
                config[when] = (await this.prompt([
                    {
                        choices: commands,
                        message: `Select commands for your extension to run ${when}`,
                        name: 'extends',
                        pageSize: 10,
                        type: 'checkbox'
                    }
                ])).extends;
            }
        }
    }

    async writing(){
        // set conflicter options
        this.forceOverwrite = true;
        let { directory } = this.tmplData;
        if(!fs.existsSync(directory)){
            fs.mkdirSync(directory);
        }
        this.destinationRoot(directory);
        this.fs.copyTpl(
            glob.sync(this.templatePath('**/*'), { dot: true }), 
            this.destinationPath(), 
            this.tmplData
        );
    }

    async installing(){
        // switch dir and alert env to trigger installs
        this.destinationRoot(this.tmplData.directory);
        this.env.cwd = this.destinationPath();
        this.packageJson.save();
    }

}

module.exports = SfExtensionGenerator;