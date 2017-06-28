const Validator = require('jsonschema').Validator;
const fs = require('fs');
let fn_schema = process.argv[2];
let fn_json = process.argv[3];
console.log('Using schema file: ' + fn_schema);
console.log('Using json file:   ' + fn_json);
let schema = JSON.parse(fs.readFileSync(fn_schema, 'utf-8'));
let json = JSON.parse(fs.readFileSync(fn_json, 'utf-8'));
// let metaSchema = JSON.parse(fs.readFileSync('data/schema/meta-schema.json', 'utf-8'));
// let schema = JSON.parse(fs.readFileSync('data/schema/factorgraph.json', 'utf-8'));
// let valid = JSON.parse(fs.readFileSync('data/examples/size-threw_d.json', 'utf-8'));
// let invalid = JSON.parse(fs.readFileSync('data/examples/playing.json', 'utf-8'));
let v = new Validator();
// let instance = 4;
// let schema = {"type": "number"};
let res = v.validate(json, schema);
if (res.errors.length == 0) {
    console.log('Validation passed');
}
else {
    console.log('Validation failed. Errors:');
    for (let error of res.errors) {
        console.log(error);
    }
}
