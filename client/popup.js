// builds modal tab with statistics base on incomming stats object
function createStatPopup(stats) {
	modal = document.querySelector('#modal');
	modal.className = 'modal'; // ???
	modal.style.display = 'inherit';

	let popup = document.querySelector('.popup');
	if (popup) modal.removeChild(popup);

	popup = document.createElement('div');
	popup.className = 'popup';

	let close = document.createElement('button');
	close.innerHTML = '&times;';
	close.className = 'close';
	close.onclick = () => {
		modal.style.display = 'none';
		popup.style.display = 'none';
	};
	popup.appendChild(close);
	let h1 = document.createElement('h1');
	h1.innerHTML = 'Simulation Statistics';

	popup.appendChild(h1);
	for (const [header, vals] of Object.entries(stats)) {
		let h3 = document.createElement('h3');
		let table = document.createElement('table');
		table.className = 'popupTable';
		let thead = document.createElement('thead');
		let tbody = document.createElement('tbody');

		h3.innerHTML = header;

		for (const [head, val] of Object.entries(vals)) {
			let th = document.createElement('th');
			let td = document.createElement('td');
			th.innerHTML = head + ' &#9432;';
			td.innerHTML = val.value;
			th.title = val.title;
			td.title = val.title;
			thead.appendChild(th);
			tbody.appendChild(td);
		}
		table.appendChild(thead);
		table.appendChild(tbody);
		popup.appendChild(h3);
		popup.appendChild(table);
	}

	modal.appendChild(popup);
	// document.querySelector('body').appendChild(modal);
}

//opens loading modal
function loadingOn(text = 'Loading Simulation..') {
	document.querySelector('#modal').style.display = 'block';
	let loading = document.querySelector('#loading');
	loading.style.display = 'block';
	loading.innerHTML = text;
}

//closes loading modal
function loadingOff() {
	modal = document.querySelector('#modal');
	modal.style.display = 'none';
	document.querySelector('#loading').style.display = 'none';
}

function openOptions() {
	document.querySelector('#optionsClose').checked = true;
	// document.querySelector('#options').style.width = '20%';
}

function closeOptions() {
	document.querySelector('#optionsClose').checked = false;
}

function clearOptions() {
	document.querySelector('#pathOptions').style.display = 'none';
	document.querySelector('#vehicleOptions').style.display = 'none';
	document.querySelector('#tLightOptions').style.display = 'none';
}

const toast = document.getElementById('toast');
const closeToastBtn = document.getElementById('close');

/**
 * open window that signals some type of warning.
 * @param {string} text  text of the message
 * @param {int} time for how long will be window visible
 */
function openToast(text, time) {
	toast.classList.add('active');
	document.getElementById('toastText').innerHTML = text;
	setTimeout(() => {
		toast.classList.remove('active');
	}, time);
}

closeToastBtn.addEventListener('click', () => {
	toast.classList.remove('active');
});
