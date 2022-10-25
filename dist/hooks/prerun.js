module.exports.default = async function(options){
    let { argv, Command } = options;
    if(argv.includes('--extend')){
        await this.log(argv);
        await this.exit();
    }
}