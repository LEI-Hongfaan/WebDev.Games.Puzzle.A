"use strict";

namespace ThisGame {

    export enum Direction {
        None = 0,
        Up = 1 << 0,
        Right = 1 << 1,
        Left = 1 << 2,
        Down = 1 << 3,
    }

    export enum Connection {
        None = 0,
        Up_Right = 1 << 0,
        Down_Right = 1 << 1,
        Up_Left = 1 << 2,
        Down_Left = 1 << 3,
    }

    export class Position {
        readonly direction: Direction;
        readonly x: number;
        readonly y: number;

        constructor(direction: Direction, x: number, y: number) {
            this.direction = direction;
            this.x = x;
            this.y = y;
        }

        static equals(left: Position, right: Position) {
            return left.direction === right.direction && left.x === right.x && left.y === right.y;
        }

        /*
        increaseX() {
            return new Position(this.direction, this.x + 1, this.y);
        }

        decreaseX() {
            return new Position(this.direction, this.x - 1, this.y);
        }

        increaseY() {
            return new Position(this.direction, this.x, this.y + 1);
        }

        decreaseY() {
            return new Position(this.direction, this.x, this.y - 1);
        }
        
        withDirection(d: Direction) {
            return new Position(d, this.x, this.y);
        }
        */
    }

    export let randomConnection = function (rate: number) {
        let r = Connection.None;
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

    export let performStep = function (grids: Int8Array, width: number, height: number, node: TreeNode<Position>, list: Array<TreeNode<Position>>) {
        let index: number;
        let tmp: TreeNode<Position>;
        index = node.value.x + width * node.value.y;
        let grid = grids[index];
        let direction = node.value.direction;
        let x = node.value.x;
        let y = node.value.y;
        switch (direction) {
            case Direction.Up:
                if (0 !== (Connection.Down_Right & grid)) {
                    let tmpIndex = index + 1;
                    // visited?
                    if (0 === (Direction.Right & (grids[tmpIndex] >> 4))) {
                        list.push(node.addChild(new Position(Direction.Right, x + 1, y)));
                        grids[tmpIndex] |= Direction.Right << 4;
                    }
                }
                if (0 !== (Connection.Down_Left & grid)) {
                    let tmpIndex = index - 1;
                    // visited?
                    if (0 === (Direction.Left & (grids[tmpIndex] >> 4))) {
                        list.push(node.addChild(new Position(Direction.Left, x - 1, y)));
                        grids[tmpIndex] |= Direction.Left << 4;
                    }
                }
                if (y > 0) {
                    let tmpIndex = index - width;
                    // visited?
                    if (0 === (Direction.Up & (grids[tmpIndex] >> 4))) {
                        list.push(node.addChild(new Position(Direction.Up, x, y - 1)));
                        grids[tmpIndex] |= Direction.Up << 4;
                    }
                }
                break;
            case Direction.Right:
                if (0 !== (Connection.Up_Left & grid)) {
                    let tmpIndex = index - width;
                    // visited?
                    if (0 === (Direction.Up & (grids[tmpIndex] >> 4))) {
                        list.push(node.addChild(new Position(Direction.Up, x, y - 1)));
                        grids[tmpIndex] |= Direction.Up << 4;
                    }
                }
                if (0 !== (Connection.Down_Left & grid)) {
                    let tmpIndex = index + width;
                    // visited?
                    if (0 === (Direction.Down & (grids[tmpIndex] >> 4))) {
                        list.push(node.addChild(new Position(Direction.Down, x, y + 1)));
                        grids[tmpIndex] |= Direction.Down << 4;
                    }
                }
                if (x + 1 < width) {
                    let tmpIndex = index + 1;
                    // visited?
                    if (0 === (Direction.Right & (grids[tmpIndex] >> 4))) {
                        list.push(node.addChild(new Position(Direction.Right, x + 1, y)));
                        grids[tmpIndex] |= Direction.Right << 4;
                    }
                }
                break;
            case Direction.Left:
                if (0 !== (Connection.Up_Right & grid)) {
                    let tmpIndex = index - width;
                    // visited?
                    if (0 === (Direction.Up & (grids[tmpIndex] >> 4))) {
                        list.push(node.addChild(new Position(Direction.Up, x, y - 1)));
                        grids[tmpIndex] |= Direction.Up << 4;
                    }
                }
                if (0 !== (Connection.Down_Right & grid)) {
                    let tmpIndex = index + width;
                    // visited?
                    if (0 === (Direction.Down & (grids[tmpIndex] >> 4))) {
                        list.push(node.addChild(new Position(Direction.Down, x, y + 1)));
                        grids[tmpIndex] |= Direction.Down << 4;
                    }
                }
                if (x > 0) {
                    let tmpIndex = index - 1;
                    // visited?
                    if (0 === (Direction.Left & (grids[tmpIndex] >> 4))) {
                        list.push(node.addChild(new Position(Direction.Left, x - 1, y)));
                        grids[tmpIndex] |= Direction.Left << 4;
                    }
                }
                break;
            case Direction.Down:
                if (0 !== (Connection.Up_Right & grid)) {
                    let tmpIndex = index + 1;
                    // visited?
                    if (0 === (Direction.Right & (grids[tmpIndex] >> 4))) {
                        list.push(node.addChild(new Position(Direction.Right, x + 1, y)));
                        grids[tmpIndex] |= Direction.Right << 4;
                    }
                }
                if (0 !== (Connection.Up_Left & grid)) {
                    let tmpIndex = index - 1;
                    // visited?
                    if (0 === (Direction.Left & (grids[tmpIndex] >> 4))) {
                        list.push(node.addChild(new Position(Direction.Left, x - 1, y)));
                        grids[tmpIndex] |= Direction.Left << 4;
                    }
                }
                if (y + 1 < height) {
                    let tmpIndex = index + width;
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

    export class StageState {

        /*
        grid: 0x????_????
                ^^^^      visited: Direction
                     ^^^^ Connection
        */
        readonly grids: Int8Array;
        readonly width: number;
        readonly height: number;
        departurePosition: Position;
        destinationPosition: Position;
        currentPosition: Position;
        referenceSolution: TreeNode<Position>;

        constructor(width: number, height: number) {
            this.width = 1 + width;
            this.height = 1 + height;
            this.grids = new Int8Array((1 + width) * (1 + height));
            this.departurePosition = null;
            this.destinationPosition = null;
            this.currentPosition = null;
            this.referenceSolution = null;
        }

        private resetGridsForSolving() {
            let a = this.grids;
            if (null !== a) {
                for (let i = 0; a.length > i; ++i) {
                    a[i] &= 0xF; // remove "visited" flags
                }
            }
        }

        randomDeparturePosition() {
            let rr = Math.floor(Math.random() * 3.0) + 0;
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
        }

        randomDestinationPosition() {
            let rr = Math.floor(Math.random() * 3.0) + 0;
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
        }

        randomize(rate: number) {
            let a = this.grids;
            if (null !== a) {
                for (let i = 0; a.length > i; ++i) {
                    a[i] = randomConnection(rate);
                }
            }
            this.normalize();
        }

        private normalize() {
            let a = this.grids;
            if (null !== a) {
                for (let i = 0; this.width > i; ++i) {
                    a[i] &= ~(Connection.Up_Left | Connection.Up_Right);
                }
                for (let i = (this.height - 1) * this.width; this.height * this.width > i; ++i) {
                    a[i] &= ~(Connection.Down_Left | Connection.Down_Right);
                }
                for (let i = 0; this.height > i; ++i) {
                    a[i * this.width] &= ~(Connection.Down_Left | Connection.Up_Left);
                }
                for (let i = 1; this.height >= i; ++i) {
                    a[i * this.width - 1] &= ~(Connection.Down_Right | Connection.Up_Right);
                }
            }
        }

        solve(current: Position = this.departurePosition, destination: Position = this.destinationPosition, steps: number = 0) {
            let grids = this.grids;
            if (0 >= steps) {
                steps = grids.length * 4;
            }
            this.resetGridsForSolving();
            let root = new TreeNode<Position>(current);
            let a = new Array<TreeNode<Position>>();
            let sln = <TreeNode<Position>>null;
            a.push(root);
            {
                grids[current.x + this.width * current.y] |= (current.direction << 4);
            }
            while (0 <= steps) {
                let node = a.shift();
                if (Position.equals(destination, node.value)) {
                    sln = node;
                    break;
                } else {
                    performStep(grids, this.width, this.height, node, a);
                }
                if (0 === a.length) {
                    break;
                }
            }
            return sln;
        }

        /*
        getNavigator(): GridsNavigatorEx {
            return new GridsNavigatorEx(this);
        }
        */
    }

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

    export class TreeNode<T> {
        value: T;
        private parent: TreeNode<T>;
        private readonly children: Array<TreeNode<T>>;

        constructor(value: T) {
            this.value = value;
            this.parent = null;
            this.children = new Array<TreeNode<T>>();
        }

        getParent() {
            return this.parent;
        }

        // will transfer entire subtree
        setParent() {
            throw new Error("Not implemented yet.")
        }

        getChildren() {
            return this.children.slice();
        }

        getChildCount() {
            return this.children.length;
        }

        getFirstChild() {
            if (this.getChildCount() > 0) {
                return this.children[0];
            }
            return null;
        }

        getLastChild() {
            let c = this.getChildCount();
            if (c > 0) {
                return this.children[c - 1];
            }
            return null;
        }

        getAncestorsAndSelf() {
            let a = new Array<TreeNode<T>>();
            let n = <TreeNode<T>>this;
            do {
                a.unshift(n);
                n = n.parent;
            } while (null !== n);
            return a;
        }

        isRoot() {
            return null === this.parent;
        }

        isLeaf() {
            return 0 === this.getChildCount();
        }

        isNotLeaf() {
            return 0 < this.getChildCount();
        }

        isSeed() {
            return this.isRoot && this.isLeaf();
        }

        getRoot() {
            let node = <TreeNode<T>>this;
            while (!node.isRoot()) {
                node = node.parent;
            }
            return node;
        }

        addChild(value: T) {
            let n = new TreeNode<T>(value);
            n.parent = this;
            this.children.push(n);
            return n;
        }

        removeFirstChild() {
            this.children.shift();
        }

        static cloneSubtree<T>(root: TreeNode<T>) {
            let n = <TreeNode<T>>null;
            if (null !== root) {
                n = new TreeNode<T>(root.value);
                let c = root.children;
                for (let i = 0; c.length > i; ++i) {
                    n.children.push(TreeNode.cloneSubtree(c[i]));
                }
            }
            return n;
        }

        removeDistinctBranch() {
            let n = <TreeNode<T>>this;
            let p = this.parent;
            if (null === p) {
                return false;
            }
            do {
                let c = p.children;
                c.splice(c.lastIndexOf(n), 1);
                n = p;
                p = n.parent;
            } while (null !== p);
            return true;
        }

        getDepth() {
            let n = <TreeNode<T>>this;
            let depth = 0;
            while (!n.isRoot()) {
                n = n.parent;
                ++depth;
            }
            return depth;
        }
    }
}