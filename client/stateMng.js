
// manage states of the simulation for correct view to be shown
class StateMng {
	constructor() {
		this.state = 'finished';
		this.buttonChanger = new MenuButtonChanger();
	}

	play() {
		if (this.state == 'paused') {
			this.state = 'running';
			this.buttonChanger.hidePlay();
			this.buttonChanger.showPause();
		}
	}

	pause() {
		if (this.state == 'running') {
			this.state = 'paused';
			this.buttonChanger.showPlay();
			this.buttonChanger.hidePause();
		}
	}

	end() {
		this.state = 'finished';
		this.buttonChanger.hidePlay();
		this.buttonChanger.hidePause();
		this.buttonChanger.hideEnd();
		this.buttonChanger.showStart();
	}

	start() {
		if (this.state == 'finished') {
			this.state = 'running';
			this.buttonChanger.hidePlay();
			this.buttonChanger.showPause();
			this.buttonChanger.showEnd();
			this.buttonChanger.hideStart();
		}
	}

	swichToSimulationScreen() {
		this.buttonChanger.hidePresimulationMenu();
		this.buttonChanger.showSimulationMenu();
		this.start();
	}
	swichToPresimulationScreen() {
		this.buttonChanger.showPresimulationMenu();
		this.buttonChanger.hideSimulationMenu();
		this.end();
	}
}

class MenuButtonChanger {
	hidePlay() {
		document.getElementById('playButton').classList.add('hidden');
	}
	hidePause() {
		document.getElementById('pauseButton').classList.add('hidden');
	}
	showPlay() {
		document.getElementById('playButton').classList.remove('hidden');
	}
	showPause() {
		document.getElementById('pauseButton').classList.remove('hidden');
	}
	hideEnd() {
		document.getElementById('endButton').classList.add('hidden');
	}
	showEnd() {
		document.getElementById('endButton').classList.remove('hidden');
	}
	hideStart() {
		document.getElementById('startButton').classList.add('hidden');
	}
	showStart() {
		document.getElementById('startButton').classList.remove('hidden');
	}

	hidePresimulationMenu() {
		document.querySelector('#scenarioBlock').classList.add('hidden');
		document.querySelector('#uploadInputs').classList.add('hidden');
	}

	showPresimulationMenu() {
		document.querySelector('#scenarioBlock').classList.remove('hidden');
		document.querySelector('#uploadInputs').classList.remove('hidden');
	}
	showSimulationMenu() {
		[...document.querySelectorAll('#scenarioChangeButton, .slider')].map((e) => {
			e.classList.remove('hidden');
		});
	}
	hideSimulationMenu() {
		[...document.querySelectorAll('#scenarioChangeButton, .slider')].map((e) => {
			e.classList.add('hidden');
		});
	}
}
