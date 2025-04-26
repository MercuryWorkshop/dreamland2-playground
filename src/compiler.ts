import { rollup } from "@rollup/browser";
import wasm from "../node_modules/@rollup/browser/dist/bindings_wasm_bg.wasm?url";

import dlCore from "dreamland/core?raw";
import dlJsxRuntime from "dreamland/jsx-runtime?raw";
import dlJsxDevRuntime from "dreamland/jsx-dev-runtime?raw";

// @ts-ignore
globalThis.ROLLUP_WASM = wasm;

const modules = new Map(Object.entries({
	"dreamland/core": dlCore,
	"dreamland/jsx-runtime": dlJsxRuntime,
	"dreamland/jsx-dev-runtime": dlJsxDevRuntime,
}));

export async function compile(transpiled: string): Promise<string> {
	const bundle = await rollup({
		input: "index.jsx",
		plugins: [
			{
				name: "loader",
				resolveId(source) {
					if (source === "index.jsx")
						return source;
					if (modules.has(source))
						return source;
				},
				load(source) {
					if (source === "index.jsx")
						return transpiled;
					if (modules.has(source))
						return modules.get(source);
				}
			}
		]
	});

	const output = await bundle.generate({ format: "es" });

	return output.output[0].code;
}
