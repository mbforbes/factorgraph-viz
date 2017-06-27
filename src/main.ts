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

// preload is called once the config file is loaded. It extracts the data file
// to load and then launches the process of loading the factor graph and
// building it.
function preload(config: Config): void {
	// Load the data at the config-specified path. Pass along the config and the
	// loaded data to the build(...) function to construct the graph.
	d3.json(config.data_filename, build.bind(null, config));
}

// execution starts here
d3.json('data/config/default.json', preload);
