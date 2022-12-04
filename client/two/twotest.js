
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

vehicles = {};
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
var zui = new ZUI(stage);
// addZUI();

function addZUI() {
    var domElement = two.renderer.domElement;
    var zui = new Two.ZUI(stage, elem);
    var mouse = new Two.Vector();
    var touches = {};
    var distance = 0;
    var dragging = false;

    // zui.addLimits(0.06, 8);

    // // domElement.addEventListener('mousedown', mousedown, false);
    // domElement.addEventListener("mousewheel", mousewheel, false);
    // domElement.addEventListener("wheel", mousewheel, false);

    // domElement.addEventListener('touchstart', touchstart, false);
    // domElement.addEventListener('touchmove', touchmove, false);
    // domElement.addEventListener('touchend', touchend, false);
    // domElement.addEventListener('touchcancel', touchend, false);

    // function mousedown(e) {
    //     mouse.x = e.clientX;
    //     mouse.y = e.clientY;
    //     var rect = shape.getBoundingClientRect();
    //     dragging = mouse.x > rect.left && mouse.x < rect.right && mouse.y > rect.top && mouse.y < rect.bottom;
    //     window.addEventListener("mousemove", mousemove, false);
    //     window.addEventListener("mouseup", mouseup, false);
    // }

    // function mousemove(e) {
    //     var dx = e.clientX - mouse.x;
    //     var dy = e.clientY - mouse.y;
    //     if (dragging) {
    //         shape.position.x += dx / zui.scale;
    //         shape.position.y += dy / zui.scale;
    //     } else {
    //         zui.translateSurface(dx, dy);
    //     }
    //     mouse.set(e.clientX, e.clientY);
    // }

    // function mouseup(e) {
    //     window.removeEventListener("mousemove", mousemove, false);
    //     window.removeEventListener("mouseup", mouseup, false);
    // }

    // function mousewheel(e) {
    //     var dy = (e.wheelDeltaY || -e.deltaY) / 1000;
    //     zui.zoomBy(dy, e.clientX, e.clientY);
    // }

    // function touchstart(e) {
    //     switch (e.touches.length) {
    //         case 2:
    //             pinchstart(e);
    //             break;
    //         case 1:
    //             panstart(e);
    //             break;
    //     }
    // }

    // function touchmove(e) {
    //     switch (e.touches.length) {
    //         case 2:
    //             pinchmove(e);
    //             break;
    //         case 1:
    //             panmove(e);
    //             break;
    //     }
    // }

    // function touchend(e) {
    //     touches = {};
    //     var touch = e.touches[0];
    //     if (touch) {
    //         // Pass through for panning after pinching
    //         mouse.x = touch.clientX;
    //         mouse.y = touch.clientY;
    //     }
    // }

    // function panstart(e) {
    //     var touch = e.touches[0];
    //     mouse.x = touch.clientX;
    //     mouse.y = touch.clientY;
    // }

    // function panmove(e) {
    //     var touch = e.touches[0];
    //     var dx = touch.clientX - mouse.x;
    //     var dy = touch.clientY - mouse.y;
    //     zui.translateSurface(dx, dy);
    //     mouse.set(touch.clientX, touch.clientY);
    // }

    // function pinchstart(e) {
    //     for (var i = 0; i < e.touches.length; i++) {
    //         var touch = e.touches[i];
    //         touches[touch.identifier] = touch;
    //     }
    //     var a = touches[0];
    //     var b = touches[1];
    //     var dx = b.clientX - a.clientX;
    //     var dy = b.clientY - a.clientY;
    //     distance = Math.sqrt(dx * dx + dy * dy);
    //     mouse.x = dx / 2 + a.clientX;
    //     mouse.y = dy / 2 + a.clientY;
    // }

    // function pinchmove(e) {
    //     for (var i = 0; i < e.touches.length; i++) {
    //         var touch = e.touches[i];
    //         touches[touch.identifier] = touch;
    //     }
    //     var a = touches[0];
    //     var b = touches[1];
    //     var dx = b.clientX - a.clientX;
    //     var dy = b.clientY - a.clientY;
    //     var d = Math.sqrt(dx * dx + dy * dy);
    //     var delta = d - distance;
    //     zui.zoomBy(delta / 250, mouse.x, mouse.y);
    //     distance = d;
    // }
}

document.addEventListener("click", function (event) {});
