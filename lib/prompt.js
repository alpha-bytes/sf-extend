const { lifecycle } = require('./globals');
// inquirer uses ESM so need to use async import syntax
const inquirerPromise = import('inquirer');
let inquirer;

async function ready(){
    if(!inquirer){
        let result = await Promise.all([ inquirerPromise ]);

        inquirer = result[0].default;
    }

    return true;
}

async function addExtension(cmdId, existing=[], getLifecycle=false){
    await ready();
    let existingCp = new Array(existing);
    let answers = await inquirer.prompt([
        {
            when: existing && existing.length > 0,
            message: `${cmdId} already has the following extensions. Select where you want the new extension to run:`,
            type: 'list', 
            choices: (()=> {
                existingCp.push('(default)');
                
                return existingCp.map((ext, index) => `${index}: ${ext}`);
            })(),
            default: existingCp.length - 1,
            loop: true, 
            name: 'order', 
            filter(val){
                return val[0];
            }, 
        }, 
        {
            message: `When should this extension run in relation to ${cmdId}?`,
            type: 'list',
            choices: Object.values(lifecycle),
            default: lifecycle.after, 
            name: 'lifecycle',
            when: getLifecycle
        }
    ]);

    return answers;
}

module.exports = {
    addExtension
}