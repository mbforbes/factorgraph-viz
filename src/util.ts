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

function color(none: string, unsureColor: string, unsureCutoff: number,
		values: string[], d: FGNode): d3.RGBColor | d3.HSLColor {
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