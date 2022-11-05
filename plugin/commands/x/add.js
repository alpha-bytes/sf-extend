const { SfdxCommand } = require('@salesforce/command');
const { flags } = require('@salesforce/command');
const initAliases = require('../../../lib/initAliases');
const yo = require('../../../lib/yeoman');
const path = require('path');

class ExtendCmd extends SfdxCommand{

    static aliases = initAliases(__dirname, __filename);
    static args = [ { name: 'packageOrPath', required: true } ];
    static flagsConfig = {
        global: flags.boolean({
            description: 'the extension will run every time the given command is executed, globally',
            char: 'g',
            default: false,
            name: 'global'
        })
    }

    /**
     * @param {SfdxCommand} cmd used when explicitly extending an sfdx command
     */
     set targetCmd(cmd){
        this._targetCmd = cmd;
    }

    /**
     * @param {Array<string>} positional used when explicitly extending an sfdx command
     */
    setPositional(...argv){
        let [ packageOrPath, global ] = argv;
        this.args = { packageOrPath }
        this.flags = { global: global ? true : false }
    }

    async run(lifecycle){
        let { config } = this;
        let { packageOrPath } = this.args;
        let { global } = this.flags;
        let extGenPath = path.resolve(__dirname, '..', '..', '..', 'internal', 'generators', 'extend', 'index.js');
        yo.register(extGenPath, { config, Command: this._targetCmd, lifecycle, packageOrPath, global });
        await yo.run();
    }

}

module.exports = ExtendCmd;