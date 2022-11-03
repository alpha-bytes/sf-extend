const { aliases, lifecycle } = require('../globals');
const ExtendCmd = require('../../plugin/commands/x/add');

/**
 * @typedef {import('@salesforce/command').SfdxCommand} SfdxCommand
 */

/**
 * module singleton so that instantiation logic only executes once during transaction
 * @type {Hook}
 */
let hook;

class Hook {
    /**
     * 
     * @param {Array<string>} argv runtime cli arguments
     * @param {SfdxCommand} command the sfdx command invoked
     * @param {object} config oclif config object
     * @param {string} lifecycle either 'prerun' or 'postrun'
     */
    constructor(argv, Command, config, hookApi){
        this.argv = argv;
        this.Command = Command;
        this.config = config;
        this.hookApi = hookApi;
    }

    static async run(arg){
        if(!hook){
            let { argv, Command, config } = arg;
            hook = new Hook(argv, Command, config, this); // the oclif runtime binds the this to the run Fn
            
            return await hook.run(lifecycle.before);
        }
        
        await hook.run(lifecycle.after);
    }

    async run(currentCycle){
        if(currentCycle === lifecycle.before){
            await this.prerun();
        } else {
            await this.postrun();
        }
    }

    async prerun(){
        let { argv, Command, config } = this;
        let aliasFlags = aliases.map(alias => `--${alias}`),
            match = aliasFlags.filter(alias => argv.indexOf(alias) > -1), 
            pos = match.length === 0 ? -1 : argv.indexOf(match[match.length -1]);
        if(pos > -1){
            let positional = argv.slice(pos + 1);
            let cmd = new ExtendCmd(positional, config);
            cmd.targetCmd = Command;
            cmd.setPositional(...positional);
            try{
                await cmd.run(lifecycle.before);
            } catch(err){
                this.hookApi.error(err);
            }
            process.exit(0);
        }
    }

    async postrun(){

    }
}

module.exports.run = Hook.run;