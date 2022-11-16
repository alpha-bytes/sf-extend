const yo = require('yeoman-environment');
const NS = require('../../package.json').name;

class YeomanEnv {

    constructor(){
        this.env = yo.createEnv();
        this.extCount = 0;
    }

    register(path, args){
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
    async run(){
        console.log(`${this.extCount} sf-extend extensions attached to this command and lifecycle. Running now...`);
        try{
            await this.env.start();
        } catch(err){
            throw err;
        }
    }
}

module.exports = () => new YeomanEnv();