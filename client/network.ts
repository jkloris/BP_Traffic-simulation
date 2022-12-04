import * as Two from 'twojs-ts';

class Network {
    lanes: any;
    two: any;
    constructor(lanes, two) {
        this.lanes = lanes;
        this.two = two;
    }

    async draw() {
        var centerX = window.innerWidth / 2;
        var centerY = window.innerHeight / 2 - 200;

        for (const {id, l} of this.lanes) {
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
            // something.stroke = "red";
        }
        this.two.update();
    }
}

export {Network}