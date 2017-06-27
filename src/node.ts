//
// factorgraph-viz
//
// Visualizing factor graphs using d3-force.
//
// author: mbforbes
//

//
// node.ts defines the node type (FGNode) and accessor functions used in factor
// graph construction.
//

type FGNode = {
	// Nodes must have an id (for use by d3-force) and a type (for us to
	// distinguish RVs vs factors).
	id: string,
	type: string,

	// Nodes should have weights so we know how to color them! But it is
	// technically optional.
	weights?: number[],

	// Nodes can have additional properties to narrow down the type. These are
	// subtype (more granular) and specific (the most granular).
	subtype?: string,
	specific?: string,

	// If a node has the "focus" property, it will be rendered more in the
	// center of the graph.
	focus?: boolean,
}

/**
 * nodetype returns a function that will take FGNodes as arguments and return
 * whether they match the desired type.
 * @param desired
 */
function nodetype(desired: string): (FGNode) => boolean {
	return function(node: FGNode): boolean {
		return node.type === desired;
	}
}

/**
 * nodesubtype returns a function that will take FGNodes as arguments and return
 * whether they match the desired subtype.
 * @param desired
 */
function nodesubtype(desired: string): (FGNode) => boolean {
	return function(node: FGNode): boolean {
		// TODO: do we want to check the node's focus?
		// let focus = node.focus || false;
		let focus = false;
		return (!focus) && node.subtype === desired;
	}
}

/**
 * nodefocus returns whether a node is the node to focus on visually.
 * @param node
 */
function nodefocus(node: FGNode): boolean {
	return node.focus || false;
}

/**
 * textclass returns the class that should be applied to the text surrounding
 * the provided node.
 * @param node
 */
function textclass(node: FGNode): string {
	return node.type === 'rv' ? 'rvtext' : 'factext';
}

/**
 * nodename determines the text that is rendered next to a node.
 * @param node
 */
function nodename(node: FGNode): string {
	if (node.type == 'fac') {
		// maybe add extra info (e.g. sel pref fac is reversed)
		let specific = '';
		if (node.specific != null) {
			specific = ' [' + node.specific + ']';
		}
		return node.subtype + specific;
	} else {
		// rv
		return node.id;
	}
}