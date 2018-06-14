/* This will make it easy to get site settings if set. */
site_settings = my_settings["my.dogechain.info"];

/* 
	This is a function which will be used to determine if the current script is trying to be loaded twice by the manager.
	To ensure that the siteID's are unique, please use this format:
	Identifier.UserName@SiteUrl
	The number is optional but may be needed if you make multiple repos which may contain the same site.
	Also you can use logic in the siteID to return different id's based off of the current url (aka if you are in a specific subdir)
*/
function siteID() {
	return "ThaumicMekanism@my.dogechain.info";
}

/*
	This function will tell the version of the bookmarklet. This may be used to determine if the script should be ran.
*/
function siteVersion() {
	return "1.0.0";
}


/* 
	You should ALWAYS make sure you put the custom code in the main funciton. DO NOT CALL THE MAIN FUNCTION ON YOUR OWN! 
	At this point, you may load any script you want to inside the main function. 
	I recommend using loadScript if you want to do so.
	Ex. loadScript(scriptURL, onFailFunction, onLoadFunction)
*/
function main() {
	var btns = document.getElementsByTagName("button");
	var naddr = null;
	for (var i = 0; i < btns.length; i++) {
		if (btns[i].getAttribute("ng-click") == "createNewAddress()") {			
			naddr = btns[i];
			console.log(naddr);
	    }
	}
	naddr.disabled = false;
	var mdc_i = 0;
	function makeWallets(numwallets) {	
		mdc_i++;
		naddr.click();
		console.log("Made wallet: " + mdc_i);
		if (mdc_i < numwallets) {
			setTimeout(function(){makeWallets(numwallets);}, 200);
		} else {
			console.log("Finished!");
		}
	}
	var numWal = NaN;
	while (isNaN(numWal)) {
		val = prompt("Please enter the number of wallets you want to make.");
		if (val == null) {
			return;
		}
		numWal = parseInt(val);
	}
	makeWallets(numWal);
}