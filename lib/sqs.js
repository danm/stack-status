const AWS = require('aws-sdk');

const getQueue = (sqs, queueUrl) => new Promise((resolve, reject) => {
  const queueSettings = {
    QueueUrl: queueUrl,
    AttributeNames: ['ApproximateNumberOfMessages', 'ApproximateNumberOfMessagesNotVisible']
  };
  const response = (err, res) => {
    if (err) {
      reject(err);
    }
    const queue = {
      name: queueUrl,
      waiting: res.Attributes.ApproximateNumberOfMessages,
      processing: res.Attributes.ApproximateNumberOfMessagesNotVisible
    };
    resolve(queue);
  };
  sqs.getQueueAttributes(queueSettings, response);
});

const start = (config, queueUrl) => {
  const sqsConfig = Object.assign({}, config);
  const sqs = new AWS.SQS(sqsConfig);
  return getQueue(sqs, queueUrl);
};

module.exports = (config, queueUrl, cb) => {
  start(config, queueUrl).then(res => {
    cb(null, res);
  }).catch(e => {
    cb(e);
  });
};