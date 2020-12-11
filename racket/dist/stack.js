export default class Stack {
    constructor() {
        this.frames = [];
    }
    push(name) {
        this.frames.unshift([name, []]);
    }
    set(args) {
        this.frames[0][1] = args;
    }
    pop() {
        return this.frames.shift();
    }
    peek() {
        return this.frames[0][0];
    }
    args() {
        return this.frames[0][1];
    }
    size() {
        return this.frames.length;
    }
}
