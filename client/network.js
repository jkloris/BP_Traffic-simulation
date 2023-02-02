class Network {
    constructor(lanes,trafficLights, boundary, two) {
        this.offset = {
            x : centerX - boundary.x0 - Math.abs(boundary.x0 - boundary.x1) / 2,
            y : centerY - boundary.y0 - Math.abs(boundary.y0 - boundary.y1) / 2
        }
        console.log(centerX, centerY, this.offset)
        this.lanes = lanes;
        this.trafficLights = trafficLights;
        this.two = two;
        this.paths = [];
    }

    addToStage(_stage, list) {
        for (var p in list) {
            _stage.add(list[p]);
        }
        // two.update();
    }

    async draw() {
        for (const [id, l] of Object.entries(this.lanes)) {
            // await new Promise((r) => setTimeout(r, 500));
            var anchors = [
                new Two.Anchor(
                    parseFloat(l["points"][0][0]) + this.offset.x,
                    parseFloat(l["points"][0][1]) + this.offset.y,
                    0,
                    0,
                    0,
                    0,
                    Two.Commands.move
                ),
            ];
            for (var a = 1; a < l["points"].length; a++) {
                anchors.push(
                    new Two.Anchor(
                        parseFloat(l["points"][a][0]) + this.offset.x,
                        parseFloat(l["points"][a][1]) + this.offset.y,
                        0,
                        0,
                        0,
                        0,
                        Two.Commands.line
                    )
                );
            }

            var path = this.two.makePath(anchors, true, false, true);

            path.fill = "rgba(255, 255, 255, 0)"
            path.linewidth = 3;
            
            switch (l["type"]) {
                case "rail":
                    path.stroke = "#7d3e00"
                    path.dashes = [1,1]
                    break;
                case "road":
                    path.stroke = "#000"
                    break;
                case "pathway":
                    path.stroke = "#5e5e5e"
                    path.linewidth = 2;
                    break;
            
                default:
                    break;
            }
            
            this.paths.push(path);

        }
        
        
        // traffic lights drawing
        let tlights = []
        for(const [id, pos] of Object.entries(this.trafficLights)){
            let dot = new Two.Circle(parseFloat(pos[0]) + this.offset.x, parseFloat(pos[1]) + this.offset.y, 3,2)
            dot.fill = "green"
            dot.stroke = "red"
            tlights.push(dot)
        }
        this.addToStage(stage, this.paths);
        this.addToStage(stage, tlights);
        this.two.update();
    }
}
