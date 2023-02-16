

function createStatPopup(stats) {
    oldmodal = document.querySelector('#modal');
	if (oldmodal) document.querySelector('body').removeChild(oldmodal);

	const modal = document.createElement('div');
	modal.className = 'modal';
	modal.id = 'modal';

	let popup = document.createElement('div');
	popup.className = 'popup';

	let close = document.createElement('button');
	close.innerHTML = '&times;';
	close.className = 'close';
	close.onclick = () => {
		modal.style.display = 'none';
	};
	popup.appendChild(close);

	for (const [header, vals] of Object.entries(stats)) {
		let h2 = document.createElement('h2');
		let table = document.createElement('table');
		table.className = 'popupTable';
		let thead = document.createElement('thead');
		let tbody = document.createElement('tbody');

		h2.innerHTML = header;

		for (const [head, val] of Object.entries(vals)) {
			let th = document.createElement('th');
			let td = document.createElement('td');
			th.innerHTML = head;
			td.innerHTML = val;
			thead.appendChild(th);
			tbody.appendChild(td);
		}
		table.appendChild(thead);
		table.appendChild(tbody);
		popup.appendChild(h2);
		popup.appendChild(table);
	}

	modal.appendChild(popup);
	document.querySelector('body').appendChild(modal);
}

//tmp just formating



