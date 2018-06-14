//This is the current version of the bookmarklet manager.
ubm_version = "1.0.0";
//This is the version of the bookmark manager when the respective format changed. This is used to detect if the client, repo, or site is using legacy formatting.
ubm_clientFormatVersion = "1.0.0";
ubm_repoFormatVersion = "1.0.0";
ubm_siteFormatVersion = "1.0.0";
//This is used to confirm that the client has a version.
function checkCompatability() {
	if (typeof my_ubmVersion !== "string") {
		var s = "The bookmarklet does not have a setting! Please make sure yours has one!";
		alert(s);
		throw s;
	}
	if (versionCompare(my_ubmVersion, ubm_clientFormatVersion) == -1) { /*aka is the my_ubmVersion less than ubm_clientFormatVersion*/
		var s = "The client has an older version 'v" + my_ubmVersion + "' than is compatable with the bookarklet manager 'v" + ubm_clientFormatVersion + "'! Because of this, the script will not load until you update your bookmarklet. Possibly will add the ability to redirect to the main site and then update it for you.";
		alert(s);
		throw s;
	}
	if (typeof repos !== "undefined") {
		console.log("Reloading script!");
	}
	if (typeof my_settings !== "object") {
		console.warn("The settings object was not found or is not an object!");
		settings = {};
	}
}
checkCompatability();
//Settings
/*
	repos is all of the bookmarklet repos.`
	Each Repo class contains the following items (In same order):
	Name (str): This is the name of the repo
	Base Url (str): This is the base url to the bookmarklets.
	Repo Info (str) [Default: 'bookmarklets_repo.js']: This file contains all the scripts.
	Repo Fn (bool): If true, will also run the custom script on the repo. Only do this if you trust the repo.
	Check Regardless (bool): This will make this repo get checked to load the script regardless of if it is in the database.

*/
function ubm_main(loadr) {
	checkCompatability();
	if (loadr || true) {
		if(typeof my_repos === "undefined") {
			alert("Please make sure you have defined 'my_repos' correctly!");
			throw "[ERROR]: Haulting script!";
		}
		repos = [
			new Repo("ThaumicMekanism's Repo", "https://thaumicmekanism.github.io/Unimarklet/repo/", "../bookmarklets_repo.js", true, false),
		];
		for (var i = 0; i < my_repos.length; i++) {
			r = my_repos[i];
			for (var j = repos.length - 1; j >= 0; j--) {
				if (r[1] == repos[j].baseurl && r[2] == repos[j].repojs) {
					r = null;
				}
			}
			if (r) {
				repos.push(new Repo(r[0], r[1], r[2], r[3], r[4]));
			}
		}
		loadRepos();
	} else {
		finish_load();
	}
}

//--------- Helper functions ----------
/*
	This is the format for the 
*/
Repo = class Repo {
	constructor(name, baseurl, repojs, repofn, alwayscheck) {
		this.name = name;
	    this.baseurl = baseurl;
	    if (repojs == ""){
	    	this.repojs = "bookmarklets_repo.js";
	    } else {
	    	this.repojs = repojs;
	    }
	    this.repofn = repofn;
	    this.alwayscheck = alwayscheck;
	}
}

/*
	This is for the repo to add a site.
*/
Site = class Site {
	constructor(hostname) {
		this.hostname = hostname;
		//The urlid uses the base url as a key and the uid as the value.
		this.urlID = {};
	}

	add(baseurl, uid) {
		this.urlID[baseurl] = uid;
	}

	merge(site) {
		let keys = site.getKeys();
		for (let i in keys) {
			i = keys[i];
			this.add(i, site.getID(i));
		}
	}

	getID(baseurl) {
		return this.urlID[baseurl];
	}

	getKeys() {
		return Object.keys(this.urlID);
	}

	remove(baseurl) {
		return delete this.urlID[baseurl];
	}

}

/*
	This is for repos to have custom settings
*/
Repo_Settings = class Repo_Settings {
	constructor(name, version){
		this.name = name;
		this.version = version;
	}
}

/**
 * Compares two software version numbers (e.g. "1.7.1" or "1.2b").
 *
 * @param {string} v1 The first version to be compared.
 * @param {string} v2 The second version to be compared.
 * @param {object} [options] Optional flags that affect comparison behavior:
 * <ul>
 *     <li>
 *         <tt>lexicographical: true</tt> compares each part of the version strings lexicographically instead of
 *         naturally; this allows suffixes such as "b" or "dev" but will cause "1.10" to be considered smaller than
 *         "1.2".
 *     </li>
 *     <li>
 *         <tt>zeroExtend: true</tt> changes the result if one version string has less parts than the other. In
 *         this case the shorter string will be padded with "zero" parts instead of being considered smaller.
 *     </li>
 * </ul>
 * @returns {number|NaN}
 * <ul>
 *    <li>0 if the versions are equal</li>
 *    <li>a negative integer iff v1 < v2</li>
 *    <li>a positive integer iff v1 > v2</li>
 *    <li>NaN if either version string is in the wrong format</li>
 * </ul>
 */

function versionCompare(v1, v2, options) {
	if (v1 == "equal" || v2 == "equal") {
		return 0;
	}
	if (v1 == null || v2 == null) {
		return NaN;
	}

    var lexicographical = options && options.lexicographical,
        zeroExtend = options && options.zeroExtend,
        v1parts = v1.split('.'),
        v2parts = v2.split('.');

    function isValidPart(x) {
        return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
    }

    if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
        return NaN;
    }

    if (zeroExtend) {
        while (v1parts.length < v2parts.length) v1parts.push("0");
        while (v2parts.length < v1parts.length) v2parts.push("0");
    }

    if (!lexicographical) {
        v1parts = v1parts.map(Number);
        v2parts = v2parts.map(Number);
    }

    for (var i = 0; i < v1parts.length; ++i) {
        if (v2parts.length == i) {
            return 1;
        }

        if (v1parts[i] == v2parts[i]) {
            continue;
        }
        else if (v1parts[i] > v2parts[i]) {
            return 1;
        }
        else {
            return -1;
        }
    }

    if (v1parts.length != v2parts.length) {
        return -1;
    }

    return 0;
}

/*
	This is what runs if the script fails.
*/
function scriptfail(element, fn) {
	//console.log("Failed to load element:");
	//console.log(element);
	fn();
}

/*
	Make script tag and load it to page
*/
function loadScript(url, onfail, onload) {
	var script = document.createElement('script');
	script.setAttribute("onerror", onfail);
	script.setAttribute("onload", onload);
	script.setAttribute("src", url);
	script.setAttribute("id", url);
	var urlelm = document.getElementById(url);
	if (urlelm) {
		urlelm.parentNode.removeChild(urlelm)
	}
	document.getElementsByTagName("head")[0].appendChild(script);
}

/*
	Confirms that a setting is in there. If not, it will help you generate it.
*/
function settingExists(siteSettings, setting, required) {
	if (siteSettings && setting in siteSettings){
		return true;
	} else {
		alert("The setting '" + setting + "' does not exist in your settings for this site or you do not have settings for this site. In the future, there will be added functionality to be easily able to add settings.");
		if (required) {
			throw "The setting '" + setting + "' is required! Make sure it is in the client (your bookmarklet) before rerunning this script.";
		}
		return false;
	}
}

//-------- END Helper functions -------

//Load Repos info
function loadRepos() {
	ubm_db = {};
	ubm_alwayscheck = [];
	ubm_i = repos.length;
	ubm_loaded = true;
	ubm_lfailed = false;
	repo_sites = {};
	repo_ubmVersion = "equal";
	function repo_fn(){}
	r = null;
	ubm_interval = setInterval(function(){
		if (ubm_loaded) {
			ubm_loaded = false;
			if (ubm_lfailed) {
				console.log("Could not load repo: " + ubm_lfailed);
				ubm_lfailed = false;
			} else  if (versionCompare(repo_ubmVersion, ubm_repoFormatVersion) == -1) {
				console.warn("The repo '" + r.name + `' is running an outdated format which is not compatable with this version of the bookmarklet manager. If you are the repo manager, please update your repos format and version. If you are just a user, please contac the repo manager to update their repo.
					\n\nThe repo '` + r.name + "' will be ignored until it is updated. (Unless always check is active)");
			} else {
				for (var ubm_j = 0; ubm_j < repo_sites.length; ubm_j++) {
					var site = repo_sites[ubm_j];
					site.add(r.baseurl, "");
					if (site.hostname in ubm_db) {
						ubm_db[site.hostname].merge(site);
					} else {
						ubm_db[site.hostname] = site;
					}
				}
				if (r && r.repofn) {
					repo_fn();
				}
			}
			ubm_i--;
			if (ubm_i < 0) {
				clearInterval(ubm_interval);
				finish_load();
				return;
			}
			r = repos[ubm_i];
			repo_sites = {};
			loadScript(r.baseurl + r.repojs, `scriptfail(this, function(){ubm_loaded = true; ubm_lfailed = "` + r.name + `";})` ,``);
			if (r.alwayscheck) {
				ubm_alwayscheck.push(r);
			}
		}
	}, 5);
}
//TODO Make capable of running multiple items in db.
function finish_load(){
	window.ubm_loadedids = {};
	window.ubm_incompScripts = new Set([]);
	//Get current url
	var thisurl = new URL(window.location.href);
	var hostname = thisurl.hostname;
	var s = ubm_db[hostname];
	if (s) {
		var keys = s.getKeys();
		for (let baseurl of keys) {
			loadScript(baseurl + hostname + ".js", `scriptfail(this, function(){console.log('Could not load script from site: ` + baseurl + `!')})`, `exeScript(\`` + baseurl + `\`, function(){loadAlwaysCheck(0, "` + baseurl + `");})`);
		}
	} else {
		loadAlwaysCheck(0, hostname);
	}
}
 
function loadAlwaysCheck(id, baseurl) {
	if (id >= ubm_alwayscheck.length) {
		return;
	}
	var r = ubm_alwayscheck[id];
	if(r.baseurl !== baseurl) {
		loadScript(r.baseurl + window.location.hostname + ".js", `scriptfail(this, function(){console.log('Could not load script from site: ` + r.baseurl + `!'); loadAlwaysCheck(` + (id + 1) + `);})`, `exeScript(\`` + baseurl + `\`, function(){loadAlwaysCheck(` + (id + 1) + `);});`);
	}
}
//TODO Add better tracking abilities to see which scripts are incompatable which which..
function exeScript(baseurl, callback) {
	if (versionCompare(site_ubmVersion, ubm_siteFormatVersion) != -1) {
		var uid = siteID();
		ubm_db[window.location.hostname].add(baseurl, uid);
		if (!ubm_loadedids[uid]){
			if (!ubm_incompScripts.has(uid)) {
				setTimeout(function(){
					main();
				}, 0);
				is = incompatableScripts()
				if (typeof is === "object") {
					is.forEach(function(v1, v2, set){
						ubm_incompScripts.add(v1);
					});
				}
				window.ubm_loadedids[uid] = true;
			} else {
				alert("Could not run '" + uid + "' because it is incompatable with another script which was run before this one.");
			}
		} else {
			console.log("Script with same siteID has already been loaded!");
		}
	} else {
		var uid = siteID();
		console.warn("Sorry but the script for the site with unique identifier '" + uid + "' is not up to date with the current format. Because of this, the script could not be loaded. Please contact the owner to update the script to the current compatable version.");
	}

	if (typeof callback === "function") {
		callback();
	}
}

ubm_main(true);