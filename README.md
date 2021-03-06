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
`data/config/default.json`, which in turn specifics where to look for factor
graphs:

```js
{
    // This is where factorgraph files are located. It can be a local directory
    // (like this) or the URL of a directory.
    "data_dir": "data/examples/",

    // This is a file (again, local or remote) that contains an array of
    // strings. Each string should be the name of a .json file (without the
    // .json extension) that lives in  `data_dir`. These are the factor graphs
    // available to load.
    "data_filenames": "data/options/example-list.json",

    // This is a file to load on startup. It should be relative to `data_dir`
    // and without the .json extension (just like the entries found in
    // `data_filename`)
    "startup_filename": "07-complex-size-threw_d",

    // (config continues ...)
}
```

**New:** The frontend provides autocomplete for strings (factor graph names)
found in the `data_filenames` list. The autocomplete suggestions are clickable,
which will immediately load the corresponding factor graph.

## Factor graph format

In order to produce a factor graph, you must save a JSON file that matches the
required format.

### Specification

The code requires a JSON object with two properties, `nodes` and `links`.

- Every `node` needs a unique `id` property and a `type` property. The `type`
  property can be either `"rv"` (random variable) or `"fac"` (factor). For nodes
  with `"type": "rv"`, their `id` will be displayed in text next to them. For
  nodes with `"type": "fac"`, an additional property `subtype` can be provided,
  which will be displayed as text next to them. The property `"focus": true` can
  be added to any node  and it will centered in the display.

- Each `link` must have a `source` and `target` property. Both `source` and
  `target` must match an `id` of one of the `node`s.

A `weights` property can be added to any `node` or `link` and the code will
colorize that component accordingly. The value for `weights` should be an array
of numbers, one for each value of the relevant random variable. The code will do
an argmax and colorize based on the index of the highest weight. To customize
the colorization scheme, see below in [customization](#customization).

See below for [examples](#examples) of valid factor graph JSON files.

### Schema validation

To aid in creating valid factor graph JSON files, a schema file is provided in
`data/schema/factorgraph.json`. In addition, a simple JSON schema validation
tool (which uses [`jsonschema`](https://www.npmjs.com/package/jsonschema)) is
provided in `build/validator.js`. You can use it to check whether your files
conform to the spec required by this library.

Don't forget to run `npm install` first.

```bash
# Check an individual file.
node build/validator.js data/schema/factorgraph.json data/examples/02-simple-onenode.json

# Check all files in a directory.
node build/validator.js data/schema/factorgraph.json data/examples/
```

## Examples

### Simple example

Here is a simple example (`data/examples/03-simple-binaryfactor.json`). It
contains two random variables and one binary factor that connects them.

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

Here is how the above example is rendered:

![A rendering of the simple binary factor factor graph
example](demo/simple-binaryfactor.png)

### Colorized example

The following example (`data/examples/04-simple-binaryfactor-color.json`)
provides weights for the values of the random variables. It uses three values.
The colorization is based on the index of the greatest value. The default
colorization scheme uses red for the first value, blue for the second, and grey
for the third. This example also adds a unary factor to show that factors can
also have weights (and thus colors).

```json
{
   "nodes": [
      {"id": "rv1", "type": "rv", "weights": [0.7, 0.2, 0.1], "focus": true},
      {"id": "rv2", "type": "rv", "weights": [0.1, 0.8, 0.1]},
      {"id": "fac1", "type": "fac", "subtype": "i'm a unary factor",
         "weights":[0.75, 0.1, 0.1]},
      {"id": "fac2", "type": "fac", "subtype": "i'm a binary factor"}
   ],
   "links": [
      {"source": "rv1", "target": "fac1", "weights":[0.75, 0.1, 0.1]},
      {"source": "rv1", "target": "fac2", "weights":[0.65, 0.35, 0.1]},
      {"source": "fac2", "target": "rv2", "weights":[0.05, 0.9, 0.05]}
   ]
}
```

Here is how it will be rendered:

![A rendering of the simple binary factor colorized factor graph
example](demo/simple-binaryfactor-color.png)

### Additional examples

More examples are provided in `data/examples/`. They are ordered from
simple to complex.

## Customization

There are three places to configure `factorgraph-viz` without recompiling it:

1.  in the config JSON file (found by default in `data/config/default.json`)
2.  the CSS file (found by default in `css/default.css`)
3.  the HTML file (`index.html`)


### 1. `data/config/default.json`

This file is where all of the configuration is loaded. It specifies where factor
graph JSON files can be found, how large to render random variables and factors,
the strength and location of the positioning forces that alter the layout of the
factor graph, and the colorization scheme that is applied when the `weights`
property is provided.

More detail is given about the configuration options at what they mean in the
Typescript type that loads this object, which is located in
[`src/config.ts`](https://github.com/mbforbes/factorgraph-viz/blob/master/src/config.ts).

### 2. `css/default.css`

Due to how SVG works, CSS cannot control the sizing of the random variables or
factors (which is why those are defined in the JSON config file). However, the
various strokes for the factor graph shapes and the all of the font and styling
options for the text are specified in this CSS file.

### 3. `index.html`

The HTML file is minimal, so there are probably only a few reasons why you might
want to configure it: (1) To change the location of `d3` (by default it is
expected to be found in `node_modules/d3/build/d3.js`), (2) to change the size
of the SVG element (by default it is `800 x 600`), (3) To change the CSS file
loaded (by default `css/default.css`), (4) To change the `factorgraph-viz`
library loaded (by default `build/factorgraph-viz.js`).

## Contributing

There's plenty of low-hanging fruit to work on if you'd like to contribute to
this project. Here are a couple ideas:

- [ ] Make an axis-specific [many body
  force](https://github.com/d3/d3-force#forceManyBody). This could help separate
  the nodes vertically so that the text doesn't overlap.

- [ ] Compute stats of the factor graph on-the-fly and display them

## See also

- to learn more about factor graphs, check out the [Structured Belief
  Propagation for NLP Tutorial](https://www.cs.cmu.edu/~mgormley/bp-tutorial/)
  by Matthew R. Gormley and Jason Eisner.

- [`py-factorgraph`](https://github.com/mbforbes/py-factorgraph) is a factor
  graph and loopy belief propagation library, written in Python.

- [verbphysics](https://github.com/uwnlp/verbphysics) is a project that uses
  factor graphs. It makes use of both `py-factorgraph` and `factorgraph-viz`.