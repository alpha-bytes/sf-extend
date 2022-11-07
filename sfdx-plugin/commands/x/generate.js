const { SfdxCommand } = require('@salesforce/command');
const yo = require('../../../lib/yeoman');
const initAliases = require('../../../lib/initAliases');

class SfdxtensionGenerate extends SfdxCommand{

    static aliases = initAliases(__dirname, __filename);

    async run(){
        yo.register(require.resolve('../../../internal/generators/generate'));
        await yo.run();
    }

}

module.exports = SfdxtensionGenerate;