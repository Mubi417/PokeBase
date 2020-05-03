const api = 'https://pokeapi.co/api/v2/pokemon';
const searchInbox = document.getElementById('search-box');
const searchPokemon = document.getElementById('search-button');
const pokeContent = document.getElementById('poke-content');
const modal = document.getElementById('modals');
const buttons = document.getElementById('buttons');
var nextPage;
var previousPage;

const capitalizeFirstLetter = (string) => {
	return string.charAt(0).toUpperCase() + string.slice(1); 
}

const makeRequest = (url) => {
	return new Promise ((resolve, reject)=>{
		let request = new XMLHttpRequest();
		request.open('GET', url);
		request.onreadystatechange = () => {
			if (request.readyState === 4){
				if (request.status === 200 || request.status === 201) {
		         	resolve(JSON.parse(request.response));
		        } else {
		         	reject(request.response);
		        }
			}
		}
		request.send();
	});
}

async function setNames(url) {
	try {
		const list = await makeRequest(url);
		let html = "";
		let modals = "";
		var results;
		if (list.results === undefined) {
			results = [list];
		} else {
			nextPage = list.next;
			previousPage = list.previous;
			results = list.results;
		}

		for(let i=0; i<results.length; i++) {
			let URL;

			if (results[i].url !== undefined){
				URL = await makeRequest(results[i].url);
			}
			else {
				URL = results[i];
			}

			html+= `<div class="pokemon-container">
					<div class="pokemon">
						<div class="poke-image-container">
							<img src="${URL.sprites.back_default}" alt="pokemon" class="poke-image">
						</div>
						<p class="pokemon-name">${capitalizeFirstLetter(URL.name)}</p>
						<button id="view${i}" class="view-pokemon">View</button>
					</div>
				</div>`;

			let abilities = "";
			for (let i=0; i < URL.abilities.length; i++) {
				abilities+=URL.abilities[i].ability.name+'* ';
			}

			let stats ="";
			for (let i=0; i < URL.stats.length; i++) {
				stats+=URL.stats[i].stat.name+': '+URL.stats[i].base_stat+'* ';
			}


			modals+=`<div id="modal${i}"class="modal">
				<div class="modal-content">
					<span id="close${i}" class="close">&times;</span>
					<h3>${capitalizeFirstLetter(URL.name)}'s Attributes</h3>
					<p><b>Name:</b> ${capitalizeFirstLetter(URL.name)}</p>
					<p><b>Height:</b> ${URL.height*10} cm</p>
					<p><b>Abilities:</b> ${abilities}</p>
					<p><b>Species:</b> ${capitalizeFirstLetter(URL.species.name)}</p>
					<p><b>Stats:</b> ${stats}</p>
					<p><b>weight:</b>${URL.weight/10} kg</p>
				</div>
			</div>`;
		}

		return new Promise ((resolve)=>{
			resolve({html: html, modal: modals});
		});

	}catch(e) {
		pokeContent.innerHTML=`Pokemon ${e}`;
	}
}

const modalTrigger = (trigger, modal, close) => {
	trigger.addEventListener('click', (e)=>{
	modal.style.display = 'block';
	});

	close.addEventListener('click', (e)=>{
		modal.style.display = 'none';
	});

	window.addEventListener('click', (e)=>{
	  if (e.target == modal) {
	    modal.style.display = 'none';
	  }
	});
}

const assignModalEvents = () => {
	for(let i=0; i<document.querySelectorAll('.modal').length; i++) {
		let trigger = document.querySelector(`#view${i}`);
		let modal = document.querySelector(`#modal${i}`);
		let close = document.querySelector(`#close${i}`);
		modalTrigger(trigger, modal, close);
	}
}

const previousButton = () => {
	if (previousPage !== null){
		pokeContent.innerHTML='<p id="searching">Loading....</p>';
		setNames(previousPage).then((resolve)=>{
		pokeContent.innerHTML=resolve.html;
		modals.innerHTML = resolve.modal;
		assignModalEvents();
		}).catch('something went wrong');;
	} else {
		loadPokemon(api);
	}
}

const nextButton = () => {
	if (nextPage != null) {
		pokeContent.innerHTML='<p id="searching">Loading....</p>';
		setNames(nextPage).then((resolve)=>{
		pokeContent.innerHTML=resolve.html;
		modals.innerHTML = resolve.modal;
		assignModalEvents();
		}).catch('something went wrong');
	}
}

const addButtonsEvents = () => {
	buttons.innerHTML = `<button id="previous">Previous</button>
				<button id="next">Next</button>`;

	const previous = document.getElementById('previous');
	const next = document.getElementById('next');

	next.addEventListener('click', nextButton);

	previous.addEventListener('click', previousButton);

}


const loadPokemon = (url) => {

	try {
		pokeContent.innerHTML='<p id="searching">Searching....</p>';
		setNames(url).then((resolve)=>{
			if (resolve !== undefined) {
				pokeContent.innerHTML=resolve.html;
				modals.innerHTML = resolve.modal;
				assignModalEvents();
			}
		}).catch((e)=> console.log(e));

	} catch(e) {
		console.log(e);
	}

	addButtonsEvents();
	

}

loadPokemon(api);

searchPokemon.addEventListener('click', (e)=>{
	e.preventDefault();
	if (searchInbox.value !== "") {
		loadPokemon(`${api}/${searchInbox.value.toLowerCase()}`);
		buttons.innerHTML = `<button id="refresh">Refresh</button>`;
		const refresh = document.getElementById('refresh');

		refresh.addEventListener('click', (e)=>{
			addButtonsEvents();
			previousButton();
		});
	}
});

