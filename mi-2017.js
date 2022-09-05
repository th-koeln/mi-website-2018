document.querySelector('.nav-toggle').addEventListener('click', function() {
	var activeClass = 'is-active';
	document.querySelector('.nav-menu').classList.toggle(activeClass);
});

var	tabs = {};
tabs.elements = {};
tabs.func = (function(){

	var exports = {};

	exports.init = function(){
		
		// Content ausblenden
		tabs.elements.content = {};
		var tabWraps = document.querySelectorAll('.is-tab-wrap');
		
		//if(tabWraps.length <= 1){ return false; }
		
		for(i=0; i<tabWraps.length; i++){
			var tabWrap = tabWraps[i];
			tabContents = tabWrap.querySelectorAll('.is-tab-content');
			tabContents[1].classList.add('is-hidden');
		}
		
		
		
		// Tab Navi aktivieren
		var tabNavigations = document.querySelectorAll('.is-tab-navigation');
		
		for(i=0; i<tabNavigations.length; i++){
			var tabNavigation = tabNavigations[i];
			var htmltabs = tabNavigation.querySelectorAll('.tab-item');
			htmltabs[0].classList.add('is-active');
			
			for(i=0; i<htmltabs.length; i++){
				var htmltab = htmltabs[i];
				
				htmltab.onclick = function() { 
					
					var target_id = this.getAttribute('data-tab');
					var target = document.getElementById(target_id);

					// Content ausblenden
					var elements = target.parentElement.querySelectorAll('.is-tab-content');
					for(i=0; i<elements.length; i++){
						var element = elements[i];
						element.classList.add('is-hidden');
					}
					
					// gewählten Content einblenden
					target.classList.remove('is-hidden');
					
					// Aktiven Navipunkt markieren
					var elements = this.parentElement.querySelectorAll('.tab-item');
					for(i=0; i<elements.length; i++){
						var element = elements[i];
						element.classList.remove('is-active');
					}				
					this.classList.add('is-active');
				
				};
			}
			
		}
	}


	return exports;
})();

var	more = {};
more.elements = {};
more.func = (function(){

	var exports = {};

	exports.init = function(){

		var elements = document.querySelectorAll('[data-target]');
		
		for(i=0; i<elements.length; i++){
			
			var ele = elements[i];

			var item = document.createElement("i");
			item.classList.add("fa");
			item.classList.add("fa-angle-down");
			item.classList.add("fa-lg");
			item.classList.add("more-button");

			item.onclick = function(){

				if(this.classList.contains("active")){
					var target = this.parentElement.getAttribute("data-target");
					this.classList.remove("active");
					document.getElementById(target).classList.add('is-hidden');

				}else{
					var target = this.parentElement.getAttribute("data-target");
					this.classList.add("active");
					document.getElementById(target).classList.remove('is-hidden');
				}
				

			}
			ele.appendChild(item);
		}
		


	}


	return exports;
})();


var urlParams = new URLSearchParams(window.location.search);
if(!urlParams.has('media')){
	more.func.init();
	tabs.func.init();	
}

/* Insert Email Adresses
############################################################################ */
const insertEmailAdresses = (target, term)=>{

	if(!window.location.href.match(/127\.0\.0\.1/)) return;
	const emailDataNodes = document.querySelectorAll('[data-verantwortlich]');

	const splitAdresses = (adresses) => {
		if(adresses.match(/, /)) return adresses.split(/, /);
		if(adresses.match(/,/)) return adresses.split(/,/);
		return [adresses];
	};

	const addButton = (adresses)=>{
		const link = document.createElement("a");
		const { program } = pageData;
		link.innerHTML = "Mail an die Dozenten";
		link.href = `mailto: ${Object.keys(emailAdresses).join(',')}?subject=Modulbeschreibungen und Prüfungen im ${program} `;
		target.appendChild(link);
	}

	const emailAdresses = {};
	emailDataNodes.forEach((node, currentIndex, listObj) => {
			if(!node.dataset.verantwortlich.match(/@/)) return;
			const adresses = splitAdresses(node.dataset.verantwortlich);
			
			adresses.forEach(adress => {
				if(!emailAdresses[adress]) emailAdresses[adress] = 0;
				emailAdresses[adress]++;
			});
		}
	);

	addButton(emailAdresses);
};

/* Mail
############################################################################ */

document.addEventListener('DOMContentLoaded', (event) => {
	
	const insertEmailsJS = document.querySelector('[data-js=insert-emails-ws]');
	if(insertEmailsJS === null) return false;
	insertEmailAdresses(insertEmailsJS, 'ws');
	
});