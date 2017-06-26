# factorgraph-viz

Factor graph visualization using d3.js.

## TODO

### for github release

- [ ] travis
- [ ] example data (toy)
- [ ] example data (real)
- [ ] simple schema
- [ ] simple config
- [ ] readme
	- [ ] baddgggggeesss
	- [ ] desc
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
