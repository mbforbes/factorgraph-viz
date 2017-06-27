//
// factorgraph-viz
//
// Visualizing factor graphs using d3-force.
//
// author: mbforbes
//
//
// factorgraph-viz
//
// Visualizing factor graphs using d3-force.
//
// author: mbforbes
//
/**
 * nodetype returns a function that will take FGNodes as arguments and return
 * whether they match the desired type.
 * @param desired
 */
function nodetype(desired) {
    return function (node) {
        return node.type === desired;
    };
}
/**
 * nodesubtype returns a function that will take FGNodes as arguments and return
 * whether they match the desired subtype.
 * @param desired
 */
function nodesubtype(desired) {
    return function (node) {
        // TODO: do we want to check the node's focus?
        // let focus = node.focus || false;
        let focus = false;
        return (!focus) && node.subtype === desired;
    };
}
/**
 * nodefocus returns whether a node is the node to focus on visually.
 * @param node
 */
function nodefocus(node) {
    return node.focus || false;
}
/**
 * textclass returns the class that should be applied to the text surrounding
 * the provided node.
 * @param node
 */
function textclass(node) {
    return node.type === 'rv' ? 'rvtext' : 'factext';
}
/**
 * nodename determines the text that is rendered next to a node.
 * @param node
 */
function nodename(node) {
    if (node.type == 'fac') {
        // maybe add extra info (e.g. sel pref fac is reversed)
        let specific = '';
        if (node.specific != null) {
            specific = ' [' + node.specific + ']';
        }
        return node.subtype + specific;
    }
    else {
        // rv
        return node.id;
    }
}
//
// factorgraph-viz
//
// Visualizing factor graphs using d3-force.
//
// author: mbforbes
//
//
// util.ts has a few helper functions, mostly regarding colorizing.
//
/// <reference path="node.ts" />
function argmax(arr) {
    if (arr.length < 1) {
        return -1;
    }
    let max_val = arr[0], max_idx = 0;
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > max_val) {
            max_val = arr[i];
            max_idx = i;
        }
    }
    return max_idx;
}
function color(none, unsureColor, unsureCutoff, values, d) {
    if (d.weights == null) {
        return d3.color(none);
    }
    let max_idx = argmax(d.weights);
    let max_val = d.weights[max_idx];
    // clamp unsure ones to final value (hopefully something like grey)
    if (max_val < unsureCutoff) {
        return d3.color(unsureColor);
    }
    return d3.color(values[argmax(d.weights)]);
}
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
function build(config, data) {
    let svg = d3.select("svg"), width = +svg.attr("width"), height = +svg.attr("height");
    // Debug logging. Can be nice as Chrome's console lets you interactively
    // explore the objects you're getting.
    console.log('Factor graph data:');
    console.log(data);
    function isolate(force, filter) {
        let initialize = force.initialize;
        force.initialize = function () { initialize.call(force, data.nodes.filter(filter)); };
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
        .force('link', d3.forceLink(data.links).id(function (d) { return d.id; }))
        .force('center', isolate(d3.forceCenter(width * centerScale, height / 2), nodefocus))
        .force('left', isolate(d3.forceX(width * leftScale).strength(config.position.leftStrength), nodesubtype(config.position.leftSubtype)))
        .force('right', isolate(d3.forceX(width * rightScale).strength(config.position.rightStrength), nodesubtype(config.position.rightSubtype)))
        .force('up', isolate(d3.forceY(config.position.upScale * height).strength(config.position.upStrength), nodesubtype(config.position.upSubtype)))
        .force('down', isolate(d3.forceY(config.position.downScale * height).strength(config.position.downStrength), nodesubtype(config.position.downSubtype)))
        .force('middle', d3.forceY(height / 2).strength(config.position.middleStrength))
        .on('tick', ticked);
    // use color config we've received to partially bind coloring function
    let colorize = color.bind(null, config.color.none, config.color.unsureColor, config.color.unsureCutoff, config.color.values);
    // new for svg --- create the objects directly; then ticked just modifies
    // their positions rather than drawing them.
    let link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(data.links)
        .enter().append("line")
        .attr("stroke", colorize);
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
            .attr("x1", function (d) { return d.source.x; })
            .attr("y1", function (d) { return d.source.y; })
            .attr("x2", function (d) { return d.target.x; })
            .attr("y2", function (d) { return d.target.y; });
        node
            .attr("cx", function (d) { return d.x; })
            .attr("cy", function (d) { return d.y; });
        fac
            .attr("x", function (d) { return d.x - config.size.factor / 2; })
            .attr("y", function (d) { return d.y - config.size.factor / 2; });
        text
            .attr("transform", function (d) {
            return "translate(" + (d.x + bigger) + "," + (d.y + 10) + ")";
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
}
;
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
function preload(config) {
    // Load the data at the config-specified path. Pass along the config and the
    // loaded data to the build(...) function to construct the graph.
    d3.json(config.data_filename, build.bind(null, config));
}
// execution starts here
d3.json('data/config/default.json', preload);
