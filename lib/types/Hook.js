const { aliases, lifecycle } = require('../globals');
const ExtendCmd = require('../../sfdx-plugin/commands/x/add');
const { init } = require('./ConfigStore');
const yeoman = require('../yeoman');
const requireResolver = require('../requireResolver');

/**
 * module singleton so that instantiation logic only executes once during transaction
 * @type {Hook}
 */
let hook;

/**
 * @typedef {import('@salesforce/command').SfdxCommand} SfdxCommand
 */

class Hook {
    /**
     * constructor
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
        // initialize the singleton if this is prerun
        if(!hook){
            let { argv, Command, config } = arg;
            hook = new Hook(argv, Command, config, this); // the oclif runtime binds the this to the run Fn
            
            return await hook.run(lifecycle.before);
        }
        // singleton already initialized (postrun)
        await hook.run(lifecycle.after);
    }

    async run(currentCycle){
        // init config if this is prerun
        if(!this.configStore) this.configStore = await init(this.config);
        // eval if a command is being explicitly extended
        let { argv } = this;
        let aliasFlags = aliases.map(alias => `--${alias}`),
            match = aliasFlags.filter(alias => argv.indexOf(alias) > -1), 
            pos = match.length === 0 ? -1 : argv.indexOf(match[match.length -1]);
        if(pos > -1){ // explicit extension addition
            return (await this._addExtension(argv.slice(pos + 1)));
        }
        // else evaluate if there are any configured extensions for the in-context Command and lifecycle
        let cmdExtensions = this.configStore.getMergedConfig(this.Command, currentCycle);
        if(cmdExtensions && cmdExtensions.length > 0){
            await this._executeCommands(cmdExtensions);
        }
    }

    async _addExtension(positional){
        let { config, Command } = this;
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

    /**
     * @param {Array<string>} cmdExtensions command extensions to be executed
     */
    async _executeCommands(cmdExtensions){
        let { config, Command } = this;
        for(let ext of cmdExtensions){
            let abs = await requireResolver(ext);
            yeoman.register(abs, { config, Command });
        }
        await yeoman.run();
    }
}

module.exports.run = Hook.run;