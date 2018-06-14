/* This will make it easy to get site settings if set. */
site_settings = my_settings["thaumicmekanism.github.io"];

/* 
	This is a function which will be used to determine if the current script is trying to be loaded twice by the manager.
	To ensure that the siteID's are unique, please use this format:
	Identifier.UserName@SiteUrl
	The number is optional but may be needed if you make multiple repos which may contain the same site.
	Also you can use logic in the siteID to return different id's based off of the current url (aka if you are in a specific subdir)
*/
function siteID() {
	var identifier = "";
	switch(window.location.pathname) {
		case "/Unimarklet/":
			identifier = "Unimarklet.";
			break;
		case "/venus/":
			identifier = "Venus.";
			break;
	}
	return identifier + "ThaumicMekanism@thaumicmekanism.github.io";
}

/*
	This function will tell the version of the bookmarklet. This may be used to determine if the script should be ran.
*/
function siteVersion() {
	switch(window.location.pathname) {
		case "/Unimarklet/":
			return "1.0.0";
			break;
		case "/venus/":
			return "1.0.0";
			break;
		default:
			return "1.0.0";
	}
}

/*
	This function will return a set with different id's which are known to be incompatable with this script.
*/
function incompatableScripts() {
	switch(window.location.pathname) {
		case "/Unimarklet/":
			return new Set([
				
			]);
			break;
		case "/venus/":
			return new Set([
				
			]);
			break;
		default:
			return new Set([
				
			]);
	}
}

/* 
	You should ALWAYS make sure you put the custom code in the main funciton. DO NOT CALL THE MAIN FUNCTION ON YOUR OWN! 
	At this point, you may load any script you want to inside the main function. 
	I recommend using loadScript if you want to do so.
	Ex. loadScript(scriptURL, onFailFunction, onLoadFunction)
*/
function main() {
	switch(window.location.pathname) {
		case "/Unimarklet/":
			alert("This is displayed iff in the baseurl and sub dir.");
			break;
		case "/venus/":
			loadScript("https://thaumicmekanism.github.io/Unimarklet/repo/scripts/venus.tracer.js", "", "");
			break;
		default:
			settingExists(site_settings, "message", true);
			alert("This is just a test script and example! " + site_settings.message);
	}
}
