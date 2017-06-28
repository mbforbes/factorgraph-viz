#!/bin/bash

#
# factorgraph-viz
#
# Visualizing factor graphs using d3-force.
#
# author: mbforbes
#

#
# This "test" is just a sanity check for the repository! It doesn't test the
# code, it merely validates the json schema and uses the json schema to validate
# the example json files.
#

# exit script on error
set -e

# validate the factor graph schema with the meta-schema
node build/validator.js data/schema/meta-schema.json data/schema/factorgraph.json

# validate all of the provided examples with the factor graph schema
node build/validator.js data/schema/factorgraph.json data/examples/