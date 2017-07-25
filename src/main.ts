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
let SUGGESTION_NOTICE_ELEMENT_ID = 'suggestionNotice';
let AUTOCOMPLETE_LIMIT_DEFAULT = 50;
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
	maybeLoad(cacheConfig.startup_filename);
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
		let prefix = cacheConfig.display_prefix || '';
		document.getElementById(FG_NAME_ELEMENT_ID).innerText = prefix + name;
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

	// Display suggestions notice only if we have at least 1 suggestion.
	let sugNotice = document.getElementById(SUGGESTION_NOTICE_ELEMENT_ID);
	sugNotice.style.visibility = opts.length > 0 ? 'visible' : 'hidden';

	// Add suggestions.
	let autocomplete_limit = cacheConfig.autocomplete_limit || AUTOCOMPLETE_LIMIT_DEFAULT;
	for (let opt of opts.slice(0, autocomplete_limit)) {
		let el = document.createElement('button');
		el.className = 'suggestion';
		el.innerText = opt;
		el.setAttribute('onclick', 'maybeLoad("' + opt + '");');
		sug.appendChild(el);
	}

	// Display note if they were truncated.
	if (opts.length > autocomplete_limit) {
		let el = document.createElement('p');
		el.className = 'limited';
		el.innerText = '(only first ' + autocomplete_limit + ' of ' +
			opts.length + ' shown)';
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
