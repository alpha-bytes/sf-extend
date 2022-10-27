const { clean } = require('nopt');
const addGenerator = require('../../lib/addExtension');

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
    let pos = argv.indexOf('--extend');
    if(pos > -1){
        let positional = argv.slice(pos + 1), 
            packageOrPath = positional.shift(), 
            sanitized = positional.map(flag => {
                let clean = flag.replace(/\s/g, '').replace('--', '');
                
                return clean.indexOf('=') > -1 ? clean.split('=')[1] : clean;
            });
        await addGenerator(config, packageOrPath, Command, ...sanitized);
        process.exit(0);
    }
}