const { SfdxCommand } = require('@salesforce/command');
const generate = require('../../../lib/generateSfdxtension');

class SfdxtensionGenerate extends SfdxCommand{

    async run(){
        await generate();
    }

}

module.exports = SfdxtensionGenerate;