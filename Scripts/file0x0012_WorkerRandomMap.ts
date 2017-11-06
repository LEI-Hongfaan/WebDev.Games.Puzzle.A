"use strict";

importScripts("file0x0012_ThisGame.js");

const postMessage0: any = self.postMessage;

let mean = function (x: number, y: number, d: number = 1.0) {
    if (d < 0.000001) {
        return Math.sqrt(x * y);
    } else {
        return Math.pow((Math.pow(x, d) + Math.pow(y, d)) / 2.0, 1.0 / d);
    }
};

onmessage = function (ev) {
    "use strict";
    let data = <Array<any>>ev.data;
    let width = <number>data[0];
    let height = <number>data[1];
    let rate = <number>data[2];
    let difficulty = <number>data[3];
    difficulty = (Math.log(difficulty) / Math.log(4.0 / 3.0) - 1.0) * mean(width, height);
    let state = new ThisGame.StageState(width, height);
    state.randomize(rate);
    do {
        let departure = state.randomDeparturePosition();
        let destination = state.randomDestinationPosition();
        let sln = state.solve(departure, destination, -1);
        let d = NaN;
        if (null !== sln) {
            d = sln.getDepth() / 2.0;
            let od = sln.value.direction;
            for (let n of sln.getAncestorsAndSelf()) {
                if (od !== n.value.direction) {
                    d += 4.0;
                    od = n.value.direction;
                }
            }
            if (departure.x == destination.x && departure.y == departure.y) {
                d -= 8.0;
            }
        }
        if (difficulty - 4.0 <= d && d <= difficulty + 6.0) {
            state.departurePosition = departure;
            state.destinationPosition = destination;
            state.currentPosition = departure;
            state.referenceSolution = sln;
            break;
        }
        if (Math.random() < 0.05) {
            state.randomize(rate);
        }
    } while (true);
    postMessage0([state]);
};