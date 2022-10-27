const { SfdxCommand } = require('@salesforce/command');

class ExtendCmd extends SfdxCommand{

    static args = [{ name: 'pkg' }]

    async run(){
        this.log(this.args.pkg);
    }

}

module.exports = ExtendCmd;