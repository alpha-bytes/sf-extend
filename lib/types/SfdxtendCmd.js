const { SfdxCommand } = require('@salesforce/command');

class SfdxtendCmd extends SfdxCommand{
    
    /**
     * @param {Array<any>} args the standard oclif args, currently [ argv, config ]
     */
    constructor(...args){
        super(...args);
    }
}

module.exports = SfdxtendCmd;