javascript:(function(){
	fastReload = true;
	function bmklt() {
		my_repos = [
			/*{{repos}}*/
			["ThaumicMekanism's Repo", "https://thaumicmekanism.github.io/Unimarklet/repo/", "../bookmarklets_repo.js", true, true],
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
		script.setAttribute("src", "https://thaumicmekanism.github.io/Unimarklet/bookmarklets_manager.js");
		document.getElementsByTagName("head")[0].appendChild(script);
	}
	bmklt();
})();