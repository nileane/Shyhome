(function() {
		
	// Hidden manifest roles that we do not show
	var HIDDEN_ROLES = ['system', 'keyboard', 'homescreen'];

	// List of all application icons
	var icons = {};

	var isOrdered = false;

	// Ordered icons
	var appOrder = [];

	/**
	 * Creates icons for an app based on hidden roles and entry points.
	 */
	function makeIcons(app) {
		if (HIDDEN_ROLES.indexOf(app.manifest.role) !== -1) {
			return;
		}

		function gotIcon(icon) {
			icons[icon.identifier] = icon;
			if (!isOrdered) {
				appOrder.push(icon.identifier);
			}
		}

		if (app.manifest.entry_points) {
			for (var i in app.manifest.entry_points) {
				gotIcon(new Icon(app, i));
			}
		} else {
			gotIcon(new Icon(app));
		}
	}

	/**
	 * Fetch all apps and render them.
	 */
	asyncStorage.getItem('appOrder', function(order) {
		if (order) {
			appOrder = order;
			isOrdered = true;
		}
		fetchApps();
	});

	function fetchApps() {
		navigator.mozApps.mgmt.getAll().onsuccess = function(event) {
			event.target.result.forEach(makeIcons);
			isOrdered = true;
			renderAll();
		};
	}

	/**
	 * Renders all icons
	 */	
	function renderAll() {
		document.getElementById('apps').innerHTML = '';
		appOrder.forEach(function(id) {
			icons[id].render();
		});
	}

	/**
	 * Add an event listener to launch the app on click.
	 */
	window.addEventListener('click', function(e) {
		var container = e.target
		var identifier = container.dataset.identifier;
		var icon = icons[identifier];

		icon.launch();

		// Now resort appOrder to have the proper ordering
		// We move the clicked application up one position
		for (var i = 1, iLen = appOrder.length; i < iLen; i++) {
			var eachIcon = icons[appOrder[i]];
			if (eachIcon.identifier === identifier) {
				var tempIcon = appOrder[i];
				appOrder[i] = appOrder[i - 1];
				appOrder[i - 1] = tempIcon;
				renderAll();
				break;
			}
		}
	});
	
	setTimeout(function () {
		var pageHeight = document.getElementById('main').clientHeight;
		document.getElementById("apps").style.transform = "translate(0," + pageHeight + "px)";				

//		var hoopup = document.getElementById("clock");
//		hoopup.onclick = function() {
//			document.getElementById("main").style.transform = "translateY(calc(-100% + 20px))";
//			document.getElementById("main").style.opacity = "0";
//			document.getElementById("apps").style.transform = "translateY(0)";
//		}
	}, 1000);
}());
