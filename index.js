const fs = require("fs");
const { METHODS } = require("http");
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
        return +string.substring(0, string.length - 2) * 1000
    }
    if (string.includes('Mi')) {
        return +string.substring(0, string.length - 2)
    }
    return +string.substring(0, string.length)
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

//Check Function

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

        individualContainersRes[docResources[document].metadata.namespace].containers.limits.cpu += parseToInt(docResources[document].spec.template.spec.containers[container].resources.limits.cpu)
        individualContainersRes[docResources[document].metadata.namespace].containers.requests.cpu += parseToInt(docResources[document].spec.template.spec.containers[container].resources.requests.cpu)
        individualContainersRes[docResources[document].metadata.namespace].containers.limits.memory += parseToInt(docResources[document].spec.template.spec.containers[container].resources.limits.memory)
        individualContainersRes[docResources[document].metadata.namespace].containers.requests.memory += parseToInt(docResources[document].spec.template.spec.containers[container].resources.requests.memory)

        totalResources.limits.cpu += limCpu
        totalResources.requests.cpu += reqCpu
        totalResources.limits.memory += limMem
        totalResources.requests.memory += reqMem
    }

    for (let initContainer in docResources[document].spec.template.spec.initContainers) {
        let limCpu = parseToInt(docResources[document].spec.template.spec.initContainers[initContainer].resources.limits.cpu)
        let reqCpu = parseToInt(docResources[document].spec.template.spec.initContainers[initContainer].resources.requests.cpu)
        let limMem = parseToInt(docResources[document].spec.template.spec.initContainers[initContainer].resources.limits.memory)
        let reqMem = parseToInt(docResources[document].spec.template.spec.initContainers[initContainer].resources.requests.memory)

        individualContainersRes[docResources[document].metadata.namespace].totals.limits.cpu += limCpu
        individualContainersRes[docResources[document].metadata.namespace].totals.requests.cpu += reqCpu
        individualContainersRes[docResources[document].metadata.namespace].totals.limits.memory += limMem
        individualContainersRes[docResources[document].metadata.namespace].totals.requests.memory += reqMem

        individualContainersRes[docResources[document].metadata.namespace].initContainers.limits.cpu += parseToInt(docResources[document].spec.template.spec.initContainers[initContainer].resources.limits.cpu)
        individualContainersRes[docResources[document].metadata.namespace].initContainers.requests.cpu += parseToInt(docResources[document].spec.template.spec.initContainers[initContainer].resources.requests.cpu)
        individualContainersRes[docResources[document].metadata.namespace].initContainers.limits.memory += parseToInt(docResources[document].spec.template.spec.initContainers[initContainer].resources.limits.memory)
        individualContainersRes[docResources[document].metadata.namespace].initContainers.requests.memory += parseToInt(docResources[document].spec.template.spec.initContainers[initContainer].resources.requests.memory)

        totalResources.limits.cpu += limCpu
        totalResources.requests.cpu += reqCpu
        totalResources.limits.memory += limMem
        totalResources.requests.memory += reqMem
    }
}

//check function for container, initContainer and totals
function check() {
    console.log("~~~~~~~~~~~~~~~~~~~~STARTING RESOURCE CHECK~~~~~~~~~~~~~~~~~~~~")
    //each namespace
    for (let namespaceRes in individualContainersRes) {
        console.log("Checking " + namespaceRes)
        if (docLimits.namespace[namespaceRes].containers.limit.cpu < individualContainersRes[namespaceRes].containers.limits.cpu) {
            var a = individualContainersRes[namespaceRes].containers.limits.cpu - docLimits.namespace[namespaceRes].containers.limit.cpu
            console.log("CPU limit is " + a + " too high")
            process.exit(1)
        }
        else if (docLimits.namespace[namespaceRes].containers.limit.mem < individualContainersRes[namespaceRes].containers.limits.mem) {
            var a = individualContainersRes[namespaceRes].containers.limits.mem - docLimits.namespace[namespaceRes].containers.limit.mem
            console.log("Memory limit is " + a + "  too high")
            process.exit(1)
        }
        else if (docLimits.namespace[namespaceRes].containers.request.cpu < individualContainersRes[namespaceRes].containers.requests.cpu) {
            var a = individualContainersRes[namespaceRes].containers.requests.cpu - docLimits[namespaceRes].containers.request.cpu
            console.log("CPU request is " + a + " too high")
            process.exit(1)
        }
        else if (docLimits.namespace[namespaceRes].containers.request.mem < individualContainersRes[namespaceRes].containers.requests.mem) {
            var a = individualContainersRes[namespaceRes].containers.requests.mem - docLimits[namespaceRes].containers.request.mem
            console.log("Memory request is " + a + "  too high")
            process.exit(1)
        } else {
            console.log("Total Container Requirements OK!")
        }
        if (docLimits.namespace[namespaceRes].containers.limit.cpu < individualContainersRes[namespaceRes].initContainers.limits.cpu) {
            var a = individualContainersRes[namespaceRes].initContainers.limits.cpu - docLimits[namespaceRes].initContainers.limit.cpu
            console.log("CPU limit is " + a + "  too high")
            process.exit(1)
        }
        else if (docLimits.namespace[namespaceRes].containers.limit.mem < individualContainersRes[namespaceRes].initContainers.limits.mem) {
            var a = individualContainersRes[namespaceRes].initContainers.limits.mem - docLimits[namespaceRes].initContainers.limit.mem
            console.log("Memory limit is " + a + " too high")
            process.exit(1)
        }
        else if (docLimits.namespace[namespaceRes].containers.request.cpu < individualContainersRes[namespaceRes].initContainers.requests.cpu) {
            var a = individualContainersRes[namespaceRes].initContainers.requests.cpu - docLimits[namespaceRes].initContainers.request.cpu
            console.log("CPU request is " + a + " too high")
            process.exit(1)
        }
        else if (docLimits.namespace[namespaceRes].containers.request.mem < individualContainersRes[namespaceRes].initContainers.requests.mem) {
            var a = individualContainersRes[namespaceRes].initContainers.requests.cpu - docLimits[namespaceRes].initContainers.request.cpu
            console.log("Memory request is " + a + " too high")
            process.exit(1)
        }
        else {
            console.log("Total Init Container Requirements OK!")
        }
    }

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
    else if (totalResources.requests.cpu > totalLimits.requests.cpu) {
        var c = totalResources.requests.cpu - totalLimits.requests.cpu
        console.log("CPU request is " + c + " CPU too high")
        process.exit(1)
    }
    else if (totalResources.requests.memory > totalLimits.requests.memory) {
        var d = totalResources.requests.memory - totalLimits.requests.memory
        console.log("Memory is " + d + " too high")
        process.exit(1)
    }
    else {
        console.log("All namespaces")
        console.log("Total Namespace Requirements OK!")
        process.exit(0)
    }
}



// function check() {
//     for (let namespaceRes in individualContainersRes) {
//         console.log(namespaceRes)

//         //each container resources
//         // for (let containerRes in individualContainersRes[namespaceRes].containers) {
//         //     //for (let containerLim in docLimits.namespace[namespaceLi].containers) 
//         //         //console.log(typeof containerRes)
//         console.log(individualContainersRes[namespaceRes].containers)

//     }
// }


check()
