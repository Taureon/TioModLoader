let mods = localStorage.getItem('TioModLoader_mods');
logHeader = '[TioModLoader] ';

if (mods === null) {
    localStorage.setItem('TioModLoader_mods', '[]');
    mods = [];
}

//very basic api to deobfuscate some variable names
let variableAliases = {
    'nationNames': 'kJ',
    'nationBalances': 'kR',
    'nationCount': 'c9',
    'playerCount': 'c5',
    'isSingleplayer': 'cC',
    'mainCanvas': 'ka',
    'mainCanvasContext': 'kb',
    'webSockets': 'dH'
},
TioModLoaderAPI = {
    variableAliases,
    getValue = (alias) => window[variableAliases[alias]],
    setValue = (alias, value) => window[variableAliases[alias]] = value,
    setObjectProperty = (alias, index, value) => window[variableAliases[alias]][index] = value
};

//mod: {code: String, name: String, author: String, description: String, enabled: Boolean}
for (mod of mods) {
    mod.name = mod.name || 'UNKNOWN MOD';
    if (mod.enabled) {
        console.log(logHeader + 'Loading mod: ' + mod.name);
        try {
            eval(mod.code);
        } catch (err) {
            console.log(logHeader + `Mod Error [${mod.name}]: ` + err.message);
        }
    }
}
