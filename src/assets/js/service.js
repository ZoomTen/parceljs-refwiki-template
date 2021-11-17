(function(w){
	w.addEventListener("load", function(){
		if ("serviceWorker" in navigator){
			let sw_path = "/service-worker.js";
			
			navigator.serviceWorker.register(sw_path)
			.then(function(reg){
				console.log("Sw registration success: " + reg.scope); 
			})
			.catch(function(e){
				console.error(e);
			});
		}
	});
})(window);