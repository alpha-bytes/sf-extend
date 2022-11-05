const { existsSync } = require('fs');
const { mkdir, writeFile, readFile } = require('fs/promises');
const { configFileName } = require('../globals');
const path = require('path');

const configContents = 
`{
    "before": { }, 
    "after": { }
}`;

/**
 * @type {ConfigStore}
 */
 let configStore;

class ConfigStore{

    /**
     * initializes the config store singleton and returns it
     * @param {object} config oclif-provided config object
     * @returns {ConfigStore}
     */
     static async init(config){
        let { configDir, root } = config;
        let baseName = path.basename(configDir),
            globalDir = configDir.replace(baseName, 'sfdxtend');

        configStore = new ConfigStore(globalDir, root);
        await configStore.init();

        return configStore;
    }

    /**
     * A READ-ONLY representation of the global and (if in an sfdx project dir) project configs
     * @param {string} globalDir the global directory
     */
    constructor(globalDir, cliRoot){
        this.cliRoot = cliRoot;
        this.globalDir = globalDir;
        this.globalConfigPath = `${this.globalDir}/${configFileName}`;
        this.projectDir = existsSync(`${process.cwd()}/sfdx-project.json`) ? process.cwd() : undefined;
        this.projectConfigPath =  this.projectDir ? `${this.projectDir}/package.json` : undefined;
    }

    async init(){
        // create dir and file if they don't exist
        if(!existsSync(this.globalDir)) await mkdir(this.globalDir);
        if(!existsSync(this.globalConfigPath)) await writeFile(
            this.globalConfigPath,
            configContents,
            'utf-8'
        );
        this.globalConfig = JSON.parse(await readFile(this.globalConfigPath));
        this.projectConfig = this.projectConfigPath ? 
            JSON.parse(await readFile(this.projectConfigPath))['sfdxtend'] : undefined;
    }

    /**
     * returns the merged configuration for the given command
     * @param {import('@salesforce/command').SfdxCommand} Command
     * @param {string} lifecycle
     */
    getMergedConfig(Command, lifecycle){
        let { id } = Command;
        let global = this.globalConfig[lifecycle],
            project = this.projectConfig ? this.projectConfig[lifecycle] : {};
        let gcmd = global[id] || [],
            pcmd = project ? (project[id] || []) : [];
        // project extensions always run *after* global so push those last
        gcmd.push(...pcmd);

        return gcmd;
    }

}

module.exports = () => {
    if(!configStore){
        throw new Error('You must initialize the config store before importing it.');
    }

    return configStore;
};
module.exports.init = ConfigStore.init;

