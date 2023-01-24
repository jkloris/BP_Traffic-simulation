var elem = document.getElementById("board");
var centerX = window.innerWidth / 2;
var centerY = window.innerHeight / 2 - 200;

var two = new Two({ width: 0.95 * window.innerWidth, height: 1000 }).appendTo(elem);
var stage = new Two.Group();

class Vehicle {
    constructor(id, x, y) {
        this.id = id;
        this.width = 2;
        this.height = 4;
        this.obj = two.makeEllipse(x, y, this.width, this.height);
        this.obj.fill = "#" + ((Math.random() * 0xffffff) << 0).toString(16);
    }
    move(x, y, angle) {
        this.obj.translation.x = centerX + x;
        this.obj.translation.y = centerY + y;
        this.obj.rotation = -(Math.PI * angle) / 180;
    }
}

var vehicles = {};
// for (i = 0; i < 130; i++) {
//   cars.push(two.makeEllipse(Math.random() * two.width * 2 - two.width, centerY, 5, 10));
//   console.log(cars[i]);
//   cars[i].fill = "#" + ((Math.random() * 0xffffff) << 0).toString(16);
// }

function updateVehicleObjects(vehicleData) {
    for (i in vehicleData.added) {
        id = vehicleData.added[i];
        pos = vehicleData.data[id].position;
        vehicles[id] = new Vehicle(id, pos[0], pos[1]);
        stage.add(vehicles[id].obj);
    }
    for (i in vehicleData.removed) {
        id = vehicleData.removed[i];
        stage.remove(vehicles[id].obj);
        two.remove(vehicles[id].obj);
        delete vehicles[id];
    }
}

function drawVehicles(vehicleData) {
    for (i in vehicleData.all) {
        id = vehicleData.all[i];
        data = vehicleData.data[id];
        vehicles[id].move(data.position[0], data.position[1], data.angle);
    }
    two.update();
}

// two
//   .bind("update", function (frameCount) {
//     for (i in cars) {
//       // x = ;
//       // y = cars[i].traslation.y;
//       cars[i].translation.y = cars[.];
//       // console.log(cars[i]);
//     }
//   })
//   .play();

two.add(stage);
var zui = new Two.ZUI(stage);
console.log(zui);
addZUI();

function addZUI() {
    var domElement = two.renderer.domElement;
    var zui = new Two.ZUI(stage, elem);
    var mouse = new Two.Vector();
    var touches = {};
    var distance = 0;
    var dragging = false;

    zui.addLimits(0.06, 8);

    domElement.addEventListener("mousedown", mousedown, false);
    domElement.addEventListener("mousewheel", mousewheel, false);
    domElement.addEventListener("wheel", mousewheel, false);

    function mousedown(e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        var rect = stage.getBoundingClientRect();
        dragging = mouse.x > rect.left && mouse.x < rect.right && mouse.y > rect.top && mouse.y < rect.bottom;
        dragging = true;
        window.addEventListener("mousemove", mousemove, false);
        window.addEventListener("mouseup", mouseup, false);
    }

    function mousemove(e) {
        var dx = e.clientX - mouse.x;
        var dy = e.clientY - mouse.y;
        if (dragging) {
            stage.position.x += dx / zui.scale;
            stage.position.y += dy / zui.scale;
        } else {
            zui.translateSurface(dx, dy);
        }
        mouse.set(e.clientX, e.clientY);
        two.update();
    }

    function mouseup(e) {
        window.removeEventListener("mousemove", mousemove, false);
        window.removeEventListener("mouseup", mouseup, false);
    }

    function mousewheel(e) {
        var dy = (e.wheelDeltaY || -e.deltaY) / 2000;
        zui.zoomBy(dy, e.clientX, e.clientY);
        two.update();
    }
}

document.addEventListener("click", function (event) {});
