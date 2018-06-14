/* This will make it easy to get site settings if set. */
site_settings = my_settings["localhost"];

/* 
	This is a function which will be used to determine if the current script is trying to be loaded twice by the manager.
	To ensure that the siteID's are unique, please use this format:
	Identifier.UserName@SiteUrl
	The number is optional but may be needed if you make multiple repos which may contain the same site.
	Also you can use logic in the siteID to return different id's based off of the current url (aka if you are in a specific subdir)
*/
function siteID() {
	return "ThaumicMekanism@localhost";
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
	alert("IVE LOADED!!!!");
}
