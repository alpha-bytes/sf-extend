function requirePath(packageOrPath, root, global){
    return new Promise((res, rej) => {
        // always add sfdx-cli root and process.cwd to the resolution paths
        try{
            let paths = [ global ? root : process.cwd() ];
            let path = require.resolve(packageOrPath, { paths });
            res(path);
        } catch(err){
            rej(err);
        }
    });
}

module.exports = requirePath;