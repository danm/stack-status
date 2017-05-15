// @flow
import type { AWSConfigObject, sqsObjectType } from './types';

type sqsResponseObjectType = {
  Attributes: {
    ApproximateNumberOfMessages: number,
    ApproximateNumberOfMessagesNotVisible: number,
  },
};

const AWS = require('aws-sdk');

const getQueue = (sqs: Function, queueUrl: string) => (
  new Promise((resolve, reject) => {
    const queueSettings: {
      QueueUrl: string,
      AttributeNames: Array<string>,
    } = {
      QueueUrl: queueUrl,
      AttributeNames: [
        'ApproximateNumberOfMessages', 'ApproximateNumberOfMessagesNotVisible',
      ],
    };
    const response = (err: Object, res: sqsResponseObjectType) => {
      if (err) { reject(err); }
      const queue:sqsObjectType = {
        name: queueUrl,
        waiting: res.Attributes.ApproximateNumberOfMessages,
        processing: res.Attributes.ApproximateNumberOfMessagesNotVisible,
      };
      resolve(queue);
    };
    sqs.getQueueAttributes(queueSettings, response);
  })
);

const start = (config:AWSConfigObject, queueUrl:string) => {
  const sqsConfig = Object.assign({}, config);
  const sqs = new AWS.SQS(sqsConfig);
  return getQueue(sqs, queueUrl);
};

module.exports = (config: AWSConfigObject, queueUrl:string, cb: Function) => {
  start(config, queueUrl).then((res:sqsObjectType) => {
    cb(null, res);
  })
  .catch((e:Object) => {
    cb(e);
  });
};
