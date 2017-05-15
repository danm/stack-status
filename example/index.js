const Stack = require('../index');

const config = {
  region: '', // aws region
  secretAccessKey: '', // aws secretAccessKey
  accessKeyId: '', // aws accessKeyId
  name: '', // aws tag for instance name
  env: '', // aws tag for enviroment
};

const stack = new Stack(config);

stack.status((err, res) => {
  if (err) throw err;
  console.log(res);
});

stack.getSQS('url.of.sqs.queue', (err, res) => {
  if (err) throw err;
  console.log(res);
});
