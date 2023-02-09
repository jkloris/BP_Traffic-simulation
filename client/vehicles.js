class Vehicle {
	constructor(id, x, y) {
		this.id = id;
		this.width = 1.5;
		this.height = 4;
		this.obj = two.makeEllipse(x, y, this.width, this.height);
		this.obj.linewidth = 0.1;
		this.obj.fill = '#' + ((Math.random() * 0xffffff) << 0).toString(16);
	}
	move(x, y, angle, offset = { x: 0, y: 0 }) {
		this.obj.translation.x = x + offset.x;
		this.obj.translation.y = window.innerHeight - y - offset.y;
		this.obj.rotation = (Math.PI * angle) / 180;
	}
}
