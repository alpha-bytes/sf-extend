const SfdxtendCmd = require('../../../lib/types/SfdxtendCmd');
const initAliases = require('../../../lib/initAliases');

class ExtendCmd extends SfdxtendCmd{

    static aliases = initAliases(__dirname, __filename);
    static args = [{ name: 'pkg' }]

    async run(){
        this.log(this.args.pkg);
    }

}

module.exports = ExtendCmd;