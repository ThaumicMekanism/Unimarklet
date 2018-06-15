ubmh_reposKey = "/*{{repos}}*/";
ubmh_settingsKey = "/*{{settings}}*/";

function addRepo(repo, text) {
	return text.replace(ubmh_reposKey, ubmh_reposKey + "\n" + repo);
}

function addSetting(setting, text) {
	return text.replace(ubmh_settingsKey, ubmh_settingsKey + "\n" + setting);
}

function parseRepo1_0_0() {
	repos = "";
	for (let repo of my_repos) {
		repos += "			[\"" + repo[0] + "\", \"" + repo[1] + "\", \"" + repo[2] + "\", " + repo[3] + ", " + repo[4] + "],";
		repos += "\n";
	}
	return repos.substring(0, repos.length - 1);
}

function parseSetting1_0_0() {
	return;
}

function updateMarklet() {
	code = document.getElementById("b").innerHTML;
	if (my_ubmVersion == "1.0.0") {
		code = addRepo(parseRepo1_0_0(), code);
		//code = addSetting(parseSetting1_0_0(), code);
	}
	document.getElementById("b").innerHTML = code;
}