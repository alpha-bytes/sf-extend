const Sfdxtension = require('sf-extend');
const pkg = require('../../../package.json');
const glob = require('glob');
const path = require('path');
const fs = require('fs');

class SfdxtensionGenerator extends Sfdxtension{

    initializing(){
        let { version } = pkg;
        this.tmplData = {
            version
        };
    }
    
    async prompting(){
        let answers = {},
            defName = 'MySfdxtension';
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
        Object.assign(this.tmplData, answers);
    }

    async writing(){
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
        // switch dir and alert env for config change
        this.destinationRoot(this.tmplData.directory);
        this.env.cwd = this.destinationPath();
        // set dependency
        let { name, version } = pkg;
        await this.addDependencies({ [name]: version });
        this.packageJson.save();
    }

}

module.exports = SfdxtensionGenerator;