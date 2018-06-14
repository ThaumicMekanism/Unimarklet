javascript:(function(){
	fastReload = true;
	function bmklt() {
		my_version = "1.0.0";
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
		script.setAttribute("onerror", "alert('Unimarklet could not load the main manager script!')");
		var managerURL = "http://localhost/ThaumicMekanism%20Web%20Site/Unimarklet/bookmarklets_manager.js";
		var urlelm = document.getElementById(managerURL);
		if (urlelm) {
			urlelm.parentNode.removeChild(urlelm)
		}
		script.setAttribute("src", managerURL);
		script.setAttribute("id", managerURL);
		document.getElementsByTagName("head")[0].appendChild(script);
	}
	bmklt();
})();