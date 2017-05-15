// @flow

import type { AWSConfigObject, serviceObject, elbServiceObjectType } from './types';


type elbInstanceealthObjectType = {
  InstanceId: string,
  State: string,
  ReasonCode: string,
  Description: string,
};

type elbDescribeInstanceHealthObjectType = {
  InstanceStates:Array<elbInstanceealthObjectType>,
};

type elbDescriptionType = {
  LoadBalancerName: string,
  DNSName: string,
  Scheme: string,
};

type elbObjectType = {
  ResponseMetadata: { RequestId: string },
  LoadBalancerDescriptions: Array<elbDescriptionType>,
};

const AWS = require('aws-sdk');

/*
getHealth
Get the health of the Instances
*/

const getHealth = (i:string, elb:Function) => (
  new Promise((resolve, reject) => {
    elb.describeInstanceHealth({ LoadBalancerName: i },
    (err: Object, res: elbDescribeInstanceHealthObjectType) => {
      if (err) reject(err);
      resolve(res.InstanceStates);
    });
  })
);

/*
getGetInstances
Get all the Instances which are assosiated with the ELBs
*/

const getGetInstances = (elbs:elbObjectType, elb:Function):Object => {
  const promises = [];
  return new Promise((resolve) => {
    const services = [];
    elbs.LoadBalancerDescriptions.forEach((row) => {
      const healthPromise = getHealth(row.LoadBalancerName, elb).then((r) => {
        r.forEach((instance) => {
          const service: elbServiceObjectType = {
            elb: row.LoadBalancerName,
            name: instance.InstanceId,
            health: instance.State,
            DNSName: row.DNSName,
            Scheme: row.Scheme,
          };
          services.push(service);
        });
      });
      promises.push(healthPromise);
    });

    Promise.all(promises).then(() => {
      resolve(services);
    });
  });
};

/*
start
Get all the ELBs
*/

const start = (config:AWSConfigObject) => (
  new Promise((resolve:Function, reject:Function) => {
    const elbConfig:AWSConfigObject = Object.assign({}, config);
    elbConfig.apiVersion = '2012-06-01';
    const elb = new AWS.ELB(elbConfig);
    elb.describeLoadBalancers((err:Object, res:elbObjectType) => {
      if (err) {
        reject(err);
      } else {
        getGetInstances(res, elb).then((result) => {
          resolve(result);
        })
        .catch((finalError) => {
          reject(finalError);
        });
      }
    });
  })
);

module.exports = (config: AWSConfigObject, cb: Function) => {
  start(config).then((res:serviceObject) => {
    cb(null, res);
  })
  .catch((e:Object) => {
    cb(e);
  });
};
