const { SfdxCommand } = require('@salesforce/command');
const generate = require('../../../lib/generateSfdxtension');
const initAliases = require('../../../lib/initAliases');

class SfdxtensionGenerate extends SfdxCommand{

    static aliases = initAliases(__dirname, __filename);

    async run(){
        await generate();
    }

}

module.exports = SfdxtensionGenerate;