

const getEC2 = require('./ec2');

const getELB = require('./elb');
const getCloudwatch = require('./cloudwatch');
const sortServices = require('./services');
const getSQS = require('./sqs');

module.exports = class Status {

  constructor(config) {
    this.config = config;
  }

  status(cb) {
    if (cb === undefined) {
      return new Promise((resolve, reject) => {
        this.getEC2((err, ec2result) => {
          this.getCloudwatch(ec2result, (cwError, cwResult) => {
            this.getELB((elbError, elbResult) => {
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
      this.getEC2((err, ec2result) => {
        this.getCloudwatch(ec2result, (cwError, cwResult) => {
          this.getELB((elbError, elbResult) => {
            const services = sortServices({ ec2: cwResult, elb: elbResult });
            cb(null, services);
          });
        });
      });
    }
  }

  getEC2(cb) {
    getEC2(this.config, cb);
  }

  getELB(cb) {
    getELB(this.config, cb);
  }

  getCloudwatch(services, cb) {
    getCloudwatch(this.config, services, cb);
  }

  getSQS(queueUrl, cb) {
    if (cb !== undefined) {
      getSQS(this.config, queueUrl, cb);
    } else {
      return new Promise((resolve, reject) => {
        if (queueUrl === undefined) {
          reject(new Error('No Queue URL Found'));
        }
        getSQS(this.config, queueUrl, (err, res) => {
          if (err) {
            reject(err);
          }
          resolve(res);
        });
      });
    }
  }
};