class Network {
    constructor(lanes, two) {
        // console.log(lanes);
        this.lanes = lanes;
        this.two = two;
        this.paths = [];
    }

    addPathToStage(_stage) {
        for (var p in this.paths) {
            _stage.add(this.paths[p]);
        }
        two.update();
    }

    async draw() {
        console.log(2)
        for (const [id, l] of Object.entries(this.lanes)) {
            // await new Promise((r) => setTimeout(r, 500));
            var anchors = [
                new Two.Anchor(
                    parseFloat(l["points"][0][0]) + centerX,
                    parseFloat(l["points"][0][1]) + centerY,
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
                        parseFloat(l["points"][a][0]) + centerX,
                        parseFloat(l["points"][a][1]) + centerY,
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
            // something.stroke = "red";
        }
        this.addPathToStage(stage);
        this.two.update();
    }
}
