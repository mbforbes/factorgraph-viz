// glooobbaaalllsss
let svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

console.log('width: ' + width + ' ' + typeof width);
console.log('height: ' + height + ' ' + typeof height);

// exceptions are the special node, which always returns false
function nodesubtype(desired): (any) => boolean {
	return function(node): boolean {
		// let focus = node.focus || false;
		let focus = false;
		return (!focus) && node.subtype === desired;
	}
}

function nodefocus(node): boolean {
	return node.focus || false;
}

function textclass(d): string {
	return d.type === 'rv' ? 'rvtext' : 'factext';
}

function nodetype(desired): (any) => boolean {
	return function(node): boolean {
		return node.type === desired;
	}
}

function argmax(arr: number[]): number {
	if (arr.length < 1) {
		return -1;
	}
	let max_val = arr[0],
		max_idx = 0;
	for (let i = 1; i < arr.length; i++) {
		if (arr[i] > max_val) {
			max_val = arr[i];
			max_idx = i;
		}
	}
	return max_idx;
}

let colors = [
	d3.color('tomato'),
	d3.color('royalblue'),
	d3.color('lightslategray'),
]

function color(none: string, unsureColor: string, unsureCutoff: number,
		values: string[], d: any): any {
	if (d.weights == null) {
		return d3.color(none);
	}
	let max_idx = argmax(d.weights);
	let max_val = d.weights[max_idx];
	// clamp unsure ones to final value (hopefully something like grey)
	if (max_val < unsureCutoff) {
		return d3.color(unsureColor);
	}
	return values[argmax(d.weights)];
}

function nodename(d: any): string {
	if (d.type == 'fac') {
		// maybe add extra info (e.g. sel pref fac is reversed)
		let specific = '';
		if (d.specific != null) {
			specific = ' [' + d.specific + ']';
		}
		return d.subtype + specific;
	} else {
		// rv
		return d.id;
	}
}

type Config = {
	// This is where the factor graph .json file lives. This can be changed to
	// load a different factor graph.
	data_filename: string

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

function preload(config: Config): void {
	d3.json(config.data_filename, build.bind(null, config));
}

function build(config: Config, data: {nodes: any[], links: any[], stats: any}): void {
	console.log('Got data:');
	console.log(data);

	function isolate(force, filter) {
		let initialize = force.initialize;
		force.initialize = function() { initialize.call(force, data.nodes.filter(filter)); };
		return force;
	}

	if (data.stats && data.stats.correct) {
		let stats = svg.append('g').append('text')
			.attr('transform', 'translate(20,20)')
			.text('correct: ' + data.stats.correct);
	}

	let leftScale = config.position.leftScale;
	let rightScale = config.position.rightScale;
	let centerScale = config.position.centerScale;

	let sim = d3.forceSimulation(data.nodes)
		.force('charge', d3.forceManyBody().strength(-500))
		.force('link', d3.forceLink(data.links).id(
			function(d: any) {return d.id;}))
		// .force('center', d3.forceCenter(width/2, height/2))
		.force('center', isolate(
			d3.forceCenter(width*centerScale, height/2),
			nodefocus))
		.force('left', isolate(
			d3.forceX(width*leftScale).strength(config.position.leftStrength),
			nodesubtype(config.position.leftSubtype)))
		.force('right', isolate(
			d3.forceX(width*rightScale).strength(config.position.rightStrength),
			nodesubtype(config.position.rightSubtype)))
		.force('up', isolate(
			d3.forceY(config.position.upScale*height).strength(config.position.upStrength),
			nodesubtype(config.position.upSubtype)))
		.force('down', isolate(
			d3.forceY(config.position.downScale*height).strength(config.position.downStrength),
			nodesubtype(config.position.downSubtype)))
		.force('middle', d3.forceY(height/2).strength(config.position.middleStrength))
		.on('tick', ticked);

	// use color config we've received to partially bind coloring function
	let colorize = color.bind(null, config.color.none, config.color.unsureColor,
		config.color.unsureCutoff, config.color.values);

	// new for svg --- create the objects directly; then ticked just modifies
	// their positions rather than drawing them.

	let link = svg.append("g")
		.attr("class", "links")
		.selectAll("line")
		.data(data.links)
		.enter().append("line")
		.attr("stroke", colorize)

	let text = svg.append('g')
		.selectAll('text')
		.data(data.nodes)
		.enter().append('text')
		.attr('class', textclass)
		.text(nodename);

	let node = svg.append("g")
		.attr("class", "nodes")
		.selectAll("circle")
		.data(data.nodes.filter(nodetype('rv')))
		.enter().append("circle")
			.attr("r", config.size.rv)
			.attr("fill", colorize)
			.call(d3.drag()
				.on("start", dragstarted)
				.on("drag", dragged)
				.on("end", dragended));

	let fac = svg.append("g")
		.attr("class", "facs")
		.selectAll("rect")
		.data(data.nodes.filter(nodetype('fac')))
		.enter().append("rect")
			.attr("fill", colorize)
			.attr("width", config.size.factor)
			.attr("height", config.size.factor)
			.call(d3.drag()
				.on("start", dragstarted)
				.on("drag", dragged)
				.on("end", dragended));

	// Assumes RVs and factor are roughly the same size.
	let bigger = Math.max(config.size.rv, config.size.factor);

	function ticked() {
		link
			.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; });
		node
			.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) { return d.y; });

		fac
			.attr("x", function(d) { return d.x - config.size.factor/2; })
			.attr("y", function(d) { return d.y - config.size.factor/2; });

		text
			.attr("transform", function(d) {
				return "translate(" + (d.x+bigger) + "," + (d.y+10) + ")";
			});
	}

	function dragsubject() {
		return sim.find(d3.event.x, d3.event.y);
	}

	function dragstarted() {
		if (!d3.event.active) {
			sim.alphaTarget(0.3).restart();
		}
		d3.event.subject.fx = d3.event.subject.x;
		d3.event.subject.fy = d3.event.subject.y;
	}

	function dragged() {
		d3.event.subject.fx = d3.event.x;
		d3.event.subject.fy = d3.event.y;
	}

	function dragended() {
		if (!d3.event.active) {
			sim.alphaTarget(0);
		}
		d3.event.subject.fx = null;
		d3.event.subject.fy = null;
	}
};

// execution starts here
d3.json('data/config/default.json', preload);
// d3.json('data/examples/weight-king_vs_ship.json', build);
