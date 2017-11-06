"use strict";
var ThisGame;
(function (ThisGame) {
    var Direction;
    (function (Direction) {
        Direction[Direction["None"] = 0] = "None";
        Direction[Direction["Up"] = 1] = "Up";
        Direction[Direction["Right"] = 2] = "Right";
        Direction[Direction["Left"] = 4] = "Left";
        Direction[Direction["Down"] = 8] = "Down";
    })(Direction = ThisGame.Direction || (ThisGame.Direction = {}));
    var Connection;
    (function (Connection) {
        Connection[Connection["None"] = 0] = "None";
        Connection[Connection["Up_Right"] = 1] = "Up_Right";
        Connection[Connection["Down_Right"] = 2] = "Down_Right";
        Connection[Connection["Up_Left"] = 4] = "Up_Left";
        Connection[Connection["Down_Left"] = 8] = "Down_Left";
    })(Connection = ThisGame.Connection || (ThisGame.Connection = {}));
    var Position = (function () {
        function Position(direction, x, y) {
            this.direction = direction;
            this.x = x;
            this.y = y;
        }
        Position.equals = function (left, right) {
            return left.direction === right.direction && left.x === right.x && left.y === right.y;
        };
        return Position;
    }());
    ThisGame.Position = Position;
    ThisGame.randomConnection = function (rate) {
        var r = Connection.None;
        if (Math.random() <= rate) {
            r |= Connection.Up_Right;
        }
        if (Math.random() <= rate) {
            r |= Connection.Down_Right;
        }
        if (Math.random() <= rate) {
            r |= Connection.Up_Left;
        }
        if (Math.random() <= rate) {
            r |= Connection.Down_Left;
        }
        return r;
    };
    ThisGame.performStep = function (grids, width, height, node, list) {
        var index;
        var tmp;
        index = node.value.x + width * node.value.y;
        var grid = grids[index];
        var direction = node.value.direction;
        var x = node.value.x;
        var y = node.value.y;
        switch (direction) {
            case Direction.Up:
                if (0 !== (Connection.Down_Right & grid)) {
                    var tmpIndex = index + 1;
                    // visited?
                    if (0 === (Direction.Right & (grids[tmpIndex] >> 4))) {
                        list.push(node.addChild(new Position(Direction.Right, x + 1, y)));
                        grids[tmpIndex] |= Direction.Right << 4;
                    }
                }
                if (0 !== (Connection.Down_Left & grid)) {
                    var tmpIndex = index - 1;
                    // visited?
                    if (0 === (Direction.Left & (grids[tmpIndex] >> 4))) {
                        list.push(node.addChild(new Position(Direction.Left, x - 1, y)));
                        grids[tmpIndex] |= Direction.Left << 4;
                    }
                }
                if (y > 0) {
                    var tmpIndex = index - width;
                    // visited?
                    if (0 === (Direction.Up & (grids[tmpIndex] >> 4))) {
                        list.push(node.addChild(new Position(Direction.Up, x, y - 1)));
                        grids[tmpIndex] |= Direction.Up << 4;
                    }
                }
                break;
            case Direction.Right:
                if (0 !== (Connection.Up_Left & grid)) {
                    var tmpIndex = index - width;
                    // visited?
                    if (0 === (Direction.Up & (grids[tmpIndex] >> 4))) {
                        list.push(node.addChild(new Position(Direction.Up, x, y - 1)));
                        grids[tmpIndex] |= Direction.Up << 4;
                    }
                }
                if (0 !== (Connection.Down_Left & grid)) {
                    var tmpIndex = index + width;
                    // visited?
                    if (0 === (Direction.Down & (grids[tmpIndex] >> 4))) {
                        list.push(node.addChild(new Position(Direction.Down, x, y + 1)));
                        grids[tmpIndex] |= Direction.Down << 4;
                    }
                }
                if (x + 1 < width) {
                    var tmpIndex = index + 1;
                    // visited?
                    if (0 === (Direction.Right & (grids[tmpIndex] >> 4))) {
                        list.push(node.addChild(new Position(Direction.Right, x + 1, y)));
                        grids[tmpIndex] |= Direction.Right << 4;
                    }
                }
                break;
            case Direction.Left:
                if (0 !== (Connection.Up_Right & grid)) {
                    var tmpIndex = index - width;
                    // visited?
                    if (0 === (Direction.Up & (grids[tmpIndex] >> 4))) {
                        list.push(node.addChild(new Position(Direction.Up, x, y - 1)));
                        grids[tmpIndex] |= Direction.Up << 4;
                    }
                }
                if (0 !== (Connection.Down_Right & grid)) {
                    var tmpIndex = index + width;
                    // visited?
                    if (0 === (Direction.Down & (grids[tmpIndex] >> 4))) {
                        list.push(node.addChild(new Position(Direction.Down, x, y + 1)));
                        grids[tmpIndex] |= Direction.Down << 4;
                    }
                }
                if (x > 0) {
                    var tmpIndex = index - 1;
                    // visited?
                    if (0 === (Direction.Left & (grids[tmpIndex] >> 4))) {
                        list.push(node.addChild(new Position(Direction.Left, x - 1, y)));
                        grids[tmpIndex] |= Direction.Left << 4;
                    }
                }
                break;
            case Direction.Down:
                if (0 !== (Connection.Up_Right & grid)) {
                    var tmpIndex = index + 1;
                    // visited?
                    if (0 === (Direction.Right & (grids[tmpIndex] >> 4))) {
                        list.push(node.addChild(new Position(Direction.Right, x + 1, y)));
                        grids[tmpIndex] |= Direction.Right << 4;
                    }
                }
                if (0 !== (Connection.Up_Left & grid)) {
                    var tmpIndex = index - 1;
                    // visited?
                    if (0 === (Direction.Left & (grids[tmpIndex] >> 4))) {
                        list.push(node.addChild(new Position(Direction.Left, x - 1, y)));
                        grids[tmpIndex] |= Direction.Left << 4;
                    }
                }
                if (y + 1 < height) {
                    var tmpIndex = index + width;
                    // visited?
                    if (0 === (Direction.Down & (grids[tmpIndex] >> 4))) {
                        list.push(node.addChild(new Position(Direction.Down, x, y + 1)));
                        grids[tmpIndex] |= Direction.Down << 4;
                    }
                }
                break;
            default:
                throw new Error("How do you get here?");
        }
        if (0 === node.getChildCount()) {
            node.removeDistinctBranch();
        }
    };
    var StageState = (function () {
        function StageState(width, height) {
            this.width = 1 + width;
            this.height = 1 + height;
            this.grids = new Int8Array((1 + width) * (1 + height));
            this.departurePosition = null;
            this.destinationPosition = null;
            this.currentPosition = null;
            this.referenceSolution = null;
        }
        StageState.prototype.resetGridsForSolving = function () {
            var a = this.grids;
            if (null !== a) {
                for (var i = 0; a.length > i; ++i) {
                    a[i] &= 0xF; // remove "visited" flags
                }
            }
        };
        StageState.prototype.randomDeparturePosition = function () {
            var rr = Math.floor(Math.random() * 3.0) + 0;
            switch (rr) {
                case 0:
                    return new Position(Direction.Up, Math.floor(Math.random() * this.width) + 0, this.height - 1);
                case 1:
                    return new Position(Direction.Right, 0, Math.floor(Math.random() * this.height) + 0);
                case 2:
                    return new Position(Direction.Left, this.width - 1, Math.floor(Math.random() * this.height) + 0);
                case 3:
                    return new Position(Direction.Down, Math.floor(Math.random() * this.width) + 0, 0);
                default:
                    throw new Error("How do you get here?");
            }
        };
        StageState.prototype.randomDestinationPosition = function () {
            var rr = Math.floor(Math.random() * 3.0) + 0;
            switch (rr) {
                case 0:
                    return new Position(Direction.Up, Math.floor(Math.random() * this.width) + 0, 0);
                case 1:
                    return new Position(Direction.Right, this.width - 1, Math.floor(Math.random() * this.height) + 0);
                case 2:
                    return new Position(Direction.Left, 0, Math.floor(Math.random() * this.height) + 0);
                case 3:
                    return new Position(Direction.Down, Math.floor(Math.random() * this.width) + 0, this.height - 1);
                default:
                    throw new Error("How do you get here?");
            }
        };
        StageState.prototype.randomize = function (rate) {
            var a = this.grids;
            if (null !== a) {
                for (var i = 0; a.length > i; ++i) {
                    a[i] = ThisGame.randomConnection(rate);
                }
            }
            this.normalize();
        };
        StageState.prototype.normalize = function () {
            var a = this.grids;
            if (null !== a) {
                for (var i = 0; this.width > i; ++i) {
                    a[i] &= ~(Connection.Up_Left | Connection.Up_Right);
                }
                for (var i = (this.height - 1) * this.width; this.height * this.width > i; ++i) {
                    a[i] &= ~(Connection.Down_Left | Connection.Down_Right);
                }
                for (var i = 0; this.height > i; ++i) {
                    a[i * this.width] &= ~(Connection.Down_Left | Connection.Up_Left);
                }
                for (var i = 1; this.height >= i; ++i) {
                    a[i * this.width - 1] &= ~(Connection.Down_Right | Connection.Up_Right);
                }
            }
        };
        StageState.prototype.solve = function (current, destination, steps) {
            if (current === void 0) { current = this.departurePosition; }
            if (destination === void 0) { destination = this.destinationPosition; }
            if (steps === void 0) { steps = 0; }
            var grids = this.grids;
            if (0 >= steps) {
                steps = grids.length * 4;
            }
            this.resetGridsForSolving();
            var root = new TreeNode(current);
            var a = new Array();
            var sln = null;
            a.push(root);
            {
                grids[current.x + this.width * current.y] |= (current.direction << 4);
            }
            while (0 <= steps) {
                var node = a.shift();
                if (Position.equals(destination, node.value)) {
                    sln = node;
                    break;
                }
                else {
                    ThisGame.performStep(grids, this.width, this.height, node, a);
                }
                if (0 === a.length) {
                    break;
                }
            }
            return sln;
        };
        return StageState;
    }());
    ThisGame.StageState = StageState;
    /*
    interface IGridsNavigator {
        moveDown(): boolean;
        moveLeft(): boolean;
        moveRight(): boolean;
        moveUp(): boolean;
        getCurrent(): number;
        moveTo(x: number, y: number): boolean;
    }

    class GridsNavigator {

        readonly grids: Int8Array;
        readonly width: number;
        readonly height: number;
        x: number;
        y: number;
        protected index: number;
        direction: Direction;

        constructor(s: StageState) {
            let width = s.width;
            this.grids = s.grids;
            this.width = width;
            this.height = s.height;
            let p = s.currentPosition;
            this.direction = p.direction;
            let x = p.x;
            let y = p.y;
            this.x = x;
            this.y = y;
            this.index = x + width * y;
        }

        getCurrent(): number {
            return this.grids[this.index];
        }

        moveDown(): boolean {
            return this.y + 1 < this.height ? (++this.y, this.index += this.width, true) : false;
        }

        moveLeft(): boolean {
            return this.x > 0 ? (--this.x, --this.index, true) : false;
        }

        moveRight(): boolean {
            return this.x + 1 < this.width ? (++this.x, ++this.index, true) : false;
        }

        moveUp(): boolean {
            return this.y > 0 ? (--this.y, this.index -= this.width, true) : false;
        }

        moveTo(x: number, y: number): boolean {
            return (x < this.width && y < this.height && x > 0 && y > 0) ? (this.x = x, this.y = y, this.index = this.x + this.width * this.y, true) : false;
        }

        setVisited(direction: Direction) {
            this.grids[this.index] |= (direction << 4);
        }

        getVisited(direction: Direction) {
            return direction === (direction & (this.grids[this.index] >> 4));
        }
    }

    export class GridsNavigatorEx extends GridsNavigator {

        moveDownLeft(): Boolean {
            return (this.y + 1 < this.height && this.x > 0) ? (--this.x, ++this.y, this.index += this.width - 1, true) : false;
        }

        moveDownRight(): Boolean {
            return (this.x + 1 < this.width && this.y + 1 < this.height) ? (++this.x, ++this.y, this.index += this.width + 1, true) : false;
        }

        moveUpLeft(): Boolean {
            return (this.x > 0 && this.y > 0) ? (--this.x, --this.y, this.index -= this.width + 1, true) : false;
        }

        moveUpRight(): Boolean {
            return (this.x + 1 < this.width && this.y > 0) ? (++this.x, --this.y, this.index -= this.width - 1, true) : false;
        }

        constructor(s: StageState) {
            super(s);
        }
    }
    */
    var TreeNode = (function () {
        function TreeNode(value) {
            this.value = value;
            this.parent = null;
            this.children = new Array();
        }
        TreeNode.prototype.getParent = function () {
            return this.parent;
        };
        // will transfer entire subtree
        TreeNode.prototype.setParent = function () {
            throw new Error("Not implemented yet.");
        };
        TreeNode.prototype.getChildren = function () {
            return this.children.slice();
        };
        TreeNode.prototype.getChildCount = function () {
            return this.children.length;
        };
        TreeNode.prototype.getFirstChild = function () {
            if (this.getChildCount() > 0) {
                return this.children[0];
            }
            return null;
        };
        TreeNode.prototype.getLastChild = function () {
            var c = this.getChildCount();
            if (c > 0) {
                return this.children[c - 1];
            }
            return null;
        };
        TreeNode.prototype.getAncestorsAndSelf = function () {
            var a = new Array();
            var n = this;
            do {
                a.unshift(n);
                n = n.parent;
            } while (null !== n);
            return a;
        };
        TreeNode.prototype.isRoot = function () {
            return null === this.parent;
        };
        TreeNode.prototype.isLeaf = function () {
            return 0 === this.getChildCount();
        };
        TreeNode.prototype.isNotLeaf = function () {
            return 0 < this.getChildCount();
        };
        TreeNode.prototype.isSeed = function () {
            return this.isRoot && this.isLeaf();
        };
        TreeNode.prototype.getRoot = function () {
            var node = this;
            while (!node.isRoot()) {
                node = node.parent;
            }
            return node;
        };
        TreeNode.prototype.addChild = function (value) {
            var n = new TreeNode(value);
            n.parent = this;
            this.children.push(n);
            return n;
        };
        TreeNode.prototype.removeFirstChild = function () {
            this.children.shift();
        };
        TreeNode.cloneSubtree = function (root) {
            var n = null;
            if (null !== root) {
                n = new TreeNode(root.value);
                var c = root.children;
                for (var i = 0; c.length > i; ++i) {
                    n.children.push(TreeNode.cloneSubtree(c[i]));
                }
            }
            return n;
        };
        TreeNode.prototype.removeDistinctBranch = function () {
            var n = this;
            var p = this.parent;
            if (null === p) {
                return false;
            }
            do {
                var c = p.children;
                c.splice(c.lastIndexOf(n), 1);
                n = p;
                p = n.parent;
            } while (null !== p);
            return true;
        };
        TreeNode.prototype.getDepth = function () {
            var n = this;
            var depth = 0;
            while (!n.isRoot()) {
                n = n.parent;
                ++depth;
            }
            return depth;
        };
        return TreeNode;
    }());
    ThisGame.TreeNode = TreeNode;
})(ThisGame || (ThisGame = {}));
//# sourceMappingURL=file0x0012_ThisGame.js.map