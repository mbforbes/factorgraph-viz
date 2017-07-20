//
// factorgraph-viz
//
// Visualizing factor graphs using d3-force.
//
// author: mbforbes
//

//
// main.ts is where the execution begins.
//

/// <reference path="config.ts" />
/// <reference path="graph.ts" />

// Constants
let SVG_ELEMENT_ID = 'fg-svg';
let USER_INPUT_ID = 'userInput';
let SUGGESTIONS_ELEMENT_ID = 'suggestions';
let CONFIG_FILE = 'data/config/default.json';

// Globals (sorry).
let cacheConfig: Config;
let cacheFactorgraphFns: string[] = [];

/**
 * Extracts general config and list of factorgraph file names. Calls preload.
 * @param config
 */
function prepreload(config: Config): void {
	cacheConfig = config;
	d3.json(config.data_filenames, preload);
}

/**
 * Saves the list of factor graph file names.
 * @param factorgraphFns
 */
function preload(factorgraphFns: string[]) {
	cacheFactorgraphFns = factorgraphFns;
}

/**
 * Removes everything from within the svg.
 */
function destroy(): void {
	let svg = document.getElementById(SVG_ELEMENT_ID);
	while (svg.firstChild) {
		svg.removeChild(svg.firstChild);
	}
}

/**
 * Loads factor graph found in `fn`.
 * @param fn
 */
function load(fn: string): void {
	destroy();
	d3.json(fn, build.bind(null, cacheConfig));
}

/**
 * Called every time the user text box changes its content.
 */
function userTypes(): void {
	let inp = (document.getElementById(USER_INPUT_ID) as HTMLInputElement).value;
	// Prefix filter. Don't show anything with blank input
	let optsStr = '';
	if (inp.length > 0) {
		optsStr = cacheFactorgraphFns.filter(fn => fn.startsWith(inp)).join(' ');
	}

	// Fill suggestions with text.
	// console.log('user input: "' + inp + '"');
	// console.log('options matched: ' + optsStr);
	let sug = document.getElementById(SUGGESTIONS_ELEMENT_ID);
	sug.innerText = optsStr;
}

/**
 * Called when the user submits the text box (presses enter or clicks button).
 */
function userSubmits(): boolean {
	let inp = (document.getElementById(USER_INPUT_ID) as HTMLInputElement).value;
	if (cacheFactorgraphFns.indexOf(inp) != -1) {
		load(cacheConfig.data_dir + inp + '.json');
	}

	// always return false so that we don't do a POST
	return false;
}

// execution starts here
d3.json(CONFIG_FILE, prepreload);
