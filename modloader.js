let ___mods = JSON.parse(localStorage.getItem('TioModLoader_mods'));
___logHeader = '[TioModLoader] ';

if (___mods === null) {
    localStorage.setItem('TioModLoader_mods', '[]');
    ___mods = [];
}

// Modified version of: https://stackoverflow.com/a/59563339/10793061
//Recreates the bare minimum EventEmitter from Node.JS because browsers just don't.
class EventEmitter {
    constructor() {
        this.callbacks = {};
    }
    on(event, cb) {
        if (!this.callbacks[event]) this.callbacks[event] = [];
        this.callbacks[event].push(cb);
    }
    emit(event, ...data) {
        for (let callback of this.callbacks[event]) callback(...data);
    }
}

/*
    START: TioModLoader API
*/

//Because 'object instanceof Proxy' does not work.
let ___proxified = [],

//A bunch of alias dictionaries.
variableAliases = {
    'aliveNations': 'kK',
    'gameVersion': 'kc',
    'isInGame': 'c5',
    'isSingleplayer': 'cC',
    'leaderboardPositions': 'h4',
    'mainCanvas': 'ka',
    'mainCanvasContext': 'kb',
    'nationNames': 'kJ',
    'nationBalances': 'kR',
    'nationBorders': 'kT',
    'nationBordersAttacking': 'kS',
    'nationCount': 'c9',
    'nationSizes': 'kP',
    'playerCount': 'c5',
    'playerId': 'cK',
    'webSockets': 'dH'
},
cookieAliases = {
    'name': 0,
    'id': 1,
    'selectedEmojis': 7,
    'color': 8,
    'token': 9
};

const getVar = (alias) => window[variableAliases[alias]],
    setVar = (alias, value) => window[variableAliases[alias]] = value,
    setObjProp = (alias, property, value) => window[variableAliases[alias]][prop] = value,
    combat = {
        attackOrSupport: (strength = combat.getStrenght(), player) => dL.a24(strength, player),
        attackNeutral: (strength = combat.getStrenght()) => dL.a24(strength, getVar('playerId')),
        getStrenght: () => cm.xq(),
        getBorderSize: (player) => getVar('nationBorders')[player].length,
        getBorderingNations: (player) => null,
    },
    cookies = {
        get: (key) => d3.zq(cookieAliases[key]),
        set: (key, value) => d3.zq(cookieAliases[key], value)
    },
    camera = {
        moveToPlayer: (player) => cd.wL(player, 1800, false, 0) 
    },
    chat = {
        // name/clan = string
        winFFA: (name) => ci.ws(name),
        winTDM: (clan) => ci.wy(clan),
        //players = array[number 0-511]
        //target = number 0-511
        askAttack: (players, target) => ci.wz(players, target)
    },
    misc = {
        mouseClick: (x, y) => q6(Math.floor(x), Math.floor(y))
    }

//The api with the functions.
TioModLoaderAPI = {
    variableAliases,
    varWatcher: new EventEmitter(),
    getVar,
    setVar,
    setObjProp,
    camera,
    combat,
    cookies,
    chat,
    misc
};

//If a variable is an object and it hasnt been proxified yet, then proxify it.
function ___proxifyVariables() {
    for (variable of Object.keys(variableAliases)) {

        //Filter out non-objects and already proxified objects.
        if (typeof window[variable] !== 'object' || ___proxified.includes(variable)) continue;

        //This just works.
        window[variable] = new Proxy(window[variable], {
            set(object, property, value) {
                TioModLoader.varWatcher.emit(variable, property, value);
                object[property] = value;
            }
        });

        //We don't need to proxify a proxy, right?
        ___proxified.push(variable);
    }
}

//Every second, proxify variables that have recently turned into objects.
//TODO: This is dumb. Add some flags so it stops checking if all proxifiable variables have been proxified.
setInterval(___proxifyVariables, 1000);

/*
    END: TioModLoader API
*/

//___mod: {code: String, name: String, author: String, description: String, enabled: Boolean}
for (___mod of ___mods) {
    if (!___mod.enabled) continue;
    console.log(___logHeader + 'Loading mod: ' + ___mod.name);
    try {
        eval('(async function(){' + ___mod.code + '})()');
    } catch (err) {
        console.log(___logHeader + `Mod Error [${___mod.name}]: ` + err.message);
    }
}

/*
    Everything past this point:
    Load the Mod Manager UI.
*/

//Prepares an array and dictionary used for later and injects a style sheet.
let ___modMgrListElements = [],
    ___modMgrElementDict = {},
    ___buttonColors = {off: '#A9564A', on: '#0E5B0E'},
    ___styleSheet = document.createElement("style");
//This CSS Styleshit is the mother of all jank.
___styleSheet.innerText = '#TioModLoader_toggleMgr{border:solid;border-color:#FFFFFF;border-width:3px;color:green;padding:25px 25px;cursor:default;z-index:6;position:fixed;top:20%;right:0.83%}#TioModLoader_menu{border:3px solid #fff;background-color:#000;opacity:95%;z-index:1;position:fixed;top:25%;left:40%;width:20%;height:40%}#TioModLoader_modList::-webkit-scrollbar{display:none}#TioModLoader_modList{z-index:1;position:absolute;width:100%;top:12%;height:68%;overflow:auto;-ms-overflow-style:none;scrollbar-width:none}#TioModLoader_menuHeader{position:absolute;width:100%;height:10%;color:#fff;background-color:#212121;text-align:center;vertical-align:center;font-size:1.5vw}#TioModLoader_modImport{z-index:1;position:absolute;width:100%;height:20%;bottom:0}#TioModLoader_modImportBox{text-align:left;background-color:rgba(0,0,0,.6);border:0;outline:3px solid white;color:#fff;position:absolute;font:bold 19px Arial;width:70%;height:50%;left:3%;bottom:15%}#TioModLoader_modImportConfirm{position:absolute;right:3%;bottom:15%;height:50%;width:20%;outline:3px solid #FFFFFF}#TioModLoader_modName{position:relative;margin:auto;width:90%;font-size:1vw;color:#fff;z-index:1;min-height:20%;overflow:hidden}#TioModLoader_modListEntry{left:5%;margin:auto;width:70%;font-size:1vw;color:#fff;text-align:center;overflow:hidden}#TioModLoader_modToggle{position:absolute;height:70%;right:5%;top:15%;width:12.5%;outline:3px solid white}';
document.head.appendChild(___styleSheet);

//Gives info about a mod.
function ___viewModDescription(i) {
    //TODO: Mod description UI of ___mods[i].description
}

function ___saveMods() {
    localStorage.setItem('TioModLoader_mods', JSON.stringify(___mods));
}

//Toggles a mod, requires restart.
function ___toggleMod(i) {
    ___mods[i].enabled = !___mods[i].enabled;
    ___modMgrListElements[i].toggleButton.style['background-color'] = ___mods[i].enabled ? ___buttonColors.on : ___buttonColors.off;
    ___saveMods();
}

//Creates the list of elements that is shown in TioModLoader_modList.
function ___createModList() {

    //If there is a list present, eliminate everything in it.
    if (___modMgrListElements) {
        for (entry of ___modMgrListElements) {
            entry.entry.remove();
            entry.toggleButton.remove();
            entry.name.remove();
        }
        ___modMgrListElements = [];
    }

    //Get the visual things from the mods and turn them into a list of elements.
    for (modIndex in ___mods) {
        let entry = document.createElement('div'),
            button = document.createElement('div'),
            text = document.createElement('p');

        button.onclick = () => ___toggleMod(modIndex);
        button.style['background-color'] = ___mods[modIndex].enabled ? ___buttonColors.on : ___buttonColors.off;
        text.innerText = ___mods[modIndex].name;

        entry.id = 'TioModLoader_modListEntry';
        button.id = 'TioModLoader_modToggle';
        text.id = 'TioModLoader_modName';

        entry.appendChild(button);
        entry.appendChild(text);

        ___modMgrListElements.push({
            entry: entry,
            toggleButton: button,
            name: text
        });
    }

    //Show the list in the mod menu.
    for (entry of ___modMgrListElements) ___modMgrElementDict.modList.appendChild(entry.entry);
}

//Add the mod menu elements to the element dictionary.
let ___loadThoseElements = [
    {prop: 'toggleMgr', tag: 'div'},
    {prop: 'menu', tag: 'div'},
    {prop: 'menuHeader', tag: 'div'},
    {prop: 'modList', tag: 'div'},
    {prop: 'modImport', tag: 'div'},
    {prop: 'modImportBox', tag: 'input'},
    {prop: 'modImportConfirm', tag: 'div'}
]
for (elem of ___loadThoseElements) {
    ___modMgrElementDict[elem.prop] = document.createElement(elem.tag);
    ___modMgrElementDict[elem.prop].id = 'TioModLoader_' + elem.prop;
}

//Manager toggle button.
___modMgrElementDict.toggleMgr.style['background-color'] = ___buttonColors.off;
___modMgrElementDict.toggleMgr.onclick = () => {
    ___modMgrElementDict.menu.hidden = !___modMgrElementDict.menu.hidden
    ___modMgrElementDict.toggleMgr.style['background-color'] = ___modMgrElementDict.menu.hidden ? ___buttonColors.off : ___buttonColors.on;
};

//Mod import button.
___modMgrElementDict.modImportConfirm.style['background-color'] = ___buttonColors.on;
___modMgrElementDict.modImportConfirm.onclick = () => {
    try {
        ___mods.push(JSON.parse(___modMgrElementDict.modImportBox.value));
        ___createModList();
        ___saveMods();
    } catch (err) {
        console.log(___modMgrElementDict.modImportBox.value);
        console.error(err);
        ___modMgrElementDict.modImportBox.value = 'Not a valid mod file!';
    }
}

//Some attribute setting.
___modMgrElementDict.menu.hidden = true;
___modMgrElementDict.modImportBox.type = 'text';
___modMgrElementDict.menuHeader.innerText = 'Territorial.io Mod Loader';

//Render the mod list.
___createModList();

//Building the ui together.
___modMgrElementDict.modImport.appendChild(___modMgrElementDict.modImportBox);
___modMgrElementDict.modImport.appendChild(___modMgrElementDict.modImportConfirm);
___modMgrElementDict.menu.appendChild(___modMgrElementDict.modImport);
___modMgrElementDict.menu.appendChild(___modMgrElementDict.modList);
___modMgrElementDict.menu.appendChild(___modMgrElementDict.menuHeader);

//Make the menu close if the user presses outside of it.
for (child of document.body.children) child.addEventListener("click", () => ___modMgrElementDict.menu.hidden = true);

//Last two appendings and we are done.
document.body.appendChild(___modMgrElementDict.toggleMgr);
document.body.appendChild(___modMgrElementDict.menu);

//Add the suffix to indicate that the mod loader has worked.
TioModLoaderAPI.setVar('gameVersion', TioModLoaderAPI.getVar('gameVersion') + '   Modded');
