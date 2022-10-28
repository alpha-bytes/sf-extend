const SfdxtendCmd = require('../../../lib/types/SfdxtendCmd');
const { flags } = require('@salesforce/command');
const initAliases = require('../../../lib/initAliases');
const yo = require('../../../lib/yeoman');
const path = require('path');

class ExtendCmd extends SfdxtendCmd{

    static aliases = initAliases(__dirname, __filename);
    static args = [ { name: 'packageOrPath', required: true } ];
    static flagsConfig = {
        scope: flags.enum({
            options: ['global', 'project'],
            description: 'extensions should run only in the current project or every in all projects ("global", default)',
            char: 's',
            default: 'global',
            name: 'scope'
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
        let [ packageOrPath, scopeFlag, scope ] = argv;
        this.args = { packageOrPath }
        this.flags = { scope }
    }

    async run(){
        let { config } = this;
        let { packageOrPath } = this.args;
        let { scope } = this.flags;
        let extGenPath = path.resolve(__dirname, '..', '..', '..', 'internal', 'generators', 'extend', 'index.js');
        yo.register(extGenPath, { packageOrPath, config, scope, targetCmd: this._targetCmd });
        await yo.run();
    }

}

module.exports = ExtendCmd;