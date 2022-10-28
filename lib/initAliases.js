const path = require('path');

const aliases = ['x', 'extend'];

module.exports = (dirName, fileName, topicSeparator=':') =>{
    let topics = dirName.split('commands')[1].split('/').slice(1),
        topic = topics.shift(),
        cmd = path.basename(fileName).replace(/\.js$/, '').replace('index', '');

    let relAliases = aliases.filter(alias => alias !== topic).map(alias => {
        return `${alias}${topics.join(topicSeparator)}${cmd ? `:${cmd}` : ''}`;
    });

    return relAliases;
}