const fs = require("fs");
const yaml = require("js-yaml");
const YAML = require("js-yaml");
const resourceChecker = require("resource-checker");
const myArgs = process.argv.slice(2);
console.log('myArgs: ', myArgs);
const docLimits = yaml.load(fs.readFileSync(myArgs[0]));
const docResources = YAML.loadAll(fs.readFileSync(myArgs[1]));

//Convert Data Type
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

//Check Function
function check() {
    if (totalResources.limits.cpu > totalLimits.limits.cpu) {
        var a = totalResources.limits.cpu - totalLimits.limits.cpu
        console.log("CPU limit is " + a + " CPU too high")
        process.exit(1)
    }
    else if (totalResources.limits.memory > totalLimits.limits.memory) {
        var b = totalResources.limits.memory - totalLimits.limits.memory
        console.log("Memory limit is " + b + " too high")
        process.exit(1)
    }
    else if (totalR.requests.cpu > totalLimits.requests.cpu) {
        var c = totalResources.requests.cpu - totalLimits.requests.cpu
        console.log("CPU request is " + c + " CPU too high")
        process.exit(1)
    }
    else if (totalR.requests.memory > totalLimits.requests.memory) {
        var d = totalResources.requests.memory - totalLimits.requests.memory
        console.log("Memory is " + d + " too high")
        process.exit(1)
    }
    else {
        console.log("Total minimum requirements OK!")
        process.exit(0)
    }
}

//Total Resources
let totalResources = {
    limits: {
        cpu: 0,
        memory: 0
    },
    requests: {
        cpu: 0,
        memory: 0
    }
}

//Total Limits
let totalLimits = {
    limits: {
        cpu: docLimits.total.limit.cpu,
        memory: docLimits.total.limit.mem
    },
    requests: {
        cpu: docLimits.total.request.cpu,
        memory: docLimits.total.request.mem
    }
};

//Each Namespace Resources
let individualContainersRes = {}
for (let document in docResources) {
    if (!individualContainersRes[docResources[document].metadata.namespace]) {
        individualContainersRes[docResources[document].metadata.namespace] = {
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
            initContainers: {
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

    for (let container in docResources[document].spec.template.spec.containers) {
        let limCpu = parseToInt(docResources[document].spec.template.spec.containers[container].resources.limits.cpu)
        let reqCpu = parseToInt(docResources[document].spec.template.spec.containers[container].resources.requests.cpu)
        let limMem = parseToInt(docResources[document].spec.template.spec.containers[container].resources.limits.memory)
        let reqMem = parseToInt(docResources[document].spec.template.spec.containers[container].resources.requests.memory)

        individualContainersRes[docResources[document].metadata.namespace].totals.limits.cpu += limCpu
        individualContainersRes[docResources[document].metadata.namespace].totals.requests.cpu += reqCpu
        individualContainersRes[docResources[document].metadata.namespace].totals.limits.memory += limMem
        individualContainersRes[docResources[document].metadata.namespace].totals.requests.memory += reqMem

        totalResources.limits.cpu += limCpu
        totalResources.requests.cpu += reqCpu
        totalResources.limits.memory += limMem
        totalResources.requests.memory += reqMem
    }

    for (let initContainer in docResources[document].spec.template.spec.containers) {
        let limCpu = parseToInt(docResources[document].spec.template.spec.containers[initContainer].resources.limits.cpu)
        let reqCpu = parseToInt(docResources[document].spec.template.spec.containers[initContainer].resources.requests.cpu)
        let limMem = parseToInt(docResources[document].spec.template.spec.containers[initContainer].resources.limits.memory)
        let reqMem = parseToInt(docResources[document].spec.template.spec.containers[initContainer].resources.requests.memory)

        individualContainersRes[docResources[document].metadata.namespace].totals.limits.cpu += limCpu
        individualContainersRes[docResources[document].metadata.namespace].totals.requests.cpu += reqCpu
        individualContainersRes[docResources[document].metadata.namespace].totals.limits.memory += limMem
        individualContainersRes[docResources[document].metadata.namespace].totals.requests.memory += reqMem

        totalResources.limits.cpu += limCpu
        totalResources.requests.cpu += reqCpu
        totalResources.limits.memory += limMem
        totalResources.requests.memory += reqMem
    }
}

console.log(totalResources)
console.log(totalLimits)

//Each Namespace Limits
let individualContainersLim = {}
for (let document in docLimits) {
    if (!individualContainersLim[docLimits[document].namespace]) {
        individualContainersLim[docLimits[document].namespace] = {
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
            initContainers: {
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
    for (let container in docLimits.namespace) {
        let limCpu = parseToInt(docLimits.namespace[container].containers.limits.cpu)
        let reqCpu = parseToInt(docLimits.namespace[container].template.containers[container].resources.requests.cpu)
        let limMem = parseToInt(docLimits.namespace[container].template.containers[container].resources.limits.memory)
        let reqMem = parseToInt(docLimits.namespace[container].template.spec.containers[container].resources.requests.memory)

        individualContainersLim[docLimits.metadata.namespace].totals.limits.cpu += limCpu
        individualContainersLim[docLimits.metadata.namespace].totals.requests.cpu += reqCpu
        individualContainersLim[docLimits.metadata.namespace].totals.limits.memory += limMem
        individualContainersLim[docLimits.metadata.namespace].totals.requests.memory += reqMem

        //totalResources.limits.cpu += limCpu
        //totalResources.requests.cpu += reqCpu
        //totalResources.limits.memory += limMem
        //totalResources.requests.memory += reqMem
    }

    for (let initContainer in docLimits.namespace) {
        let limCpu = parseToInt(docLimits.spec.template.spec.containers[initContainer].resources.limits.cpu)
        let reqCpu = parseToInt(docLimits.spec.template.spec.containers[initContainer].resources.requests.cpu)
        let limMem = parseToInt(docLimits.spec.template.spec.containers[initContainer].resources.limits.memory)
        let reqMem = parseToInt(docLimits.spec.template.spec.containers[initContainer].resources.requests.memory)

        individualContainersLim[docLimits.metadata.namespace].totals.limits.cpu += limCpu
        individualContainersLim[docLimits.metadata.namespace].totals.requests.cpu += reqCpu
        individualContainersLim[docLimits.metadata.namespace].totals.limits.memory += limMem
        individualContainersLim[docLimits.metadata.namespace].totals.requests.memory += reqMem

        //totalResources.limits.cpu += limCpu
        //totalResources.requests.cpu += reqCpu
        //totalResources.limits.memory += limMem
        //totalResources.requests.memory += reqMem
    }
}



for (let document in docLimits) {
    for (let container in docLimits[document].spec.template.spec.containers) {
        individualContainersLim[docLimits[document].metadata.namespace].containers.limits.cpu += parseToInt(docLimits[document].spec.template.spec.containers[container].resources.limits.cpu)
        individualContainersLim[docLimits[document].metadata.namespace].containers.requests.cpu += parseToInt(docLimits[document].spec.template.spec.containers[container].resources.requests.cpu)
        individualContainersLim[docLimits[document].metadata.namespace].containers.limits.memory += parseToInt(docLimits[document].spec.template.spec.containers[container].resources.limits.memory)
        individualContainersLim[docLimits[document].metadata.namespace].containers.requests.memory += parseToInt(docLimits[document].spec.template.spec.containers[container].resources.requests.memory)
    }
    for (let initContainer in docLimits[document].spec.template.spec.initContainers) {
        individualContainersLim[docLimits[document].metadata.namespace].initContainers.limits.cpu += parseToInt(docLimits[document].spec.template.spec.initContainers[initContainer].resources.limits.cpu)
        individualContainersLim[docLimits[document].metadata.namespace].initContainers.requests.cpu += parseToInt(docLimits[document].spec.template.spec.initContainers[initContainer].resources.requests.cpu)
        individualContainersLim[docLimits[document].metadata.namespace].initContainers.limits.memory += parseToInt(docLimits[document].spec.template.spec.initContainers[initContainer].resources.limits.memory)
        individualContainersLim[docLimits[document].metadata.namespace].initContainers.requests.memory += parseToInt(docLimits[document].spec.template.spec.initContainers[initContainer].resources.requests.memory)
    }
}

for (let namespace in docLimits.namespace) {




}
console.log(individualContainersRec)
console.log(individualContainersRec.namespace1)
console.log(individualContainersRec.namespace2)

check()
