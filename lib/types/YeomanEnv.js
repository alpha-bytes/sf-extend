const yo = require('yeoman-environment');
const NS = require('../../package.json').name;

class YeomanEnv {

    constructor(){
        this.env = yo.createEnv();
        this.extCount = 0;
    }

    register(path, args){
        this.env.composeWith(path, args);
        this.extCount++;
    }

    /**
     * run the generators previously registered
     * @param {boolean} [promptConflicts=false] when true, user will be asked to validate file overwrites; defaults to false
     */
    async run(promptConflicts=false){
        console.log(`${this.extCount} sf-extend extensions attached to this command and lifecycle. Running now...`);
        await this.env.start({ 
            force: !promptConflicts
        });
    }
}

module.exports = () => new YeomanEnv();