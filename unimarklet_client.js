javascript:(function(){
	fastReload = true;
	function bmklt() {
		my_ubmVersion = "1.0.0";
		/*Repos have the current format of [Repo Name, Repo Url, Repo file, run Repo function, Check repo dir regardless of if baseurl is in the repo.]*/
		my_repos = [
			/*{{repos}}*/
			["ThaumicMekanism's Repo", "http://localhost/ThaumicMekanism%20Web%20Site/Unimarklet/repo/", "../bookmarklets_repo.js", true, true],
		];
		my_settings = {
			/*{{settings}}*/
			"thaumicmekanism.github.io":{
				message: "I'm a custom setting!",
			},
		};
		if (fastReload && typeof ubm_main == "function") {
			ubm_main(false);
			return;
		}
		var script = document.createElement('script');
		var managerURL = "http://localhost/ThaumicMekanism%20Web%20Site/Unimarklet/bookmarklets_manager.js";
		script.setAttribute("onerror", "if(confirm('Unimarklet could not load the core script! Do you want to go to the Unimarklet site to check what is wrong?')){window.location = 'https://thaumicmekanism.github.io/Unimarklet/';}");
		var urlelm = document.getElementById(managerURL);
		if (urlelm) {
			urlelm.parentNode.removeChild(urlelm)
		}
		script.setAttribute("src", managerURL);
		script.setAttribute("id", managerURL);
		document.getElementsByTagName("head")[0].appendChild(script);
	}
	setTimeout(function(){
		bmklt();
	}, 0);
})();