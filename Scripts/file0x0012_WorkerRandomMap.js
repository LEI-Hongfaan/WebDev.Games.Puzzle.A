"use strict";
importScripts("file0x0012_ThisGame.js");
var postMessage0 = self.postMessage;
var mean = function (x, y, d) {
    if (d === void 0) { d = 1.0; }
    if (d < 0.000001) {
        return Math.sqrt(x * y);
    }
    else {
        return Math.pow((Math.pow(x, d) + Math.pow(y, d)) / 2.0, 1.0 / d);
    }
};
onmessage = function (ev) {
    "use strict";
    var data = ev.data;
    var width = data[0];
    var height = data[1];
    var rate = data[2];
    var difficulty = data[3];
    difficulty = (Math.log(difficulty) / Math.log(4.0 / 3.0) - 1.0) * mean(width, height);
    var state = new ThisGame.StageState(width, height);
    state.randomize(rate);
    do {
        var departure = state.randomDeparturePosition();
        var destination = state.randomDestinationPosition();
        var sln = state.solve(departure, destination, -1);
        var d = NaN;
        if (null !== sln) {
            d = sln.getDepth() / 2.0;
            var od = sln.value.direction;
            for (var _i = 0, _a = sln.getAncestorsAndSelf(); _i < _a.length; _i++) {
                var n = _a[_i];
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
//# sourceMappingURL=file0x0012_WorkerRandomMap.js.map