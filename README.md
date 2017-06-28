# factorgraph-viz

[![Build Status](https://travis-ci.org/mbforbes/factorgraph-viz.svg?branch=master)](https://travis-ci.org/mbforbes/factorgraph-viz)
[![license MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/mbforbes/factorgraph-viz/blob/master/LICENSE)

![a demo of fg-visualizer in action](demo/threw.gif)

This is a small factor graph visualizer written in Typescript. It uses the
[d3-force](https://github.com/d3/d3-force/) component of
[D3.js](https://d3js.org/).

## Installation

You can install `d3` (which is required at runtime) as well as the types and
schema dependencies (which is required to update the code) all at once.

```bash
npm install
```

A pre-compiled library is provided in `build/factorgraph-viz.js`. You can also
produce a fresh version:

```bash
npm run-script compile
```

## Usage

You'll need to run a web server locally to serve up your factor graph data. The
provided script requires python and creates a server on port 8000.

```bash
./server.sh
```

Visiting `localhost:8000` will show `index.html`. The code loads the config file
`data/config/default.json`, which specifies the factor graph to use:

```json
{
  "data_filename": "data/examples/06-complex-size-threw_d.json",
  ...
}
```

Edit that value to load a different factor graph.

## Factor graph spec

In order to produce a factor graph, you must save a JSON file that matches the
required format. Here is an example from
`data/examples/03-simple-binaryfactor.json`:


```json
{
	"nodes": [
		{"id": "rv1", "type": "rv", "focus": true},
		{"id": "rv2", "type": "rv"},
		{"id": "fac1", "type": "fac", "subtype": "hello, world"}
	],
	"links": [
		{"source": "rv1", "target": "fac1"},
		{"source": "fac1", "target": "rv2"}
	]
}
```

The code requires a JSON object with two properties, `nodes` and `links`.

Every `node` needs a unique `id` property and a `type` property, which can be
either `"rv"` (random variable) or `"fac"` (factor). For nodes with type `"rv"`,
their `id` will be displayed in text next to them. For nodes with type `"fac"`,
an additional property `subtype` can be provided, which will be displayed as
text next to them.

Each `link` must have a `source` and `target` property. Each of these must match
an `id` of one of the `node`s.

Here is how the above example is rendered:

![A rendering of the simple binary factor factor graph
example](demo/simple-binaryfactor.png)

## Customization

TODO

```html

<!-- ... -->

<!-- d3 dependencies for d3-force -->
<script src="node_modules/d3/build/d3.js"></script>

<!-- stick an svg element in here for the factor graph visualizer to use -->
<svg width="1500" height="750"></svg>

<!-- the factor graph visualizer. it will load a factor graph from disk. -->
<script src="build/factorgraph-viz.js"></script>

<!-- ... -->
```

## Examples

TODO

## Contributing

There's plenty of low-hanging fruit to work on if you'd like to contribute to
this project. Here are some ideas:

- [ ] Make an axis-specific [many body
  force](https://github.com/d3/d3-force#forceManyBody). This project currently
  uses an extremely high fixed-x force to position subsets of nodes, and relies
  on a many body force to space the nodes along that x position. This is done
  because the text attached to each node means they need to be spaced much
  farther horizontally than vertically so one node's text doesn't overlap and
  obscure other nodes' text. Using such a strong force makes the simulation
  unstable and look strange at start-up. A better solution would be to have an
  axis-specific many body force that only tries to separate nodes along one
  dimension. Then, a much weaker fixed-x force could be combined with a y-only
  many body force to separate the nodes vertically.

- [ ] Decouple the graph display configuration from the generic graph
  rendering. The code is currently biased towards rendering a specific type of
  nodes (random variables that primarily fluctuate between two semantically
  opposite values) and graphs (a known set of named subgraphs). Having at least
  two reference configs for general graph display would be a good starting
  point for allowing others to more easily adapt this code to their needs. This
  could involve a simple display API that maps node property selectors to sets
  of forces.

- [ ] Build a more robust layout scheme. Right now, the code assumes a large
  display, and doesn't scale well to smaller displays (certainly not mobile) or
  constrained dimensions for printing. This would involve playing with the
  forces and a few example datasets to ensure that data is still
  distinguishable when its layout shifts to accommodate difference sizes and
  amounts of scrolling.

## See also

- to learn more about factor graphs, check out the [Structured Belief
  Propagation for NLP Tutorial](https://www.cs.cmu.edu/~mgormley/bp-tutorial/)
  by Matthew R. Gormley and Jason Eisner.

- [`py-factorgraph`](https://github.com/mbforbes/py-factorgraph) is a factor
  graph and loopy belief propagation library, written in Python.

- [verbphysics](https://github.com/uwnlp/verbphysics) is a project that uses
  factor graphs. It makes use of both `py-factorgraph` and `factorgraph-viz`.

## TODO

### for github release

- [x] travis
- [x] example data (toy)
- [x] example data (real)
- [x] simple schema
- [x] simple config
- [ ] readme
	- [x] baddgggggeesss
	- [x] desc
	- [x] gif
	- [x] installation
	- [ ] schema
	- [x] contributing
	- [x] see also

### general features

- [x] grey out binary factors to avoid confusion
- [x] add text labels to facs
- [x] include attr in exported format
- [x] export data w/ all factors
	- [x] seed
	- [x] sel pref
	- [x] verb sim
	- [x] frame sim
	- [x] attr sim
	- [x] obj sim
- [x] ensure all factors represented and nodes connected in graph
- [x] make it visually comprehensible (incl. attempt @ 'focus' node if possible)
- [x] determine correct binary factor color + label (e.g. 'rev'); will need to
      re-export data for this
- [x] get model to best config (B) + re-run to confirm
- [x] dump export all frames as separate jsons
- [ ] let frontend select frame to load
- [ ] output stats to render in e.g. top left:
	- [ ] frame
	- [n] decision + correct / incorrect (do later)
	- [n] count of each factor (do later)
