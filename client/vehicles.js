class Vehicle {
	constructor(id, x, y) {
		this.id = id;
		this.width = 1.5;
		this.height = 4;
		this.obj = two.makeRoundedRectangle(x, y, this.width, this.height, this.width - 1);
		this.obj3 = two.makeRectangle(x, y, this.width, this.height - 2);
		this.obj2 = two.makeRectangle(x, y, this.width - 0.3, this.width - 0.3);
		this.obj.linewidth = 0.1;
		this.obj2.linewidth = 0.1;
		this.obj3.linewidth = 0.1;
		this.obj.fill = '#' + ((Math.random() * 0xffffff) << 0).toString(16);
		this.obj3.fill = 'rgba(0,0,0, 0.5)';
		this.obj2.fill = this.obj.fill;
	}
	move(x, y, angle, offset = { x: 0, y: 0 }) {
		this.obj.translation.x = x + offset.x;
		this.obj3.translation.x = x + offset.x;
		this.obj2.translation.x = x + offset.x;

		this.obj.translation.y = window.innerHeight - y - offset.y;
		this.obj3.translation.y = window.innerHeight - y - offset.y;
		this.obj2.translation.y = window.innerHeight - y - offset.y;

		this.obj.rotation = (Math.PI * angle) / 180;
		this.obj3.rotation = (Math.PI * angle) / 180;
		this.obj2.rotation = (Math.PI * angle) / 180;
	}

    select(){
        this.obj.stroke = 'red';
		this.obj.linewidth = 1;
		two.update();
    }
    unselect(){
        this.obj.stroke = 'black';
		this.obj.linewidth = 0.1;
		two.update();
    }
}
