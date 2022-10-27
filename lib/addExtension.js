const { SfdxCommand } = require('@salesforce/core');

class ExplicitConfig{
    /**
     * constructor
     * @param {SfdxCommand} [sfdxCmd] sfdx command name
     * @param {string} [lifecycle='after'] either of 'before' or 'after'
     * @param {string|number} [position='last'] any of 'first', 'last' or an integer greater than zero
     * @param {string} [scope='global'] either of 'global' or 'project'
     */
    constructor(sfdxCmd, lifecycle='after', position='last', scope='global'){
        this.sfdxCmd = sfdxCmd; // TODO walk prototype tree
        this.lifecycle = lifecycle; 
        this.position = position;
        this.scope = scope;
    }
}

/**
 * adds a new extension in the given context
 * @param {object} config oclif configuration passed through from caller
 * @param {string} packageOrPath npm package name or absolute path to Generator module
 * @param {SfdxCommand} [sfdxCmd] sfdx command invoked for explicit extension
 * @param {Array<string>} [explicitConfigs] positional args passed after packageOrPath for explicit extension
 */
async function add(config, packageOrPath, sfdxCmd, ...explicitConfigs){
    let [ lifecycle, position, scope ] = explicitConfigs;
    if(position && typeof position === 'string') position = Number.parseInt(position);
    let implicit = !sfdxCmd && !lifecycle && !position && !scope;
}

module.exports = add;