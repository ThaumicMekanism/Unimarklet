/* This is the version of the bookmarklets_manager which this script is written for. This is needed to confirm formatting. */
site_ubmVersion = "1.0.0";
/* This will make it easy to get site settings if set. */
site_settings = my_settings["auth.berkeley.edu"];

/* 
	This is a function which will be used to determine if the current script is trying to be loaded twice by the manager.
	To ensure that the siteID's are unique, please use this format:
	Identifier.UserName@SiteUrl
	The number is optional but may be needed if you make multiple repos which may contain the same site.
	Also you can use logic in the siteID to return different id's based off of the current url (aka if you are in a specific subdir)
*/
function siteID() {
	return "ThaumicMekanism@auth.berkeley.edu";
}

/*
	This function will tell the version of the bookmarklet. This may be used to determine if the script should be ran.
*/
function siteVersion() {
	return "1.0.0";
}

/*
	This function will return a set with different id's which are known to be incompatable with this script.
*/
function incompatableScripts() {
	return new Set([
		
	]);
}

/* 
	You should ALWAYS make sure you put the custom code in the main funciton. DO NOT CALL THE MAIN FUNCTION ON YOUR OWN! 
	At this point, you may load any script you want to inside the main function. 
	I recommend using loadScript if you want to do so.
	Ex. loadScript(scriptURL, onFailFunction, onLoadFunction)
*/
function main() {
	function checkToSubmit() {
	    if (document.getElementById("password").value !== "" && document.getElementById("username") !== "") {
	        document.getElementsByName("submit")[0].click();
	    } else {
	        setTimeout(function(){checkToSubmit();}, 5000);
	    }
	}
	checkToSubmit();
}
