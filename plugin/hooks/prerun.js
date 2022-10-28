const { aliases } = require('../../lib/globals');
const ExtendCmd = require('../../plugin/commands/x/index');

/**
 * @typedef {import('@salesforce/command').SfdxCommand} SfdxCommand
 */

/**
 * hook function listening for prerun oclif lifecycle event
 * @param {object} arg 
 * @param {Array<string>} arg.argv
 * @param {SfdxCommand} arg.Command
 * @param {object} arg.config
 */
module.exports.default = async function(arg){
    let { argv, Command, config } = arg;
    let aliasFlags = aliases.map(alias => `--${alias}`),
        match = aliasFlags.filter(alias => argv.indexOf(alias) > -1), 
        pos = match.length === 0 ? -1 : argv.indexOf(match[match.length -1]);
    if(pos > -1){
        let positional = argv.slice(pos + 1);
        let cmd = new ExtendCmd(positional, config);
        cmd.targetCmd = Command;
        cmd.setPositional(...positional);
        await cmd.run();
        process.exit(0);
    }
}