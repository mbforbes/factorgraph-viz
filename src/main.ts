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

let cacheConfig: Config;

// preload is called once the config file is loaded. It extracts the data file
// to load and then launches the process of loading the factor graph and
// building it.
function preload(config: Config): void {
	// Load the data at the config-specified path. Pass along the config and the
	// loaded data to the build(...) function to construct the graph.
	cacheConfig = config;
	d3.json(config.data_filename, build.bind(null, config));
}

// remove everything from the svg
function destroy(): void {
	// destroy all svg children
	let svg = document.getElementById("fg-svg");
	while (svg.firstChild) {
		svg.removeChild(svg.firstChild);
	}
}

// call to load a new one
function load(): void {
	destroy();
	let fn = 'data/examples/05-complex-weight-king_vs_ship.json';
	d3.json(fn, build.bind(null, cacheConfig));
}

// execution starts here
d3.json('data/config/default.json', preload);
