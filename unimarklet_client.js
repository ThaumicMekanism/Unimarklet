javascript:(function(){
	function bmklt() {
		if (typeof ubm_main == "function") {
			ubm_main(false);
			return;
		}
		my_repos = [
			["ThaumicMekanism's Repo", "https://thaumicmekanism.github.io/Unimarklet/repo/", "bookmarklets_repo.js", true, true],
		];
		var script = document.createElement('script');
		script.setAttribute("onerror", "alert('Unimarklet could not load the main manager script!')");
		script.setAttribute("src", "https://thaumicmekanism.github.io/Unimarklet/bookmarklets_manager.js");
		document.getElementsByTagName("head")[0].appendChild(script);
	}
	bmklt();
})();