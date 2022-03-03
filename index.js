const fs = require("fs");
const yaml = require("js-yaml");
const YAML = require("js-yaml");
const docLimits = yaml.load(fs.readFileSync('limits.yaml'));
const docResources = YAML.loadAll(fs.readFileSync('resources.yaml'));

const parseToInt = (string) => {
    if (string.includes('m')) {
        return +string.substring(0, string.length - 1) / 1000
    }
    if (string.includes('Gi')) {
        return +string.substring(0, string.length - 2) * 2000
    }
    if (string.includes('Mi')) {
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
        cpu: docLimits.total.limits.cpu,
        memory: docLimits.total.limits.mem
    },
    requests: {
        cpu: docLimits.total.request.cpu,
        memory: docLimits.total.request.mem
    }
}

let individualContainers = {

}

for (let document in docResources) {
    for (let container in docResources[document].spec.template.spec.containers) {

        let limCpu = parseToInt(docResources[document].spec.template.spec.containers[container].resources.limits.cpu)
        let reqCpu = parseToInt(docResources[document].spec.template.spec.containers[container].resources.requests.cpu)
        let limMem = parseToInt(docResources[document].spec.template.spec.containers[container].resources.limits.memory)
        let reqMem = parseToInt(docResources[document].spec.template.spec.containers[container].resources.requests.memory)

        if (!individualContainers[docResources[document].metadata.namespace]) {
            individualContainers[docResources[document].metadata.namespace] = {
                totals: {
                    limits: {
                        cpu: 0,
                        memory: 0
                    },
                    requests: {
                        cpu: 0,
                        memory: 0
                    }
                },
                containers: {
                    limits: {
                        cpu: 0,
                        memory: 0
                    },
                    requests: {
                        cpu: 0,
                        memory: 0
                    }
                },
                initcontainers: {
                    limits: {
                        cpu: 0,
                        memory: 0
                    },
                    requests: {
                        cpu: 0,
                        memory: 0
                    }
                }

            }
        }

        individualContainers[docResources[document].metadata.namespace].totals.limits.cpu += limCpu
        individualContainers[docResources[document].metadata.namespace].totals.requests.cpu += reqCpu
        individualContainers[docResources[document].metadata.namespace].totals.limits.mem += limMem
        individualContainers[docResources[document].metadata.namespace].totals.requests.mem += reqMem


        totals.limits.cpu += limCpu
        totals.requests.cpu += reqCpu
        totals.limits.memory += limMem
        totals.requests.memory += reqMem



    }
    for (let initcontainer in docResources[document].spec.template.spec.initcontainers) {
        totals.limits.cpu += parseToInt(docResources[document].spec.template.spec.initcontainers[initcontainer].resources.limits.cpu)
        totals.requests.cpu += parseToInt(docResources[document].spec.template.spec.initcontainers[initcontainer].resources.requests.cpu)
        totals.limits.memory += parseToInt(docResources[document].spec.template.spec.initcontainers[initcontainer].resources.limits.memory)
        totals.requests.memory += parseToInt(docResources[document].spec.template.spec.initcontainers[initcontainer].resources.requests.memory)
    }

}
console.log(totals)
console.log(limitsTotal)
console.log(individualContainers)

function check() {
    if (totals.limits.cpu > limitsTotal.limits.cpu) {
        var a = total.limits.cpu - limitsTotal.limits.cpu
        console.log("CPU limit is" + a.value + "too high")
    }
    else if (totals.limits.memory > limitsTotal.limits.memory) {
        var b = total.limits.memory - limitsTotal.limits.memory
        console.log("Memory limit is" + b.value + "too high")
    }
    else if (totals.requests.cpu > limitsTotal.requests.cpu) {
        var c = total.requests.cpu - limitsTotal.requests.cpu
        console.log("CPU request is" + c.value + "too high")
    }
    else if (totals.requests.memory > limitsTotal.requests.memory) {
        var d = total.requests.memory - limitsTotal.requests.memory
        console.log("Memory is" + d.value + "too high")
    } 
    else { console.log("Total minimum requirements OK!") }
}
check()