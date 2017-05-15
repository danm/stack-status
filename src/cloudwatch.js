// @flow

import type { AWSConfigObject, instanceType } from './types';

type cloudWatchObjectType = {
  Datapoints: Array<{Maximum:number}>
};

const AWS = require('aws-sdk');

const getCloudWatchStatus = (instance, cloudwatch) => (
  new Promise((resolve:Function, reject:Function) => {
    const start = new Date();
    start.setMinutes(start.getMinutes() - 5);

    const req: {
      StartTime: Object,
      EndTime: Object,
      MetricName: string,
      Namespace: string,
      Period: number,
      Dimensions: Array<{Name:string, Value:string}>,
      Statistics: Array<string>,
    } = {
      StartTime: start,
      EndTime: new Date(),
      MetricName: 'CPUUtilization',
      Namespace: 'AWS/EC2',
      Period: 300,
      Dimensions: [
        {
          Name: 'InstanceId',
          Value: instance.instanceID,
        },
      ],
      Statistics: [
        'Maximum',
      ],
    };

    cloudwatch.getMetricStatistics(req, (err: Object, res: cloudWatchObjectType) => {
      if (err) {
        reject(err);
      } else {
        const newInstance:instanceType = Object.assign({}, instance);
        if (res.Datapoints[0] && res.Datapoints[0].Maximum) {
          newInstance.cpu = res.Datapoints[0].Maximum;
        }
        resolve(newInstance);
      }
    });
  })
);

const start = (config:AWSConfigObject, instances: Array<instanceType>) => (
  new Promise((resolve:Function, reject:Function) => {
    const promises = [];
    const newInstances:Array<instanceType> = [];
    const cloudwatchConfig:AWSConfigObject = Object.assign({}, config);
    cloudwatchConfig.apiVersion = '2010-08-01';
    const cloudwatch: Function = new AWS.CloudWatch(cloudwatchConfig);

    instances.forEach((instance) => {
      const cwPromise = getCloudWatchStatus(instance, cloudwatch)
      .then((newInstance:instanceType) => {
        newInstances.push(newInstance);
      });
      promises.push(cwPromise);
    });

    Promise.all(promises).then(() => {
      resolve(newInstances);
    }).catch((err) => {
      reject(err);
    });
  })
);

module.exports = (config: AWSConfigObject, instances:Array<instanceType>, cb: Function) => {
  start(config, instances).then((res:Array<instanceType>) => {
    cb(null, res);
  })
  .catch((e:Object) => {
    cb(e);
  });
};
