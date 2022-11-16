const { SfdxCommand } = require('@salesforce/command');
const yo = require('../../../lib/types/YeomanEnv')();
const initAliases = require('../../../lib/initAliases');

class SfExtensionGenerate extends SfdxCommand{

    static aliases = initAliases(__dirname, __filename);

    async run(){
        let { config } = this;
        yo.register(require.resolve('../../../internal/generators/generate'), {
            config,
            Command: SfExtensionGenerate
        });
        await yo.run();
    }

}

module.exports = SfExtensionGenerate;