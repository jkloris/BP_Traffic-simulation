class Network {
	constructor(lanes, trafficLights, boundary, two) {
		// offset centers network
		// !with drawing y coordinate use window.innerHeight - y - offset.y, because sumo calc coordinates from bottom left and js from top left
		this.offset = {
			x: centerX - boundary.x0 - Math.abs(boundary.x0 - boundary.x1) / 2,
			y: centerY - boundary.y0 - Math.abs(boundary.y0 - boundary.y1) / 2,
		};

		this.lanes = lanes;
		this.trafficLights = trafficLights;
		this.two = two;
		this.paths = [];
	}

	async draw() {
		for (const [id, l] of Object.entries(this.lanes)) {
			// await new Promise((r) => setTimeout(r, 500));
			var anchors = [
				new Two.Anchor(
					parseFloat(l['points'][0][0]) + this.offset.x,
					window.innerHeight - parseFloat(l['points'][0][1]) - this.offset.y,
					0,
					0,
					0,
					0,
					Two.Commands.move
				),
			];
			for (var a = 1; a < l['points'].length; a++) {
				anchors.push(
					new Two.Anchor(
						parseFloat(l['points'][a][0]) + this.offset.x,
						window.innerHeight - parseFloat(l['points'][a][1]) - this.offset.y,
						0,
						0,
						0,
						0,
						Two.Commands.line
					)
				);
			}

			var path = this.two.makePath(anchors, true, false, true);

			path.fill = 'rgba(255, 255, 255, 0)';
			path.linewidth = 3;

			switch (l['type']) {
				case 'rail':
					path.stroke = '#7d3e00';
					path.dashes = [1, 1];
					break;
				case 'road':
					path.stroke = '#000';
					break;
				case 'pathway':
					path.stroke = '#5e5e5e';
					path.linewidth = 2;
					break;

				default:
					break;
			}

			this.paths.push(path);
			stage.add(path);
		}

		// traffic lights drawable objects creating
		let tlights = {};
		for (const [id, pos] of Object.entries(this.trafficLights)) {
			let dot = new Two.Circle(
				parseFloat(pos[0]) + this.offset.x,
				window.innerHeight - parseFloat(pos[1]) - this.offset.y,
				3,
				2
			);
			dot.fill = 'green';
			dot.stroke = 'white';
			dot.linewidth = 0.3;
			tlights[id] = dot;
			stage.add(dot);
		}
		this.trafficLights = tlights;
		this.two.update();
	}


	drawTrafficLights(tlightsColors) {
		for (const [id, col] of Object.entries(tlightsColors)) {
			switch (col.toLowerCase()) {
				case 'r':
					this.trafficLights[id].fill = 'red';
					break;
				case 'g':
					this.trafficLights[id].fill = 'green';
					break;
				case 'y':
					this.trafficLights[id].fill = 'yellow';
					break;
				default:
					break;
			}
		}
	}
}
