var app = (function() {
	var dom = document,
			currentProdObj = {};

	this.initialize = function() {
		var request = new XMLHttpRequest(), 
				prodData = [],
				eleVariations = dom.getElementById('variations'),
				eleVariation = dom.querySelector('[data-template=variation]'),
				eleProdListItems = dom.querySelectorAll('[data-template=variation]'),
				eleProdImg = dom.getElementById('large-view'),
				eleProdTitle = dom.getElementById('title'),
				currentProductId,
				idFromUrl,
				self = this;

		request.onreadystatechange = updateView;
		request.open('GET', 'products.json');
		request.send(null);

		function updateView() {
			if (request.readyState === XMLHttpRequest.DONE) {
				if (request.status === 200) {
					prodData = JSON.parse(request.responseText);
					app.currentProdObj = prodData[0];
					for (var a=0; a<prodData.length; a++) {
						eleVariations.innerHTML += eleVariation.outerHTML;
						if (prodData[a]['id'] == app.checkState().id) {
							app.currentProdObj = prodData[a];
						}
					}
					self.setState(app.checkState());
					addHandlers();
					updateNav(app.currentProdObj);
					
				}
			}
		}

		function addHandlers() {
			var eleProdListItems = dom.querySelectorAll('[data-template=variation]'),
					eleProdSwatch = dom.querySelectorAll('[data-template=variation] .swatch'),
					eleProdId = dom.querySelectorAll('[data-template=variation] figcaption');
					
			for (var a=0; a<prodData.length; a++) {
				addListener = (function(idx){
					return function() {
						var prod = prodData[idx];
						eleProdId[idx].innerHTML = prod.id;
						eleProdListItems[idx].setAttribute("data-prod-id", prod.id);
						eleProdListItems[idx].addEventListener('click', function(e){
							for (var b=0; b<eleProdListItems.length; b++) {
								eleProdListItems[b].classList.remove('selected');
							}
							this.classList.add('selected');
							eleProdImg.src = prod.product_image_url;
							eleProdTitle.innerHTML = prod.id + ". " + prod.title;
							self.currentProductId = prod.id;
							app.currentProdObj = prod;
							self.setState(app.checkState());
							updateNav(prod);
						});
					}
				})(a);
				addListener();
			} 
		}

		window.onpopstate = function(e) {
			this.currentProductId = e.state.id;
			updateNav(e.state);
		};

		function updateNav(prodObj) {
			var eleNav = dom.getElementById("bottom"),
					eleProdListItems = dom.querySelectorAll('[data-template=variation]');

			eleNav.style.marginLeft = ("-" + (100*parseInt(prodObj.id) - 70) + "px");
			eleProdTitle.innerHTML = prodObj.id + ". " + prodObj.title;
			eleProdImg.src = prodObj.product_image_url;
			for (var b=0; b<eleProdListItems.length; b++) {
				eleProdListItems[b].classList.remove('selected');
				if (eleProdListItems[b].getAttribute('data-prod-id') == prodObj.id) {
					eleProdListItems[b].classList.add('selected') ;
				}
			}
			
		}
		
	}

	this.checkState = function() {
		var search = window.location.search,
				start = 0,
				end = 0,
				stateObj = {prodId: app.currentProdObj, idParam: "?id=1"};

		if (search !== "") {
			if (search.indexOf("id=") > -1) {
				start = search.indexOf("id=") + 3;
				end = search.indexOf("&") > -1 ? search.indexOf("&", start) : start + 2;
				idFromUrl = search.substring(start, end);
				self.currentProductId = typeof self.currentProductId === "undefined" ? idFromUrl : self.currentProductId;
				stateObj = { prodObj: app.currentProdObj, idParam: "?id="+self.currentProductId, id: idFromUrl};
			}
		}
		return(stateObj);
	}

	this.setState = function(obj) {
		history.pushState(obj.prodObj, "", obj.idParam);
		history.replaceState(obj.prodObj, "", obj.idParam);
	}

	return this;
})();

document.addEventListener("load", app.initialize());
