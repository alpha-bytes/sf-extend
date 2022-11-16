const { existsSync } = require('fs');
const { mkdir, writeFile, readFile } = require('fs/promises');
const path = require('path');
const { exec } = require('child_process');
const { configFileName } = require('../globals');

const configContents = 
`{
    "before": { }, 
    "after": { }
}`;

/**
 * @type {ConfigStore}
 */
let configStore;

function getNpmPrefix(){
    return new Promise((res, rej) => {
        exec('npm config list -l --json', { shell: true }, (err, stdout, stderr) => {
            if(err) rej(err);
            
            try{
                let { prefix } = JSON.parse(stdout);
                res(prefix);
            } catch(err){
                rej(err);
            }
        });
    });
}

class ConfigStore{

    /**
     * initializes the config store singleton and returns it
     * @param {object} config oclif-provided config object
     * @returns {ConfigStore}
     */
     static async init(config){
        let { configDir, root } = config;

        configStore = new ConfigStore(configDir, root);
        await configStore.init();

        return configStore;
    }

    /**
     * A READ-ONLY representation of the global and (if in an sfdx project dir) project configs
     * @param {string} configDir the XDG config directory as provided through oclif config
     */
    constructor(configDir, cliRoot){
        this._sfConfigDir = configDir;
        this.cliRoot = cliRoot;
        this.globalConfigDir = configDir.replace(path.basename(configDir), 'sf-extend');
        this.globalConfigPath = `${this.globalConfigDir}/${configFileName}`;
        this.projectDir = existsSync(`${process.cwd()}/sfdx-project.json`) ? process.cwd() : undefined;
        this.projectConfigPath =  this.projectDir ? `${this.projectDir}/package.json` : undefined;
    }

    async init(){
        // init require paths by order of specificity, ending with the global npm prefix location
        let prefix;
        try {
            prefix = await getNpmPrefix();
        } catch (err) {
            throw err;
        }
        this.requirePaths = [this.cliRoot, this._sfConfigDir, path.dirname(process.execPath), prefix];
        if(this.projectDir) this.requirePaths.splice(0, 0, this.projectDir);

        // create dir and file if they don't exist
        if(!existsSync(this.globalConfigDir)) await mkdir(this.globalConfigDir);
        if(!existsSync(this.globalConfigPath)) await writeFile(
            this.globalConfigPath,
            configContents,
            'utf-8'
        );
        this.globalConfig = JSON.parse(await readFile(this.globalConfigPath));
        this.projectConfig = this.projectConfigPath ? 
            JSON.parse(await readFile(this.projectConfigPath))['sf-extend'] : undefined;
    }

    /**
     * 
     * @param {boolean} [projectOnly=false] when true only returns the current project directory, if valid sfdx project
     * @returns {Array<string>|undefined}
     */
    getRequirePaths(projectOnly=false){
        return projectOnly ? [ this.projectDir ] : this.requirePaths;
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

