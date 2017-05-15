// @flow

export type sqsObjectType = {
  name: string,
  waiting: number,
  processing: number,
}

export type AWSConfigObject = {
  region: string,
  secretAccessKey?: string,
  accessKeyId?: string,
  name: string,
  env: string,
  apiVersion?: string,
};

export type elbServiceObjectType = {
  name?: string,
  health?: string,
  elb?: string,
  DNSName: string,
  Scheme: string,
};

export type instanceType = {
  env: string,
  name: string,
  state: string,
  type: string,
  boot: Object,
  zone: string,
  ip: string,
  instanceID: string,
  cpu?: number,
  health?: string,
};

export type serviceObject = {
  name: string,
  instances: Array<instanceType>,
  external?: {dns?: string, name?:string},
  internal?: {dns?: string, name?:string},
};

export type elbServiceObject = {
  instances: Array<instanceType>,
  elbs: Array<instanceType>,
};

export type BalancerType = {
  LoadBalancerName: string,
  DNSName: string,
  Scheme: string,
};
