const configStore = require('./types/ConfigStore');

function requireResolver(packageOrPath){
    return new Promise((res, rej) => {
        // get require paths from config store, which will include project dir if applicable
        let paths = configStore().requirePaths;
        try{
            let path = require.resolve(packageOrPath, { paths });
            res(path);
        } catch(err){
            rej(err);
        }
    });
}

module.exports = requireResolver;