"use strict";
exports.__esModule = true;
exports.two = exports.updateVehicleObjects = exports.drawVehicles = void 0;
var Two = require("twojs-ts");
var board = document.getElementById("board");
var centerX = window.innerWidth / 2;
var centerY = window.innerHeight / 2 - 200;
var two = new Two({ width: 0.95 * window.innerWidth, height: 1000 }).appendTo(board);
exports.two = two;
// var stage = new Two.Group();
var Vehicle = /** @class */ (function () {
    function Vehicle(id, x, y) {
        this.id = id;
        this.width = 2;
        this.height = 4;
        this.obj = two.makeEllipse(x, y, this.width, this.height);
        this.obj.fill = "#" + ((Math.random() * 0xffffff) << 0).toString(16);
    }
    Vehicle.prototype.move = function (x, y, angle) {
        this.obj.translation.x = centerX + x;
        this.obj.translation.y = centerY + y;
        this.obj.rotation = -(Math.PI * angle) / 180;
    };
    return Vehicle;
}());
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
exports.updateVehicleObjects = updateVehicleObjects;
function drawVehicles(vehicleData) {
    for (var i in vehicleData.all) {
        var id = vehicleData.all[i];
        var data = vehicleData.data[id];
        vehicles[id].move(data.position[0], data.position[1], data.angle);
    }
    two.update();
}
exports.drawVehicles = drawVehicles;
