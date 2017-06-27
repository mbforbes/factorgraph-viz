// glooobbaaalllsss
let svg = d3.select("svg"), width = +svg.attr("width"), height = +svg.attr("height");
console.log('width: ' + width + ' ' + typeof width);
console.log('height: ' + height + ' ' + typeof height);
let facsize = 6;
// exceptions are the special node, which always returns false
function nodesubtype(desired) {
    return function (node) {
        // let focus = node.focus || false;
        let focus = false;
        return (!focus) && node.subtype === desired;
    };
}
function nodefocus(node) {
    return node.focus || false;
}
function textclass(d) {
    return d.type === 'rv' ? 'rvtext' : 'factext';
}
function nodetype(desired) {
    return function (node) {
        return node.type === desired;
    };
}
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
let colors = [
    d3.color('tomato'),
    d3.color('royalblue'),
    d3.color('lightslategray'),
];
function color(d) {
    if (d.weights == null) {
        return d3.color('whitesmoke');
    }
    let max_idx = argmax(d.weights);
    let max_val = d.weights[max_idx];
    // clamp unsure ones to gray
    if (max_val < 0.4) {
        return colors[2];
    }
    return colors[argmax(d.weights)];
}
function nodename(d) {
    if (d.type == 'fac') {
        // maybe add extra info (e.g. sel pref fac is reversed)
        let specific = '';
        if (d.specific != null) {
            specific = ' [' + d.specific + ']';
        }
        return d.subtype + specific;
    }
    else {
        // rv
        return d.id;
    }
}
function build(data) {
    console.log('Got data:');
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
    let leftScale = 0 / 6;
    let rightScale = 5 / 6;
    let centerScale = 1 / 3;
    let sim = d3.forceSimulation(data.nodes)
        .force('charge', d3.forceManyBody().strength(-500))
        .force('link', d3.forceLink(data.links).id(function (d) { return d.id; }))
        .force('center', isolate(d3.forceCenter(width * centerScale, height / 2), nodefocus))
        .force('left', isolate(d3.forceX(width * leftScale).strength(0.7), nodesubtype('frame')))
        .force('right', isolate(d3.forceX(width * rightScale).strength(0.7), nodesubtype('noun')))
        .force('up', isolate(d3.forceY(0).strength(0.1), nodesubtype('seed')))
        .force('down', isolate(d3.forceY(height).strength(0.1), nodesubtype('xfactor')))
        .force('middle', d3.forceY(height / 2).strength(0.1))
        .on('tick', ticked);
    // new for svg --- create the objects directly; then ticked just modifies
    // their positions rather than drawing them.
    let link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(data.links)
        .enter().append("line")
        .attr("stroke", color);
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
        .attr("r", 30)
        .attr("fill", color)
        .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
    let fac = svg.append("g")
        .attr("class", "facs")
        .selectAll("rect")
        .data(data.nodes.filter(nodetype('fac')))
        .enter().append("rect")
        .attr("fill", color)
        .attr("width", facsize)
        .attr("height", facsize)
        .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
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
            .attr("x", function (d) { return d.x - facsize / 2; })
            .attr("y", function (d) { return d.y - facsize / 2; });
        text
            .attr("transform", function (d) {
            return "translate(" + (d.x + 5) + "," + (d.y + 5) + ")";
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
}
;
// execution starts here
d3.json('data/examples/weight-king_vs_ship.json', build);
