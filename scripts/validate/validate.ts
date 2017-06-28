//
// factorgraph-viz
//
// Visualizing factor graphs using d3-force.
//
// author: mbforbes
//

//
// validate.ts is a tiny wrapper around the `jsonschema` library to validate
// schemas on the command line using node.js.
//

//
// usage:
//     node build/validator.js <schema_file> <dir_or_json_file>
//

const Validator = require('jsonschema').Validator;
const fs = require('fs');
const path = require('path');

const fn_schema = process.argv[2];
const json = process.argv[3];

// build the list of json_fns based on what was passed as json
const json_fns = [];
const stat = fs.statSync(json);
if (stat.isFile()) {
    // it's a file; we'll just check one file.
    json_fns.push(json);
} else if (stat.isDirectory()) {
    // it's a directory; we'll check every file in the directory.
    const fns = fs.readdirSync(json);
    for (const fn of fns) {
        json_fns.push(path.join(json, fn));
    }
} else {
    // 'json' not a directory or file.
    console.error('Provided json must be file or directory.')
    process.exit(1);
}

// build our validator and load our schema
const v = new Validator();
const schema = JSON.parse(fs.readFileSync(fn_schema, 'utf-8'));
console.log('Using schema file: ' + fn_schema)

// check all json files desired
let exit_code = 0;
for (const json_fn of json_fns) {
    console.log('Checking json file: ' + json_fn)
    const json = JSON.parse(fs.readFileSync(json_fn, 'utf-8'));
    const res = v.validate(json, schema);
    if (res.errors.length == 0) {
        console.log('Result: passed');
    } else {
        exit_code = 1;
        console.log('Result: failed. Errors:');
        for (const error of res.errors) {
            console.error(error)
        }
    }
}

process.exit(exit_code);