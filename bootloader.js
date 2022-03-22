//this is the file that gets minified and put on the download page
javascript:(async function(){

	let logHeader = '[TioModLoader] Bootloader: ',
		textDecoder = new TextDecoder();
	
	//domain check
    if (!location.host.endsWith('territorial.io')) return alert(logHeader + 'Error: Invalid Domain');

	try {
		console.log(logHeader + 'Started.');
		let storedCode = localStorage.getItem('TioModLoader_main');

		//fetch a string from the server
		function stringFetch(path, options) {
			return new Promise((Resolve, Reject) => {
				fetch('https://example.com/' + path, options)
				.then(res => res.arrayBuffer())
				.then(res => Resolve(textDecoder.decode(new Uint8Array(res))))
				.catch(Reject)
			});
		}

		//updates the main mod loader
		async function update() {

			//should return: '{version: 'version', code: 'code'}'
			storedCode = JSON.parse(await stringFetch('code'));

			storedCode.lastUpdateCheck = Date.now();
			console.log(logHeader + 'Updated. Version: ' + storedCode.version);
		}

		//if this is the first time that this bookmark has been run
		if (storedCode) {
			console.log(logHeader + 'TioModLoader_main not set in LocalStorage, fetching...');
			await update();
		} else {
			storedCode = JSON.parse(storedCode);
		}

		//check if up to date
		if (storedCode.lastUpdateCheck + 86400000 < Date.now()) {

			//it has been a day, check if the modloader is up to date
			if (storedCode.version !== await stringFetch('version')) {
				console.log(logHeader + 'Version not up to date, updating...');
				await update();
			}

			//check version tomorrow
			storedCode.lastUpdateCheck = Date.now();
			localStorage.setItem('TioModLoader_main', JSON.stringify(storedCode));
		}

		//we are done, time to run the main thing
		console.log(logHeader + 'Everything done, starting TioModLoader...');
		eval(storedCode.code);

	//if an error happened, make an alert about it
	} catch (err) {
		alert(logHeader + 'Error: ' + err.message);
	}
})();
