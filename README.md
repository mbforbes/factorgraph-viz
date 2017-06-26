# factorgraph-viz

[![Build Status](https://travis-ci.org/mbforbes/factorgraph-viz.svg?branch=master)](https://travis-ci.org/mbforbes/factorgraph-viz)
[![license MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/mbforbes/factorgraph-viz/blob/master/LICENSE)

This is a small visualization library written in Typescript for visualizing
factor graphs. It uses the [d3-force](https://github.com/d3/d3-force/)
component of [D3.js](https://d3js.org/).

## TODO

### for github release

- [x] travis
- [ ] example data (toy)
- [ ] example data (real)
- [ ] simple schema
- [ ] simple config
- [ ] readme
	- [x] baddgggggeesss
	- [x] desc
	- [ ] gif
	- [ ] installation
	- [ ] example usage
	- [ ] projects using `factorgraph-viz`
	- [ ] contributing

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
