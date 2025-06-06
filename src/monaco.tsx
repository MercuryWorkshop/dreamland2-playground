import { Component, DLBoundPointer } from "dreamland/core";

import * as monaco from "monaco-editor";
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

import dlCore from '../node_modules/dreamland/dist/core.d.ts?raw';
import dlJsxRuntime from '../node_modules/dreamland/dist/jsx-runtime.d.ts?raw';

const tsWorkerPromise = new Promise<void>(r => {
	self.MonacoEnvironment = {
		getWorker(_, label) {
			if (label === 'json') {
				return new jsonWorker()
			}
			if (label === 'css' || label === 'scss' || label === 'less') {
				return new cssWorker()
			}
			if (label === 'html' || label === 'handlebars' || label === 'razor') {
				return new htmlWorker()
			}
			if (label === 'typescript' || label === 'javascript') {
				r();
				return new tsWorker()
			}
			return new editorWorker()
		}
	}
});

const tsDefaults = monaco.languages.typescript.typescriptDefaults
tsDefaults.setCompilerOptions({
	...tsDefaults.getCompilerOptions(),
	jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
	jsxImportSource: "dreamland",
	baseUrl: ".",
});
tsDefaults.addExtraLib(dlCore, monaco.Uri.file("dreamland/core.d.ts").toString());
tsDefaults.addExtraLib(dlJsxRuntime, monaco.Uri.file("dreamland/jsx-runtime.d.ts").toString());

export const Monaco: Component<{ value: DLBoundPointer<string>, transpiled: DLBoundPointer<string>, }, {}, {
	initPromise: Promise<void>,
}> = function(cx) {
	cx.css = `
		:scope, .monaco-editor {
			width: 100%;
			height: 100%;
		}
	`;

	const register = async (model: monaco.editor.IModel) => {
		await tsWorkerPromise;

		const worker = await monaco.languages.typescript.getTypeScriptWorker();
		const proxy = await worker(model.uri);

		const recompile = async () => {
			setting = true;
			this.value = model.getValue();

			const out = await proxy.getEmitOutput(model.uri.toString());
			this.transpiled = out.outputFiles[0].text;
		};

		let setting = false;
		model.onDidChangeContent(recompile);
		use(this.value).listen(x => {
			if (!setting)
				model.setValue(x);
		});

		await recompile();
	}

	cx.mount = () => {
		const editor = monaco.editor.create(cx.root, {
			model: monaco.editor.createModel(this.value, "typescript", monaco.Uri.file("index.tsx")),
			automaticLayout: true,
			theme: "vs-dark"
		});
		const model = editor.getModel()!;

		register(model);
	}

	return (
		<div />
	)
}
