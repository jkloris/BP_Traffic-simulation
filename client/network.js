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
        for (const [id, l] of Object.entries(this.lanes)) {
            // await new Promise((r) => setTimeout(r, 500));
            var anchors = [
                new Two.Anchor(
                    parseFloat(l[0][0]) + centerX,
                    parseFloat(l[0][1]) + centerY,
                    0,
                    0,
                    0,
                    0,
                    Two.Commands.move
                ),
            ];
            for (var a = 1; a < l.length; a++) {
                anchors.push(
                    new Two.Anchor(
                        parseFloat(l[a][0]) + centerX,
                        parseFloat(l[a][1]) + centerY,
                        0,
                        0,
                        0,
                        0,
                        Two.Commands.line
                    )
                );
            }
            anchors.push(
                new Two.Anchor(
                    parseFloat(l[0][0]) + centerX,
                    parseFloat(l[0][1]) + centerY,
                    0,
                    0,
                    0,
                    0,
                    Two.Commands.line
                )
            );
            var path = this.two.makePath(anchors, true, false, true);
            path.linewidth = 3;
            this.paths.push(path);
            // something.stroke = "red";
        }
        this.addPathToStage(stage);
        this.two.update();
    }
}
