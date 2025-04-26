import { Component, DLPointer, render, scope } from "dreamland/core";

import "./style.css";
import { Monaco } from "./monaco";
import { compile } from "./compiler";

import defaultCode from "./defaultCode?raw";

const Preview: Component<{ transpiled: DLPointer<string> }> = function(cx) {
	cx.css = scope`
		:scope {
			width: 100%;
			height: 100%;
			border: none;
			background: #fff;
		}
	`;

	const recompile = async (root: HTMLIFrameElement, code: string) => {
		try {
			const compiled = await compile(code);

			root.srcdoc = `
				<style>
					html, body {
						padding: 0;
						margin: 0;
					}
					html, body, body > * {
						width: 100%;
						height: 100%;
						overflow: hidden;
					}
				</style>
				<body></body>
			`;
			root.onload = () => {
				root.contentWindow!.self.eval(compiled);
			}
		} catch (err) {
			root.srcdoc = `
				<div style="background: #111; color: #fff; box-sizing: border-box; position: absolute; width: 100%; height: 100%; top: 0; left: 0; padding: 1em;">
					<h2 style="margin: 0;">Error compiling</h2>
					<pre style="overflow-wrap: anywhere; white-space: pre-wrap;"></pre>
				</div>
			`;
			root.onload = () => {
				root.contentWindow!.document.querySelector("pre")!.innerText = err as any;
			}
		}
	}

	cx.mount = () => {
		const root = cx.root as HTMLIFrameElement;
		use(this.transpiled).listen(val => recompile(root, val))
		root.srcdoc = `
			<div style="background: #111; color: #fff; box-sizing: border-box; position: absolute; width: 100%; height: 100%; top: 0; left: 0; padding: 1em;">
				<h2 style="margin: 0;">Initializing...</h2>
			</div>
		`;
	}

	return (
		<iframe />
	)
}

const App: Component<{}, {
	code: string,
	transpiled: string,
}> = function(cx) {
	cx.css = scope`
		:scope {
			background: #000;
			color: #fff;

			display: grid;
			grid-template-areas:
				"top top"
				"editor preview";
			grid-template-rows: 3em 1fr;
			grid-template-columns: 1fr 1fr;
			gap: 0.25em;
		}

		.top, .editor, .preview {
			background: #111;
		}
		.top {
			grid-area: top;
			padding: 0.5em;

			display: flex;
			gap: 0.5em;
		}
		.editor {
			grid-area: editor;
		}
		.preview {
			grid-area: preview;
		}

		h2 {
			padding: 0;
			margin: 0;
		}
	`;

	this.code = defaultCode;
	this.transpiled = "";

	return (
		<div id="app">
			<div class="top">
				<img src="logo.png" />
				<h2>Dreamland 2 Playground</h2>
			</div>
			<div class="editor">
				<Monaco value={use(this.code).bind()} transpiled={use(this.transpiled).bind()} />
			</div>
			<div class="preview">
				<Preview transpiled={use(this.transpiled)} />
			</div>
		</div>
	)
}

document.querySelector("#app")?.replaceWith(render(<App />));
