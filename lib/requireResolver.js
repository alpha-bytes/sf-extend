const configStore = require('./types/ConfigStore');

function requireResolver(packageOrPath, ...paths){
    return new Promise((res, rej) => {
        // default to sfdx-cli root and process.cwd if paths not explicitly provided
        store = configStore();
        if(paths.length === 0){
            if(store.projectDir) paths.push(store.projectDir);
            paths.push(store.cliRoot);
        }
        try{
            let path = require.resolve(packageOrPath, { paths });
            res(path);
        } catch(err){
            rej(err);
        }
    });
}

module.exports = requireResolver;