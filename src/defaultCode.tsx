import { Component, DLBoundPointer } from "dreamland/core";

const Counter: Component<{ count: DLBoundPointer<number> }> = function() {
    return (
        <div>
            <div>Count: {use(this.count)}</div>
            <button on:click={() => this.count++}>{use`Count: ${this.count}`}</button>
        </div>
    )
}

const App: Component<{}, {count: number}> = function (cx) {
    cx.css = `
        :scope {
            background: #111;
            color: #fff;
            padding: 1em;
        }

        h1 {
            margin: 0;
        }
    `

    this.count = 0;

    return (
        <div>
            <h1>Welcome to Dreamland!</h1>
            <Counter count={use(this.count).bind()}/>
        </div>
    )
}

document.body.appendChild(<App />);
