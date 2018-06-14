// This script will load a script if it detects that the page has some custom script to load.
ubm_version = "1.0.0";
if (typeof my_version !== "string") {
	var s = "The bookmarklet does not have a setting! Please make sure yours has one!";
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
	if (typeof my_version !== "string") {
		var s = "The bookmarklet does not have a setting! Please make sure yours has one!";
		alert(s);
		throw s;
	}
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
				if (r[1] == repos[j].baseurl) {
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
		this.baseurl = "";
		this.uid = "";
	}
}

/*
	This is for repos to have custom settings
*/
Repo_Settings = class Repo_Settings {
	constructor(name){
		this.name = name;
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
	Concat Dictionaries
*/
function extend(obj, src) {
    for (var key in src) {
        if (src.hasOwnProperty(key)) obj[key] = src[key];
    }
    return obj;
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
	function repo_fn(){}
	r = null;
	ubm_interval = setInterval(function(){
		if (ubm_loaded) {
			ubm_loaded = false;
			if (ubm_lfailed) {
				console.log("Could not load repo: " + ubm_lfailed);
				ubm_lfailed = false;
			}
			for (var key in repo_sites) {
				if (repo_sites.hasOwnProperty(key)) {
					repo_sites[key].baseurl = r.baseurl;
				}
			}
			ubm_db = extend(ubm_db, repo_sites);
			if (r && r.repofn) {
				repo_fn();
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

function finish_load(){
	window.ubm_loadedids = {};
	//Get current url
	var thisurl = new URL(window.location.href);
	var hostname = thisurl.hostname;
	var s = ubm_db[hostname];
	if (s) {
		loadScript(s.baseurl + hostname + ".js", `scriptfail(this, function(){console.log('Could not load script from site: ` + s.baseurl + `!')})`, `exeScript(function(){})`);
	}

	// This will load any scripts which do not exist in the database but the repo has always checking. I do not recommend this.
	loadAlwaysCheck(0);
}
function loadAlwaysCheck(id) {
	if (id >= ubm_alwayscheck.length) {
		return;
	}
	var r = ubm_alwayscheck[id];
	if(r.baseurl !== window.location.hostname) {
		loadScript(r.baseurl + window.location.hostname + ".js", `scriptfail(this, function(){console.log('Could not load script from site: ` + r.baseurl + `!'); loadAlwaysCheck(` + (id + 1) + `);})`, `exeScript(function(){loadAlwaysCheck(` + (id + 1) + `);});`);
	}
}

function exeScript(callback) {
	var uid = siteID();
	if (!ubm_loadedids[uid]){
		main();
		window.ubm_loadedids[uid] = true;
	} else {
		console.log("Scrite with same siteID has already been loaded!");
	}

	if (typeof callback === "function") {
		callback();
	}
}

ubm_main(true);