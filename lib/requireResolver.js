const configStore = require('./types/ConfigStore');
const path = require('path');
const { existsSync } = require('fs')

function requireResolver(packageOrPath, projectOnly=false){
    return new Promise((res, rej) => {
        // if packageOrPath is itself an absolute path, resolve the promise with it
        if(path.isAbsolute(packageOrPath)){
            // if there is already a filename, resolve now
            if(path.extname(packageOrPath)){
                return res(packageOrPath);
            } else{
                // read package.json to see what path to append
                let jsonPath = `${packageOrPath}/package.json`;
                if(existsSync(jsonPath)){
                    let json = require(jsonPath), 
                        append = (()=>{
                            let { main, exports } = json;
                            if(main) return main; 
                            if(exports && exports['.']) return exports['.'];

                            return undefined;
                        })();
                    if(append){
                        let normalized = path.join(packageOrPath, append);
                        return res(normalized);
                    }
                }
            }

            // if nothing else worked, reject the Promise
            rej(`Could not resolve ${packageOrPath}`);
        } else{
            // else resolve the package name using paths from config store; includes project dir if applicable
            let paths = configStore().getRequirePaths(projectOnly);
            try{
                let path = require.resolve(packageOrPath, { paths });
                res(path);
            } catch(err){
                rej(err);
            }
        }
    });
}

module.exports = requireResolver;