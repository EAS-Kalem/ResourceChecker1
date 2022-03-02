const fs = require("fs");
const yaml = require("js-yaml");
const YAML = require("js-yaml");
const docLimits = yaml.load(fs.readFileSync('limits.yaml'));
const docResources = YAML.loadAll(fs.readFileSync('resources.yaml'));

const parseToInt = (string) => {
    if(string.includes('m')){
        return +string.substring(0, string.length - 1) / 1000
    }
    if(string.includes('Gi')){
        return +string.substring(0, string.length - 2) * 2000
    }
    if(string.includes('Mi')){
        return +string.substring(0, string.length - 2) 
    }
    return +string.substring(0, string.length) 
}

let totals = {
    limits: {
        cpu: 0,
        memory: 0
    },
    requests: {
        cpu: 0,
        memory: 0
    }
}

let limitsTotal = {
    limits: {
        cpu: 0,
        memory: 0
    },
    requests: {
        cpu: 0,
        memory: 0
    }
}


    limitsTotal.limits.cpu = docLimits.total.limits.cpu 
    limitsTotal.limits.memory = docLimits.total.limits.mem
    limitsTotal.requests.cpu = docLimits.total.request.cpu
    limitsTotal.requests.memory = docLimits.total.request.mem



for (let document in docResources) {
    for (let container in docResources[document].spec.template.spec.containers) {
        totals.limits.cpu += parseToInt(docResources[document].spec.template.spec.containers[container].resources.limits.cpu)
        totals.requests.cpu += parseToInt(docResources[document].spec.template.spec.containers[container].resources.requests.cpu)
    }
    for (let initcontainer in docResources[document].spec.template.spec.initcontainers) {
        totals.limits.cpu += parseToInt(docResources[document].spec.template.spec.initcontainers[initcontainer].resources.limits.cpu)
        totals.requests.cpu += parseToInt(docResources[document].spec.template.spec.initcontainers[initcontainer].resources.requests.cpu)
    }
    for (let container in docResources[document].spec.template.spec.containers) {
        totals.limits.memory += parseToInt(docResources[document].spec.template.spec.containers[container].resources.limits.memory)
        totals.requests.memory += parseToInt(docResources[document].spec.template.spec.containers[container].resources.requests.memory)
    }
    for (let initcontainer in docResources[document].spec.template.spec.initcontainers) {
        totals.limits.memory += parseToInt(docResources[document].spec.template.spec.initcontainers[initcontainer].resources.limits.memory)
        totals.requests.memory += parseToInt(docResources[document].spec.template.spec.initcontainers[initcontainer].resources.requests.memory)
    }
}
console.log(totals)
console.log(limitsTotal)

