const { SfdxCommand } = require('@salesforce/core');

/**
 * adds a new extension in the given context
 * @param {Object} config oclif configuration passed through from caller
 * @param {String} packageOrPath npm package name or absolute path to Generator module
 * @param {String} [scope='global'] either of global (default) or project
 * @param {SfdxCommand} [sfdxCmd] sfdx command invoked for explicit extension
 */
async function add(config, packageOrPath, sfdxCmd, scope='global'){
    
}

module.exports = add;