const AWS = require('aws-sdk');

/*
mapInstances
takes a list of ec2 reservations, and returns all the instances in an array of needed data
*/

const mapInstances = (reservations, config) => {
  const instances = [];
  reservations.Reservations.forEach(r => {
    let name;
    let env;
    r.Instances.forEach(i => {
      i.Tags.forEach(tag => {
        const { Key, Value } = tag;
        if (Key === config.name) {
          name = Value;
        }
        if (Key === config.env) {
          env = Value;
        }
      });

      if (name !== undefined && env !== undefined) {
        const instance = {
          name,
          env,
          instanceID: i.InstanceId,
          state: i.State.Name,
          type: i.InstanceType,
          boot: new Date(i.LaunchTime),
          zone: i.Placement.AvailabilityZone,
          ip: i.PrivateIpAddress
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

const start = config => new Promise((resolve, reject) => {
  const ec2Config = Object.assign({}, config);
  ec2Config.apiVersion = '2016-11-15';
  const ec2 = new AWS.EC2(ec2Config);
  ec2.describeInstances((err, res) => {
    if (err) {
      reject(err);
    } else {
      const instances = mapInstances(res, config);
      resolve(instances);
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