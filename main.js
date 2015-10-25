var app = (function() {
	var dom = document,
			currentProdObj = {};

	this.initialize = function() {
		var request = new XMLHttpRequest(), 
				prodData = [],
				eleVariations = dom.getElementById('variations'),
				eleVariation = dom.querySelector('[data-template=variation]'),
				eleProdImg = dom.getElementById('large-view'),
				eleProdTitle = dom.getElementById('title'),
				currentProductId = "1",
				self = this;

		this.checkState();
		
		request.onreadystatechange = updateView;
		request.open('GET', 'products.json');
		request.send(null);

		function updateView() {
			if (request.readyState === XMLHttpRequest.DONE) {
				if (request.status === 200) {
					prodData = JSON.parse(request.responseText);
					for (var a=0; a<prodData.length; a++) {
						eleVariations.innerHTML += eleVariation.outerHTML;
					}
					addHandlers();
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
						eleProdId[idx].innerText = prod.id;
						eleProdListItems[idx].addEventListener('click', function(e){
							for (var b=0; b<eleProdListItems.length; b++) {
								eleProdListItems[b].classList.remove('selected');
							}
							this.classList.add('selected');
							eleProdImg.src = prod.product_image_url;
							eleProdTitle.innerText = prod.id + ". " + prod.title;
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
			var eleNav = dom.getElementById("bottom");
			eleNav.style.marginLeft = ("-" + (100*parseInt(prodObj.id) - 70) + "px");
			eleProdTitle.innerText = prodObj.id + ". " + prodObj.title;
			eleProdImg.src = prodObj.product_image_url;
		}
	}

	this.checkState = function() {
		var search = window.location.search,
				idFromUrl = "",
				start = 0,
				end = 0,
				stateObj = {prodId: "1", idParam: "?id=1"};

		if (search !== "") {
			if (search.indexOf("id=") > -1) {
				start = search.indexOf("id=") + 3;
				end = search.indexOf("&") > -1 ? search.indexOf("&", start) : start + 2;
				idFromUrl = search.substring(start, end);
				stateObj = { prodObj: app.currentProdObj, idParam: "?id="+self.currentProductId};
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
