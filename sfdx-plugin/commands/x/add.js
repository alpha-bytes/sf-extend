const { SfdxCommand } = require('@salesforce/command');
const { flags } = require('@salesforce/command');
const { lifecycle } = require('../../../lib/globals');
const initAliases = require('../../../lib/initAliases');
const yo = require('../../../lib/types/YeomanEnv')();
const path = require('path');

class ExtendCmd extends SfdxCommand{

    static aliases = initAliases(__dirname, __filename);
    static args = [ { name: 'packageOrPath', required: true } ];
    static flagsConfig = (()=>{
        let flagsObj = {
            global: flags.boolean({
                description: 'the extension will run every time the given command is executed, globally',
                char: 'g',
                default: false,
                name: 'global'
            })
        }; 
        for(let evt in lifecycle){
            flagsObj[evt] = flags.boolean({
                description: `Extension should run ${evt} the provided command.`,
                char: `${evt[0]}`,
                name: evt
            });
        }

        return flagsObj;
    })();

    /**
     * @param {SfdxCommand} cmd used when explicitly extending an sfdx command
     */
     set targetCmd(cmd){
        this._targetCmd = cmd;
    }

    /**
     * allows prerun script to set context as if command was directly invoked
     */
    setOpts(args, flags){
        this.args = args;
        this.flags = flags;
    }

    async run(){
        let { config } = this;
        let Command = this._targetCmd;
        let { packageOrPath } = this.args;
        let { global, before, after } = this.flags;
        let extGenPath = path.resolve(__dirname, '..', '..', '..', 'internal', 'generators', 'add', 'index.js');
        yo.register(extGenPath, { 
            config, 
            Command, 
            lifecycle: lifecycle.before,
            packageOrPath, 
            global, 
            attachLifecycle: (()=>{
                if(before) return lifecycle.before;
                if(after) return lifecycle.after;
                
                return undefined;
            })()
        });
        await yo.run();
    }

}

module.exports = ExtendCmd;