const yo = require('yeoman-environment');
const Generator = require('yeoman-generator');
const NS = require('../../package.json').name;

class Stub extends Generator{
    /**
     * 
     * @param {Array<string>} args not used here
     * @param {Object} opts options
     * @param {Map} opts.generatorMap
     */
    constructor(args, opts){
        super(args, opts);
        let { generatorMap } = opts;
        this.extensions = generatorMap.size;
        generatorMap.forEach((opts, path) => {
            this.composeWith(path, opts);
        });

    }

    initializing(){
        console.log(`${this.extensions} attached to this command. Running now...`);
    }
}

class YeomanEnv {

    constructor(){
        this.generatorMap = new Map();
        this.env = yo.createEnv();
        this.env.registerStub(Stub, NS);
    }

    register(packageOrPath, args){
        let path = require.resolve(packageOrPath);
        this.generatorMap.set(path, args);
    }

    async run(){
        let { generatorMap } = this;
        await this.env.run(NS, { generatorMap });
    }
}

module.exports = () => new YeomanEnv();