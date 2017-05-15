// @flow
import type { AWSConfigObject, elbServiceObject, instanceType } from './types';

const getEC2 = require('./ec2');
const getELB = require('./elb');
const getCloudwatch = require('./cloudwatch');
const sortServices = require('./services');
const getSQS = require('./sqs');

module.exports = class Status {
  config: AWSConfigObject;

  constructor(config: AWSConfigObject) {
    this.config = config;
  }

  status(cb:Function) {
    if (cb === undefined) {
      return new Promise((resolve, reject) => {
        this.getEC2((err:Object, ec2result: Array<instanceType>) => {
          this.getCloudwatch(ec2result, (cwError:Object, cwResult: Array<instanceType>) => {
            this.getELB((elbError:Object, elbResult:Array<elbServiceObject>) => {
              const services = sortServices({ ec2: cwResult, elb: elbResult });
              if (err) {
                reject(err);
              } else {
                resolve(services);
              }
            });
          });
        });
      });
    } else {
      this.getEC2((err:Object, ec2result: Array<instanceType>) => {
        this.getCloudwatch(ec2result, (cwError:Object, cwResult: Array<instanceType>) => {
          this.getELB((elbError:Object, elbResult:Array<elbServiceObject>) => {
            const services = sortServices({ ec2: cwResult, elb: elbResult });
            cb(null, services);
          });
        });
      });
    }
  }

  getEC2(cb: Function) {
    getEC2(this.config, cb);
  }

  getELB(cb: Function) {
    getELB(this.config, cb);
  }

  getCloudwatch(services:Array<instanceType>, cb: Function) {
    getCloudwatch(this.config, services, cb);
  }

  getSQS(queueUrl: string, cb: Function) {
    if (cb !== undefined) {
      getSQS(this.config, queueUrl, cb);
    } else {
      return new Promise((resolve, reject) => {
        if (queueUrl === undefined) {
          reject(new Error('No Queue URL Found'));
        }
        getSQS(this.config, queueUrl, (err, res) => {
          if (err) { reject(err); }
          resolve(res);
        });
      });
    }
  }
};
