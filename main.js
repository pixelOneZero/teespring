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
				currentProdId,
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
						// Create and append elements for IE compatibility
						var li = document.createElement("li");
						li.setAttribute("data-prod-id", prodData[a].id);
						eleVariations.appendChild(li);
						var productId = (function(idx) { return function() { li.innerHTML = eleVariation.innerHTML.replace('==prodId==', prodData[idx].id);}})(a);
						productId();
						
						if (prodData[a]['id'] == app.checkState().id) {
							app.currentProdObj = prodData[a];
						}
					}
					eleVariations.removeChild(eleVariation);
					self.setState(app.checkState());
					addHandlers();
					updateNav(app.currentProdObj);
				}
			}
		}

		function addHandlers() {
			var eleProdListItems = dom.querySelectorAll('nav li'),
					eleProdSwatch = dom.querySelectorAll('nav .swatch'),
					eleProdId = dom.querySelectorAll('nav figcaption');
					
			for (var a=0; a<prodData.length; a++) {
				addListener = (function(idx){
					return function() {
						var prod = prodData[idx];
						eleProdListItems[idx].addEventListener('click', function(e){
							for (var b=0; b<eleProdListItems.length; b++) {
								eleProdListItems[b].className='';
							}
							this.className += ' selected';
							eleProdImg.src = prod.product_image_url;
							eleProdTitle.innerHTML = prod.id + ". " + prod.title;
							self.currentProdId = prod.id;
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
			this.currentProdId = e.state.id;
			updateNav(e.state);
		};

		function updateNav(prodObj) {
			var eleNav = dom.getElementById("bottom"),
					eleProdListItems = dom.querySelectorAll('li');

			eleNav.style.marginLeft = self.currentProdId != "1" ? ("-" + (84*parseInt(prodObj.id) - 89) + "px") : 0;
			eleProdTitle.innerHTML = prodObj.id + ". " + prodObj.title;
			eleProdImg.src = prodObj.product_image_url;
			for (var b=0; b<eleProdListItems.length; b++) {
				eleProdListItems[b].className='';
				if (eleProdListItems[b].getAttribute('data-prod-id') == prodObj.id) {
					eleProdListItems[b].className += ' selected';
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
				self.currentProdId = typeof self.currentProdId === "undefined" ? idFromUrl : self.currentProdId;
				stateObj = { prodObj: app.currentProdObj, idParam: "?id="+self.currentProdId, id: idFromUrl};
			}
		}
		return(stateObj);
	}

	this.setState = function(obj) {
		if (history.pushState) {
			history.pushState(obj.prodObj, "", obj.idParam);
			history.replaceState(obj.prodObj, "", obj.idParam);
		}
	}

	return this;
})();

document.addEventListener("load", app.initialize());