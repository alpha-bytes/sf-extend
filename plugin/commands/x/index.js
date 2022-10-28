const SfdxtendCmd = require('../../../lib/types/SfdxtendCmd');
const { flags } = require('@salesforce/command');
const initAliases = require('../../../lib/initAliases');
const addExtension = require('../../../lib/addExtension');

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
        let { packageOrPath } = this.args;
        let { scope } = this.flags;
        await addExtension(this.config, packageOrPath, scope, this._targetCmd);
    }

}

module.exports = ExtendCmd;