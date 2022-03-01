const fs = require("fs");
const yaml = require("js-yaml");
const YAML = require("js-yaml");

try {
    const docLimits = yaml.load(fs.readFileSync('limits.yaml'));
    console.log(docLimits);
  } catch (e) {
    console.log(e);
  }


 
  try {
    const docResources = YAML.loadAll(fs.readFileSync('resources.yaml'));
    console.log(docResources);
  } catch (e) {
    console.log(e);
  }