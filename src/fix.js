const oldURL = URL;
globalThis.URL = function(...args) {
	if (args[0].endsWith("bindings_wasm_bg.wasm")) {
		return new Request(new oldURL(globalThis.ROLLUP_WASM, location.href));
	}
	return new oldURL(...args);
};
