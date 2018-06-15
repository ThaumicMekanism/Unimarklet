/*
	This is the repo script. Please do not make any custom funciton or function calls. 
	If you wan to do that, please put that in the repo_fn so that the main script can call it if the user wants to run your custom script.

	The names of the current 5 declared things must be the same or the manager will not work!
*/

// This must be the same or higher than the bookmark manager version. This will be used to detect if the repo may become incompatable with 
repo_ubmVersion = "1.0.0";

//This should contain all of the sites which your repo has.
repo_sites = [
	new Site("localhost"),
	new Site("thaumicmekanism.github.io"),
	new Site("my.dogechain.info"),
	new Site("auth.berkeley.edu"),
];

//This is where you can add custom settings for the repo which may influence the bookmarlets manager;
repo_settings = new Repo_Settings("My repo");
repo_settings.version = "1.0.0";

//This funciton is ran if the user decides to set it in the repo
function repo_fn() {
	console.log("Loaded my repo! Heres my custom script!");
}


//This must be the last line in your repo file otherwise it will break!
ubm_loaded = true;