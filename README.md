# Stack-Status
A NodeJS app for gathering data from ELB, EC2 and CloudWatch to aggregate them to show the status of a stack.

This is used for a specific cloud setup where custom tags are used in the naming of EC2 instances which are consistant.

Will be adding other API's for Redshift, ElasticSearch and other servcies soon.

## Install

```
npm i stack-status --S
```

## Config

```javascript
const config = {
  region: '', // aws region
  secretAccessKey: '', // aws secretAccessKey
  accessKeyId: '', // aws accessKeyId
  name: '', // aws tag for instance name
  env: '', // aws tag for enviroment
};
```

## Construct the class

```javascript
const stack = new Stack(config);
```

## Get stack status

```javascript
stack.status((err, res) => {
  if (err) throw err;
  console.log(res);
});
```

## Stack Status Response

```json
{
    "name": "serviceName",
    "instances": [
        {
            "name": "instanceName",
            "env": "live",
            "instanceID": "instanceID",
            "state": "running",
            "type": "t2.micro",
            "boot": "2017-04-27T00:44:31.000Z",
            "zone": "eu-west-1b",
            "ip": "10.38.162.125",
            "cpu": 0.33,
            "health": "InService"
        }
    ],
    "internal": {
        "dns": "internal.dns.address",
        "name": "internal.dns.name"
    },
    "external": {
        "dns": "external.dns.address",
        "name": "external.dns.name"
    }
}
```

## Get SQS status

```javascript
stack.getSQS('url.of.sqs.queue', (err, res) => {
  if (err) throw err;
  console.log(res);
});
```

## SQS status response

```json
{
  "name":"https://sqs.eu-west-1.amazonaws.com/522682236448/puddle-csv",
  "waiting":"0",
  "processing":"1"
}
```

## Other Public APIs

`stack.status()` combines the below methods and returns aggregated JSON, but the methods are available by themselves.

### Get EC2's

```javascript
stack.getEC2((err, res) => {
  if (err) throw err;
  console.log(res);
});
```

### Get ELBs

```javascript
stack.getELB((err, res) => {
  if (err) throw err;
  console.log(res);
});
```

