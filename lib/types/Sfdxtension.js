const Generator = require('yeoman-generator');
const { lifecycle } = require('../globals');

/**
 * @typedef {import('@salesforce/command').SfdxCommand} SfdxCommand
 */

/**
 * @typedef {object} SfdxtensionConfig
 * @param {object} config oclif/sfdx runtime configs
 * @param {SfdxCommand} command the sfdx command to which this extension is currently attached
 * @param {string} lifecycle 'before' or 'after' which indicates when this extension is running in relation to the sfdxCommand
 */

class Sfdxtension extends Generator{
    /**
     * constructor
     * @param {Array<string>} args yeoman args
     * @param {SfdxtensionConfig} config
     */
    constructor(yoArgs, sfdxContext){
        super(yoArgs, sfdxContext);
        let { config, command, lifecycle, global } = sfdxContext;
        this.sfdxContext = {
            config, 
            command, 
            lifecycle: lifecycle ? lifecycle : 'after', 
            global: global ? global : false
        };
        // default desintationRoot to process.cwd()
        this.destinationRoot(process.cwd());
    }
}

module.exports = Sfdxtension;