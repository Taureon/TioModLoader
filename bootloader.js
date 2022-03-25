/*
CONVENTION:

Every variable in global scope that is used by TioModLoader needs to be prefixed with triple underscores!
*/

javascript:(async function(){

    let ___logHeader = '[TioModLoader] Bootloader: ',
        ___textDecoder = new TextDecoder();
    
    //domain check
    if (!location.host.endsWith('territorial.io')) return alert(___logHeader + 'Error: Invalid Domain');

    try {
        console.log(___logHeader + 'Started.');
        let ___storedCode = localStorage.getItem('TioModLoader_main');

        //fetch a string from the server
        function ___fetch(path, options) {
            return new Promise((Resolve, Reject) => {
                fetch('https://example.com/' + path, options)
                .then(res => res.arrayBuffer())
                .then(res => Resolve(___textDecoder.decode(new Uint8Array(res))))
                .catch(Reject)
            });
        }

        //updates the main mod loader
        async function ___update() {

            //should return: '{lastUpdateCheck: date, version: 'version', code: 'code'}'
            ___storedCode = JSON.parse(await ___fetch('code'));

            ___storedCode.lastUpdateCheck = Date.now();
            console.log(___logHeader + 'Updated. Version: ' + ___storedCode.version);
        }

        //if this is the first time that this bookmark has been run
        if (___storedCode) {
            console.log(___logHeader + 'TioModLoader_main not set in LocalStorage, fetching...');
            await ___update();
        } else {
            ___storedCode = JSON.parse(___storedCode);
        }

        //check if up to date
        if (___storedCode.lastUpdateCheck + 86400000 < Date.now()) {

            //it has been a day, check if the modloader is up to date
            if (___storedCode.version !== await ___fetch('version')) {
                console.log(___logHeader + 'Version not up to date, updating...');
                await ___update();
            }

            //check version tomorrow
            ___storedCode.lastUpdateCheck = Date.now();
            localStorage.setItem('TioModLoader_main', JSON.stringify(___storedCode));
        }

        //we are done, time to run the main thing
        console.log(___logHeader + 'Everything done, starting TioModLoader...');
        eval(___storedCode.code);

    //if an error happened, make an alert about it
    } catch (err) {
        alert(___logHeader + 'Error: ' + err.message);
    }
})();
