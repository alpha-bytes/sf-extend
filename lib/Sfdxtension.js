const Generator = require('yeoman-generator');

class Sfdxtension extends Generator{
    constructor(args, opts, config){
        super(args, opts);
        this.config = config;
    }
}

module.exports = Sfdxtension;