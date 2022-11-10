const yargs = require('yargs-parser');
const { aliases, lifecycle } = require('../globals');
const ExtendCmd = require('../../sfdx-plugin/commands/x/add');
const { init } = require('./ConfigStore');
const yo = require('./YeomanEnv')();
const requireResolver = require('../requireResolver');
/**
 * @typedef {import('@salesforce/command').SfdxCommand} SfdxCommand
 */
/**
 * module singleton so that instantiation logic only executes once during transaction
 * @type {Hook}
 */
let hook;

function convertFlags(args){
    let alias = {},
        defaults = {}, 
        boolean = [];
    Object.entries(ExtendCmd.flagsConfig).forEach(entry => {
        if(entry){
            let [key, value] = entry;
            let { char } = value;
            alias[key] = [ char ];
            if(value.default !== undefined) defaults[key] = value.default;
            // ensure boolean flags are process appropriately
            if(value.type === 'boolean') boolean.push(key);
        }
    });
    
    let parsed = yargs(args, {
        alias, 
        boolean,
        default: defaults
    });
    let flags = Object.entries(parsed).reduce((prev, curr) => {
            if(curr){
                let [key, value] = curr;
                if(ExtendCmd.flagsConfig[key]) prev[key] = value;
            }

            return prev;
        }, {}),
        positional = parsed['_'].reduce((prev, curr, index) => {
            if(curr){
                let arg = ExtendCmd.args[index];
                let { name } = arg;
                prev[name] = curr;
            }

            return prev;
        }, {});


    return {
        args: positional,
        flags
    }
}

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
            let args = convertFlags(argv.slice(pos + 1));
            return (await this._addExtension(args));
        }
        // else evaluate if there are any configured extensions for the in-context Command and lifecycle
        let cmdExtensions = this.configStore.getMergedConfig(this.Command, currentCycle);
        if(cmdExtensions && cmdExtensions.length > 0){
            await this._executeCommands(cmdExtensions, currentCycle);
        }
    }

    async _addExtension(parsed){
        let { config, Command } = this;
        let { args, flags } = parsed;
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
        let { config, Command } = this;
        try{
            for(let ext of cmdExtensions){
                let abs = await requireResolver(ext);
                yo.register(abs, { config, Command, lifecycle });
            }
            await yo.run();
        } catch(err){
            console.error(err.message);
        }
    }
}

module.exports.run = Hook.run;