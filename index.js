const fs = require("fs");
const yaml = require("js-yaml");
const YAML = require("js-yaml");
const myArgs = process.argv.slice(2);
console.log('myArgs: ', myArgs);
const docLimits = yaml.load(fs.readFileSync(myArgs[0])); 

const docResources = YAML.loadAll(fs.readFileSync(myArgs[1]));



console.log('myArgs: ', myArgs);

let test = [
    {
        will: "you",
        get: {
            this: [{one: "though?"}]
        }
    }
]

        console.log(test[0].get.this[0].one)
  



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

        
//namespace totals
        individualContainers[docResources[document].metadata.namespace].totals.limits.cpu += limCpu
        individualContainers[docResources[document].metadata.namespace].totals.requests.cpu += reqCpu
        individualContainers[docResources[document].metadata.namespace].totals.limits.mem += limMem
        individualContainers[docResources[document].metadata.namespace].totals.requests.mem += reqMem

//total totals
        totals.limits.cpu += limCpu
        totals.requests.cpu += reqCpu
        totals.limits.memory += limMem
        totals.requests.memory += reqMem
        
//namespace container totals
        individualContainers[docResources[document].metadata.namespace].containers.limits.cpu += limCpu
        individualContainers[docResources[document].metadata.namespace].containers.requests.cpu += reqCpu
        individualContainers[docResources[document].metadata.namespace].containers.limits.mem += limMem
        individualContainers[docResources[document].metadata.namespace].containers.requests.mem += reqMem



    }
    for (let initcontainer in docResources[document].spec.template.spec.initContainers) {
      let limCpu = parseToInt(docResources[document].spec.template.spec.initContainers[initcontainer].resources.limits.cpu)
        let reqCpu = parseToInt(docResources[document].spec.template.spec.initContainers[initcontainer].resources.requests.cpu)
        let limMem = parseToInt(docResources[document].spec.template.spec.initContainers[initcontainer].resources.limits.memory)
        let reqMem = parseToInt(docResources[document].spec.template.spec.initContainers[initcontainer].resources.requests.memory)

        
//namespace totals
        individualContainers[docResources[document].metadata.namespace].totals.limits.cpu += limCpu
        individualContainers[docResources[document].metadata.namespace].totals.requests.cpu += reqCpu
        individualContainers[docResources[document].metadata.namespace].totals.limits.mem += limMem
        individualContainers[docResources[document].metadata.namespace].totals.requests.mem += reqMem

//total totals
        totals.limits.cpu += limCpu
        totals.requests.cpu += reqCpu
        totals.limits.memory += limMem
        totals.requests.memory += reqMem
        
//namespace container totals
        individualContainers[docResources[document].metadata.namespace].initContainers.limits.cpu += limCpu
        individualContainers[docResources[document].metadata.namespace].initContainers.requests.cpu += reqCpu
        individualContainers[docResources[document].metadata.namespace].initContainers.limits.mem += limMem
        individualContainers[docResources[document].metadata.namespace].initContainers.requests.mem += reqMem



    }
    
   


}
console.log(totals)
console.log(limitsTotal)
console.log(JSON.stringify(individualContainers, null, 2))

function check() {
    if (totals.limits.cpu > limitsTotal.limits.cpu) {
        var a = totals.limits.cpu - limitsTotal.limits.cpu
        console.log("CPU limit is " + a + " CPU too high")
        process.exit(1)
    }
    else if (totals.limits.memory > limitsTotal.limits.memory) {
        var b = totals.limits.memory - limitsTotal.limits.memory
        console.log("Memory limit is " + b + " too high")
        process.exit(1)
    }
    else if (totals.requests.cpu > limitsTotal.requests.cpu) {
        var c = totals.requests.cpu - limitsTotal.requests.cpu
        console.log("CPU request is " + c + " CPU too high")
        process.exit(1)
    }
    else if (totals.requests.memory > limitsTotal.requests.memory) {
        var d = totals.requests.memory - limitsTotal.requests.memory
        console.log("Memory is " + d + " too high")
        process.exit(1)
    }
    else { console.log("Total minimum requirements OK!") 
    process.exit(0)}
}
check()


  