(function(d, w){
	const PARALLAX_SPEED = .3;
	let content_hook = d.getElementById("content");
	
	// do parallax
	content_hook.addEventListener("scroll", function(e){
		window.requestAnimationFrame(function(f){
			for (elem of content_hook.getElementsByClassName("wallpaper-image")){
				elem.style.backgroundPositionY = "calc(50% + " + (content_hook.scrollTop * PARALLAX_SPEED) + "px)";
			}
		});
	});
	
	// do right swipe
	let startX, endX;
	
	function doOpenMenu(x_distance){
		if (x_distance > 75) {
			location.replace("#main-menu");
		}
	}
	
	d.body.addEventListener("touchstart", function(e){
		startX = e.changedTouches[0].screenX;
	});
	
	d.body.addEventListener("touchend", function(e){
		endX = e.changedTouches[0].screenX;
		doOpenMenu(endX - startX);
	});
})(document, window);