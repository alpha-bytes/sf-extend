const { aliases, lifecycle } = require('../globals');
const ExtendCmd = require('../../sfdx-plugin/commands/x/add');
const { init } = require('./ConfigStore');
const yo = require('./YeomanEnv')();
const requireResolver = require('../requireResolver');
const yargs = require('../cmdYargs');

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
     * constructor
     * @param {Array<string>} argv runtime cli arguments
     * @param {SfdxCommand} command the sfdx command invoked
     * @param {object} config oclif config object
     * @param {string} lifecycle either 'prerun' or 'postrun'
     */
    constructor(argv, Command, config, hookApi){
        this.Command = Command;
        this.config = config;
        this.hookApi = hookApi;
        this.yargs = this.#initYargs(argv);
    }

    static async run(arg){
        // initialize the singleton if this is prerun
        if(!hook){
            let { argv, Command, config } = arg;
            hook = new Hook(argv, Command, config, this); // the oclif runtime binds the this to the run Fn
            // init the config store
            hook.configStore = await init(this.config);

            return await hook.run(lifecycle.before);
        }
        // singleton already initialized (postrun)
        await hook.run(lifecycle.after);
    }

    #initYargs(argv){
        // eval if a command is being explicitly extended
        let aliasFlags = aliases.map(alias => `--${alias}`),
            match = aliasFlags.filter(alias => argv.indexOf(alias) > -1), 
            pos = match.length === 0 ? -1 : argv.indexOf(match[match.length -1]);
        if(pos > -1){
            this.isAdd = true;
            
            return yargs(argv.slice(pos + 1), ExtendCmd); 
        }

        return yargs(argv, this.Command);
    }

    async run(currentCycle){
        if(this.isAdd && currentCycle === lifecycle.before) return await this._addExtension();
        // run any attachments configured for instance Command and current lifecycle
        let cmdExtensions = this.configStore.getMergedConfig(this.Command, currentCycle);
        if(cmdExtensions && cmdExtensions.length > 0){
            await this._executeCommands(cmdExtensions, currentCycle);
        }
    }

    async _addExtension(){
        let { config, Command, yargs } = this;
        let { args, flags } = yargs;
        let cmd = new ExtendCmd(flags, config);
        cmd.targetCmd = Command;
        cmd.setOpts(args, flags);
        try{
            await cmd.run();
            process.exit(0);
        } catch(err){
            console.error(err.message);
            process.exit(1);
        }
    }

    /**
     * @param {Array<string>} cmdExtensions command extensions to be executed
     */
    async _executeCommands(cmdExtensions, lifecycle){
        let { yargs, config, Command } = this;
        try{
            for(let ext of cmdExtensions){
                let abs = await requireResolver(ext);
                yo.register(abs, { config, Command, lifecycle, yargs });
            }
            await yo.run();
        } catch(err){
            console.error(err.message);
        }
    }
}

module.exports.run = Hook.run;