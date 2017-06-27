//
// factorgraph-viz
//
// Visualizing factor graphs using d3-force.
//
// author: mbforbes
//

//
// graph.ts defines the monster build(...) function for constructing the factor
// graph. It's full of closures as an excuse for accessing what are basically
// globals. I blame d3.
//

/// <reference path="config.ts" />
/// <reference path="node.ts" />
/// <reference path="util.ts" />

/**
 *
 * build is the central function of this codebase. It pareses the factor graph
 * data and constructs it.
 *
 * Note: the nodes here are technically FGNodes, but the horrendous type
 * massaging needed to make this work with d3's type hariness is not worth the
 * effort.
 * @param config
 * @param data
 */
function build(config: Config, data: {nodes: any[], links: any[], stats: any}): void {
	let svg = d3.select("svg"),
		width = +svg.attr("width"),
		height = +svg.attr("height");

	// Debug logging. Can be nice as Chrome's console lets you interactively
	// explore the objects you're getting.
	console.log('Factor graph data:');
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

	// The following functions allow for dragging interactivity. They're here
	// because they require access to variables defined in this function. (Well,
	// dragged() might not, but it fits with the others.)

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

