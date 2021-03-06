import { Document } from 'mongoose';

export interface IAVDeviceDocument extends Document {
  user?: string;
  createdTimestamp?: Function;
  updatedTimestamp?: Function;
  name: string;
  brand?: string;
  image?: string;
  channels?: string[];
  inputs?: string[];
  output?: string;
  wishlist?: boolean;
  location: string;
  created?: string;
  updated?: string;
}

export interface IAVDeviceReq {
  id?: String;
  name: string;
  brand?: string;
  image?: string;
  channels?: string[];
  inputs?: string[];
  output?: string;
  location: string;
  wishlist?: boolean;
}

export interface IAVDeviceDevice {
  device: IAVDeviceReq;
}