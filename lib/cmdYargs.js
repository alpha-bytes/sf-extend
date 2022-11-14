const yargs = require('yargs-parser');

/**
 * @typedef {object} YargsObject
 * @property {Array<string>} YargsObject.args positional arguments passed
 * @property {Map} YargsObject.flags object of key/value pairs for flags passed including default values
 * defined by the sfdx command itself
 */

/**
 * 
 * @param {Array<string>} args argv passed to command line with command
 * @param {SfdxCommand} Command sfdx command prototype
 * @returns {YargsObject}
 */
function parseArgs(args, Command){
    let alias = {},
        defaults = {}, 
        boolean = [];
    Object.entries(Command.flagsConfig).forEach(entry => {
        let [key, value] = entry;
        if(key && value){
            let { char } = value;
            if(char) alias[key] = [ char ];
            if(value.default !== undefined) defaults[key] = value.default;
            // ensure boolean flags are processed appropriately
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
                prev[key] = value;
            }

            return prev;
        }, {});
    let positional = parsed['_'].reduce((prev, curr, index) => {
            if(curr){
                let arg = Command.args[index];
                let { name } = arg;
                prev[name] = curr;
            }

            return prev;
        }, {});

    delete flags['_'];

    return {
        args: positional,
        flags
    }
}

module.exports = parseArgs;