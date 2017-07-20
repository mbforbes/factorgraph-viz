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
let FG_NAME_ELEMENT_ID = 'fg-title';
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
 * Helper to clear all children of a DOM node.
 * @param el
 */
function clearChildren(el: HTMLElement): void {
	while (el.firstChild) {
		el.removeChild(el.firstChild);
	}
}

/**
 * Removes everything from within the svg.
 */
function destroy(): void {
	clearChildren(document.getElementById(SVG_ELEMENT_ID));
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
 * Loads factor graph found in `fn` if it's in our list of valid factor graph
 * names.
 * @param name
 */
function maybeLoad(name: string): void {
	if (cacheFactorgraphFns.indexOf(name) != -1) {
		document.getElementById(FG_NAME_ELEMENT_ID).innerText = name;
		load(cacheConfig.data_dir + name + '.json');
	}
}

/**
 * Called every time the user text box changes its content.
 */
function userTypes(): void {
	let inp = (document.getElementById(USER_INPUT_ID) as HTMLInputElement).value;
	// Prefix filter. Don't show anything with blank input
	let opts = [];
	if (inp.length > 0) {
		opts = cacheFactorgraphFns.filter(fn => fn.startsWith(inp));
	}

	// Clear any existing suggestions.
	let sug = document.getElementById(SUGGESTIONS_ELEMENT_ID);
	clearChildren(sug);

	// Add suggestions.
	for (let opt of opts) {
		let el = document.createElement('button');
		el.className = 'suggestion';
		el.innerText = opt;
		el.setAttribute('onclick', 'maybeLoad("' + opt + '");');
		sug.appendChild(el);
	}
}

/**
 * Called when the user submits the text box (presses enter or clicks button).
 * Always returns false so we don't do a post.
 */
function userSubmits(): boolean {
	maybeLoad((document.getElementById(USER_INPUT_ID) as HTMLInputElement).value)
	return false;
}

// execution starts here
d3.json(CONFIG_FILE, prepreload);
