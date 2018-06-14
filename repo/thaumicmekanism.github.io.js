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
	if (window.location.pathname == "/Unimarklet/") {
		identifier = "Unimarklet.";
	}
	return identifier + "ThaumicMekanism@thaumicmekanism.github.io";
}

/*
	This function will tell the version of the bookmarklet. This may be used to determine if the script should be ran.
*/
function siteVersion() {
	if (window.location.pathname == "/Unimarklet/") {
		return "1.0.0";
	}
	return "1.0.0";
}

/*
	This function will return a set with different id's which are known to be incompatable with this script.
*/
function incompatableScripts() {
	var incompSet = new Set([
		"Test.ThaumicMekanism@thaumicmekanism.github.io"
	]);
	return incompSet;
}

/* 
	You should ALWAYS make sure you put the custom code in the main funciton. DO NOT CALL THE MAIN FUNCTION ON YOUR OWN! 
	At this point, you may load any script you want to inside the main function. 
	I recommend using loadScript if you want to do so.
	Ex. loadScript(scriptURL, onFailFunction, onLoadFunction)
*/
function main() {
	if (window.location.pathname == "/Unimarklet/") {
		alert("This is displayed iff in the baseurl and sub dir.");
	} else {
		settingExists(site_settings, "message", true);
		alert("This is just a test script and example! " + site_settings.message);
	}
}
