import * as Two from 'twojs-ts';


var board = document.getElementById("board");

var centerX = window.innerWidth / 2;
var centerY = window.innerHeight / 2 - 200;

var two = new Two({ width: 0.95 * window.innerWidth, height: 1000 }).appendTo(board);
// var stage = new Two.Group();

class Vehicle {
    id: number;
    width: number;
    height: number;
    obj: any;

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

    for (var i in vehicleData.added) {
        var id = vehicleData.added[i];
        var pos = vehicleData.data[id].position;
        vehicles[id] = new Vehicle(id, pos[0], pos[1]);
        // stage.add(vehicles[id].obj);
    }
    for (var i in vehicleData.removed) {
        var id = vehicleData.removed[i];
        two.remove(vehicles[id].obj);
        delete vehicles[id];
    }
}

function drawVehicles(vehicleData) {
    for (var i in vehicleData.all) {
        var id = vehicleData.all[i];
        var data = vehicleData.data[id];
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

export {drawVehicles, updateVehicleObjects, two}