

const AWS = require('aws-sdk');

/*
getHealth
Get the health of the Instances
*/

const getHealth = (i, elb) => new Promise((resolve, reject) => {
  elb.describeInstanceHealth({ LoadBalancerName: i }, (err, res) => {
    if (err) reject(err);
    resolve(res.InstanceStates);
  });
});

/*
getGetInstances
Get all the Instances which are assosiated with the ELBs
*/

const getGetInstances = (elbs, elb) => {
  const promises = [];
  return new Promise(resolve => {
    const services = [];
    elbs.LoadBalancerDescriptions.forEach(row => {
      const healthPromise = getHealth(row.LoadBalancerName, elb).then(r => {
        r.forEach(instance => {
          const service = {
            elb: row.LoadBalancerName,
            name: instance.InstanceId,
            health: instance.State,
            DNSName: row.DNSName,
            Scheme: row.Scheme
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

const start = config => new Promise((resolve, reject) => {
  const elbConfig = Object.assign({}, config);
  elbConfig.apiVersion = '2012-06-01';
  const elb = new AWS.ELB(elbConfig);
  elb.describeLoadBalancers((err, res) => {
    if (err) {
      reject(err);
    } else {
      getGetInstances(res, elb).then(result => {
        resolve(result);
      }).catch(finalError => {
        reject(finalError);
      });
    }
  });
});

module.exports = (config, cb) => {
  start(config).then(res => {
    cb(null, res);
  }).catch(e => {
    cb(e);
  });
};