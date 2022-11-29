var elem = document.getElementById("board");

var centerX = window.innerWidth / 2;
var centerY = window.innerHeight / 2 - 200;

var two = new Two({ width: 0.95 * window.innerWidth, height: 1000 }).appendTo(elem);

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

document.addEventListener("click", function (event) {});
