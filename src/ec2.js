// @flow
import type { AWSConfigObject, instanceType } from './types';

type ec2InstanceObjectType = {
  InstanceId:string,
  State:{Name: string},
  InstanceType:string,
  LaunchTime:string,
  Placement: {AvailabilityZone: string},
  PrivateIpAddress:string,
  Tags:Array<{Key :string, Value:string}>
};

type ec2ReservationsObjectType = {
  ReservationId: string,
  OwnerId: string,
  RequesterId: string,
  Groups: Array<any>,
  Instances:Array<ec2InstanceObjectType>
}


type ec2DescribeObjectType = {
  Reservations:Array<ec2ReservationsObjectType>,
}

const AWS = require('aws-sdk');

/*
mapInstances
takes a list of ec2 reservations, and returns all the instances in an array of needed data
*/

const mapInstances = (reservations:ec2DescribeObjectType, config:AWSConfigObject):Array<any> => {
  const instances = [];
  reservations.Reservations.forEach((r) => {
    let name:string;
    let env:string;
    r.Instances.forEach((i) => {
      i.Tags.forEach((tag) => {
        const { Key, Value } = tag;
        if (Key === config.name) {
          name = Value;
        }
        if (Key === config.env) {
          env = Value;
        }
      });

      if (name !== undefined && env !== undefined) {
        const instance:instanceType = {
          name,
          env,
          instanceID: i.InstanceId,
          state: i.State.Name,
          type: i.InstanceType,
          boot: new Date(i.LaunchTime),
          zone: i.Placement.AvailabilityZone,
          ip: i.PrivateIpAddress,
        };
        instances.push(instance);
      }
    });
  });
  return instances;
};


/*
start(config: AWSConfigObject)
Gets all instances from AWS that you have access to seeing.
*/

const start = (config:AWSConfigObject) => (
  new Promise((resolve:Function, reject:Function) => {
    const ec2Config:AWSConfigObject = Object.assign({}, config);
    ec2Config.apiVersion = '2016-11-15';
    const ec2 = new AWS.EC2(ec2Config);
    ec2.describeInstances((err:Object, res:ec2DescribeObjectType) => {
      if (err) {
        reject(err);
      } else {
        const instances:Array<instanceType> = mapInstances(res, config);
        resolve(instances);
      }
    });
  })
);

module.exports = (config: AWSConfigObject, cb: Function) => {
  start(config).then((res:Array<instanceType>) => {
    cb(null, res);
  })
  .catch((e:Object) => {
    cb(e);
  });
};
