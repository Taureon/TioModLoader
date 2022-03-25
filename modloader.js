let ___mods = JSON.parse(localStorage.getItem('TioModLoader_mods'));
___logHeader = '[TioModLoader] ';
kc += '   Modded';

if (___mods === null) {
    localStorage.setItem('TioModLoader_mods', '[]');
    ___mods = [];
}

//Very basic api to deobfuscate some variable names.
const variableAliases = {
    'nationNames': 'kJ',
    'nationBalances': 'kR',
    'nationSizes': 'kP',
    'nationCount': 'c9',
    'playerCount': 'c5',
    'isSingleplayer': 'cC',
    'mainCanvas': 'ka',
    'mainCanvasContext': 'kb',
    'webSockets': 'dH'
},
TioModLoaderAPI = {
    variableAliases,
    getValue: (alias) => window[variableAliases[alias]],
    setValue: (alias, value) => window[variableAliases[alias]] = value,
    setObjectProperty: (alias, property, value) => window[variableAliases[alias]][property] = value
};

//___mod: {code: String, name: String, author: String, description: String, enabled: Boolean}
for (___mod of ___mods) {
    ___mod.name = ___mod.name || 'UNKNOWN MOD';
    if (___mod.enabled) {
        console.log(___logHeader + 'Loading mod: ' + ___mod.name);
        try {
            eval('(async function(){' + ___mod.code + '})()');
        } catch (err) {
            console.log(___logHeader + `Mod Error [${___mod.name}]: ` + err.message);
        }
    }
}

/* Everything past this point: Load the Mod Manager UI. */

//Prepares an array and dictionary used for later and injects a style sheet.
let ___modMgrListElements = [],
    ___modMgrElementDict = {},
    ___buttonColors = {off: '#A9564A', on: '#0E5B0E'},
    ___styleSheet = document.createElement("style");
___styleSheet.innerText = '#TioModLoader_toggleMgr{border:solid;border-color:#FFFFFF;border-width:3px;color:green;padding:25px 25px;cursor:default;z-index:6;position:fixed;top:20%;right:0.83%}#TioModLoader_menu{border:3px solid #fff;background-color:#000;opacity:95%;z-index:1;position:fixed;top:25%;left:40%;width:20%;height:40%}#TioModLoader_modList::-webkit-scrollbar{display:none}#TioModLoader_modList{z-index:1;position:absolute;width:100%;top:12%;height:68%;overflow:auto;-ms-overflow-style:none;scrollbar-width:none}#TioModLoader_menuHeader{position:absolute;width:100%;height:10%;color:#fff;background-color:#212121;text-align:center;vertical-align:center;font-size:1.5vw}#TioModLoader_modImport{z-index:1;position:absolute;width:100%;height:20%;bottom:0}#TioModLoader_modImportBox{text-align:center;background-color:rgba(0,0,0,.6);border:0;outline:3px solid white;color:#fff;position:absolute;font:bold 19px Arial;width:70%;height:50%;left:3%;bottom:15%}#TioModLoader_modImportConfirm{position:absolute;right:2.5%;bottom:15%;height:55.5%;width:20%;outline:3px solid #FFFFFF}#TioModLoader_modName{position:relative;margin:auto;width:90%;font-size:1vw;color:#fff;z-index:1;min-height:20%;overflow:hidden}#TioModLoader_modListEntry{position:absolute;top:50%;left:5%;-ms-transform:translateY(-50%);transform:translateY(-50%);margin:auto;width:70%;font-size:1vw;color:#fff;text-align:center;overflow:hidden}#TioModLoader_modToggle{position:absolute;height:70%;right:5%;top:15%;width:12.5%;outline:3px solid white}';
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

    //if there is a list present, eliminate everything in it.
    if (___modMgrListElements) {
        for (entry of ___modMgrListElements) {
            entry.entry.remove();
            entry.button.remove();
            entry.text.remove();
        }
        ___modMgrListElements = [];
    }

    //get the visual things from the mods and turn them into a list of elements
    for (modIndex in ___mods) {
        let entry = document.createElement('div'),
            button = document.createElement('div'),
            text = document.createElement('p');

        button.onclick = () => ___toggleMod(modIndex);
        button.style['background-color'] = ___mods[modIndex].enabled ? ___buttonColors.on : ___buttonColors.off;
        text.innerText = ___mods[modIndex].name;

        entry.id = "TioModLoader_modListEntry";
        button.id = "TioModLoader_modToggle";
        text.id = "TioModLoader_modName";

        entry.appendChild(button);
        entry.appendChild(text);

        ___modMgrListElements.push({
            entry: entry,
            toggleButton: button,
            name: text
        });
    }

    //show the list
    for (entry of ___modMgrListElements) ___modMgrElementDict.modList.appendChild(entry.entry);
}

/*
<button id="TioModLoader_toggleMgr"></button>
<div id="TioModLoader_menu">
    <div id="TioModLoader_menuHeader">Territorial.io Mod Loader</div>
    <div id="TioModLoader_modList">
        <div id="TioModLoader_modListEntry">
            <div id="TioModLoader_modToggle" onclick="___toggleMod(0)"></div>
            <p id="TioModLoader_modName" onclick="___viewModDescription(0)">Vinster's Streaming Mode</p>
        </div>
    </div>
    <div id="TioModLoader_modImport">
        <input type="text" id="TioModLoader_modImportBox">
        <button id="TioModLoader_modImportConfirm"></button>
    </div>
</div>
*/

//Add the mod menu elements to the element dictionary.
let ___loadThoseElements = [
    {prop: 'toggleMgr', tag: 'button'},
    {prop: 'menu', tag: 'div'},
    {prop: 'menuHeader', tag: 'div'},
    {prop: 'modList', tag: 'div'},
    {prop: 'modImport', tag: 'div'},
    {prop: 'modImportBox', tag: 'input'},
    {prop: 'modImportConfirm', tag: 'button'},
]
for (elem of ___loadThoseElements) {
    ___modMgrElementDict[elem.prop] = document.createElement(elem.tag);
    ___modMgrElementDict[elem.prop].id = 'TioModLoader_' + elem.prop;
}

//manager toggle button
___modMgrElementDict.toggleMgr.style['background-color'] = ___buttonColors.off;
___modMgrElementDict.toggleMgr.onclick = () => {
    ___modMgrElementDict.menu.hidden = !___modMgrElementDict.menu.hidden
    ___modMgrElementDict.toggleMgr.style['background-color'] = ___modMgrElementDict.menu.hidden ? ___buttonColors.off : ___buttonColors.on;
};

//mod import button
___modMgrElementDict.modImportConfirm.style['background-color'] = ___buttonColors.on;
___modMgrElementDict.modImportConfirm.onclick = () => {
    try {
        ___mods.push(JSON.parse(___modMgrElementDict.modImportBox.value));
        ___createModList();
        ___saveMods();
    } catch (err) {
        ___modMgrElementDict.modImportBox.value = 'Not a valid mod file!';
    }
}

//some attribute setting
___modMgrElementDict.menu.hidden = true;
___modMgrElementDict.modImportBox.type = 'text';
___modMgrElementDict.menuHeader.innerText = 'Territorial.io Mod Loader';
___createModList();

//building the ui together
___modMgrElementDict.modImport.appendChild(___modMgrElementDict.modImportBox);
___modMgrElementDict.modImport.appendChild(___modMgrElementDict.modImportConfirm);
___modMgrElementDict.menu.appendChild(___modMgrElementDict.modImport);
___modMgrElementDict.menu.appendChild(___modMgrElementDict.modList);
___modMgrElementDict.menu.appendChild(___modMgrElementDict.menuHeader);

//make the menu close if the user presses outside of it
for (child of document.body.children) child.addEventListener("click", () => ___modMgrElementDict.menu.hidden = true);

//last two appendings and we are done
document.body.appendChild(___modMgrElementDict.toggleMgr);
document.body.appendChild(___modMgrElementDict.menu);

/*
#TioModLoader_toggleMgr{border:solid;border-color:#FFFFFF;border-width:3px;color:green;padding:25px 25px;cursor:default;z-index:6;position:fixed;top:20%;right:0.83%}
#TioModLoader_menu{visibility:hidden;border:3px solid #fff;background-color:#000;opacity:95%;z-index:1;position:fixed;top:25%;left:40%;width:20%;height:40%}
#TioModLoader_modList::-webkit-scrollbar{display:none}
#TioModLoader_modList{z-index:1;position:absolute;width:100%;top:12%;height:68%;overflow:auto;-ms-overflow-style:none;scrollbar-width:none}
#TioModLoader_menuHeader{position:absolute;width:100%;height:10%;color:#fff;background-color:#212121;text-align:center;vertical-align:center;font-size:1.5vw}
#TioModLoader_modImport{z-index:1;position:absolute;width:100%;height:20%;bottom:0}
#TioModLoader_modImportBox{text-align:center;background-color:rgba(0,0,0,.6);border:0;outline:3px solid white;color:#fff;position:absolute;font:bold 19px Arial;width:70%;height:50%;left:3%;bottom:15%}
#TioModLoader_modImportConfirm{position:absolute;right:2.5%;bottom:15%;height:55.5%;width:20%;outline:3px solid #FFFFFF}
#TioModLoader_modName{position:relative;margin:auto;width:90%;font-size:1vw;color:#fff;z-index:1;min-height:20%;overflow:hidden}
#TioModLoader_modListEntry{position:absolute;top:50%;left:5%;-ms-transform:translateY(-50%);transform:translateY(-50%);margin:auto;width:70%;font-size:1vw;color:#fff;text-align:center;overflow:hidden}
#TioModLoader_modToggle{position:absolute;height:70%;right:5%;top:15%;width:12.5%;outline:3px solid white}
*/
