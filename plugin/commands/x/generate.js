const SfdxtendCmd = require('../../../lib/types/SfdxtendCmd');
const generate = require('../../../lib/generateSfdxtension');
const initAliases = require('../../../lib/initAliases');

class SfdxtensionGenerate extends SfdxtendCmd{

    static aliases = initAliases(__dirname, __filename);

    async run(){
        await generate();
    }

}

module.exports = SfdxtensionGenerate;