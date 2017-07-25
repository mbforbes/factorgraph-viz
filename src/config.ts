//
// factorgraph-viz
//
// Visualizing factor graphs using d3-force.
//
// author: mbforbes
//

//
// config.ts defines the config type (Config)
//

type Config = {
	// This contains the directory where data files found in data_filenames
	// (below) live.
	data_dir: string

	// This contains the file name of a .json file (relative to data_dir), the
	// contents of which should be a list of factor graph .json files names
	// (without directory or ".json" extension, for autocomplete).
	data_filenames: string

	// The filename of a .json file (also relative to data_dir) to load upon
	// startup. If empty, will simply not load a file upon startup.
	startup_filename: string

	// The limit of the number of autocomplete entries to show.
	autocomplete_limit: number

	// This is displayed before any factor graph in the visualized header.
	display_prefix: string

	size: {
		// The radius of an RV node.
		rv: number,

		// The length of one edge of a factor box.
		factor: number,
	}

	position: {
		// "fooScale" refers to where on the relevant axis "foo" should align.
		// For example, "leftScale" refers to where on the x axis the "left"
		// nodes should live, relative to the full width.
		//
		// "fooSubtype" refers to which nodes will be marked as "foo". For
		// example, "leftSubtype" means that all nodes with a "subtype" property
		// matching that value will be marked as "left". (They will then be
		// positioned according to "leftScale".)
		//
		// "fooStrength" is the strength of the "foo" force. For example,
		// "leftStrength" is the strength that nodes matching "leftSubtype" will
		// be sent to "leftScale" along the x axis.
		//
		// Special cases:
		//  - there is no "centerSubtype"; the node with `"focus": true` is
		//    always centered.
		//
		//  - "middle" is applied to all nodes and draws to the middle of the
		//    diagram. Only its strength is configurable.
		leftScale: number,
		leftSubtype: string,
		leftStrength: number,
		centerScale: number,
		rightScale: number,
		rightSubtype: string,
		rightStrength: number,
		upScale: number,
		upSubtype: string,
		upStrength: number,
		downScale: number,
		downSubtype: string,
		downStrength: number,
		middleStrength: number,
	}

	color: {
		// The "none" color is used when the weights for an RV's values are not
		// available.
		none: string,

		// The unsure color is used when there is no clear dominant value
		// provided in the RV. This is determined by the unsureCutoff.
		unsureColor: string,

		// A number between 0.0 and 1.0; if no weight for any value is greater
		// than this, the item in question will be colored with "unsureColor".
		unsureCutoff: number,

		// The list of color names used that correspond to each value of the
		// RV's possible set of values. The value with the highest weight will
		// have its corresponding color used (unless the weight is below
		// unsureCutoff).
		values: string[],
	}
}
