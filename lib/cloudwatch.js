const AWS = require('aws-sdk');

const getCloudWatchStatus = (instance, cloudwatch) => new Promise((resolve, reject) => {
  const start = new Date();
  start.setMinutes(start.getMinutes() - 5);

  const req = {
    StartTime: start,
    EndTime: new Date(),
    MetricName: 'CPUUtilization',
    Namespace: 'AWS/EC2',
    Period: 300,
    Dimensions: [{
      Name: 'InstanceId',
      Value: instance.instanceID
    }],
    Statistics: ['Maximum']
  };

  cloudwatch.getMetricStatistics(req, (err, res) => {
    if (err) {
      reject(err);
    } else {
      const newInstance = Object.assign({}, instance);
      if (res.Datapoints[0] && res.Datapoints[0].Maximum) {
        newInstance.cpu = res.Datapoints[0].Maximum;
      }
      resolve(newInstance);
    }
  });
});

const start = (config, instances) => new Promise((resolve, reject) => {
  const promises = [];
  const newInstances = [];
  const cloudwatchConfig = Object.assign({}, config);
  cloudwatchConfig.apiVersion = '2010-08-01';
  const cloudwatch = new AWS.CloudWatch(cloudwatchConfig);

  instances.forEach(instance => {
    const cwPromise = getCloudWatchStatus(instance, cloudwatch).then(newInstance => {
      newInstances.push(newInstance);
    });
    promises.push(cwPromise);
  });

  Promise.all(promises).then(() => {
    resolve(newInstances);
  }).catch(err => {
    reject(err);
  });
});

module.exports = (config, instances, cb) => {
  start(config, instances).then(res => {
    cb(null, res);
  }).catch(e => {
    cb(e);
  });
};