const yo = require('yeoman-environment');
const { globalDebugger } = require('../globals');

class YeomanEnv {

    constructor(){
        this.env = yo.createEnv();
        this.extCount = 0;
    }

    async register(path, args){
        if(!this.globalDebugger) this.globalDebugger = await globalDebugger();
        this.globalDebugger(`Registering generator: ${path}\nResolve paths: ${this.env.getNpmPaths()}`);
        try{
            this.env.composeWith(path, args);
            this.extCount++;
        } catch(err){
            throw err;
        }
    }

    /**
     * run the generators previously registered
     */
    async run(logStart=true){
        if(this.extCount > 0 && logStart){
            console.log(`${this.extCount} sf-extend extensions attached to this command and lifecycle. Running now...`);
        }
        try{
            await this.env.start();
        } catch(err){
            throw err;
        }
    }
}

module.exports = () => new YeomanEnv();