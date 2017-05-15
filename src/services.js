// @flow
import type { elbServiceObject, serviceObject, instanceType, elbServiceObjectType } from './types';

/*
addELB
Add ELB Info to Instances
*/

const findELB = (name, elbs):elbServiceObjectType|void => {
  let found;
  elbs.forEach((elb) => {
    if (elb.name === name) {
      found = elb;
    }
  });
  return found;
};

const addELB = (services, elbs) => (
  services.map((service) => {
    const newService = Object.assign({}, service);
    newService.instances = service.instances.map((instance) => {
      const newInstance = Object.assign({}, instance);
      const elb = findELB(instance.instanceID, elbs);
      if (elb === undefined) {
        // do nothing
      } else if (elb.Scheme === 'internet-facing') {
        newService.external = {
          dns: elb.DNSName,
          name: elb.elb,
        };
        newInstance.health = elb.health;
      } else {
        newService.internal = {
          dns: elb.DNSName,
          name: elb.elb,
        };
        newInstance.health = elb.health;
      }
      return newInstance;
    });
    return newService;
  })
);

/*
checkIfServiceExists
Checks to see if you service already exists
*/

const checkIfServiceExists = (name:string, services:Array<serviceObject>):boolean|number => {
  let found = false;
  services.forEach((q, r) => {
    if (q.name === name) found = r;
  });
  return found;
};

/*
sortInstances
Checks through your instances and groups them together with the a common name
*/

const sortInstances = (instances:Array<instanceType>):Array<serviceObject> => {
  const services:Array<serviceObject> = [];
  instances.forEach((r) => {
    const row = checkIfServiceExists(r.name, services);
    if (row === false) {
      const service:serviceObject = {
        name: r.name,
        instances: [r],
      };
      services.push(service);
    } else if (typeof row === 'number') {
      services[row].instances.push(r);
    }
  });
  return services;
};

module.exports = (stack:{
  ec2:Array<instanceType>, elb:Array<elbServiceObject>
}):Array<serviceObject> => {
  let services = sortInstances(stack.ec2);
  if (stack.elb) {
    services = addELB(services, stack.elb);
  }
  return services;
};
