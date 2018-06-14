/* This will make it easy to get site settings if set. */
site_settings = my_settings["thaumicmekanism.github.io"];

/* You should ALWAYS make sure you put the custom code in the main funciton. DO NOT CALL THE MAIN FUNCTION ON YOUR OWN! */
function main() {
	if (window.location.pathname == "/Unimarklet/") {
		alert("You found a secret!");
	} else {
		alert("This is just a test script and example! " + site_settings.message);
	}
}

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