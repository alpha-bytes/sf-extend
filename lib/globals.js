let extRes, extRej, 
    globalDebuggerPromise = new Promise((res, rej) => {
        extRes = res;
        extRj = rej;
    }), 
    globalDebugger;

module.exports.aliases = ['x', 'extend'];
module.exports.configFileName = 'sf-extend-rc.json';
module.exports.lifecycle = {
    before: 'before', 
    after: 'after'
}
module.exports.setGlobalDebugger = (hookApi) => {
    globalDebugger = hookApi.debug;
    extRes(globalDebugger);
}
module.exports.globalDebugger = async ()=> {
    return await globalDebuggerPromise;
}
