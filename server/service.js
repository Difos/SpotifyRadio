import fs from "fs";
import fsPromises from "fs/promises";
import config from "./config.js";
import { join, extname } from "path";
import {randomUUID} from 'crypto';
import { PassThrough } from "stream";

const {
  dir: { publicDirectory },
} = config;

export class Service {

  constructor() {
    this.clientStream = new Map()
  }

  getClientStream(){

  }

  removeClientStream(){

  }

  createFileStream(filename) {
    return fs.createReadStream(filename);
  }

  async getFileInfo(file) {
    const fullFilePath = join(publicDirectory, file);
    // valid se o arquivo existe, se não dará erro!
    await fsPromises.access(fullFilePath);
    const fileType = extname(fullFilePath);

    return {
      type: fileType,
      name: fullFilePath,
    };
  }

  async getFileStream(file) {
    const { name, type } = await this.getFileInfo(file);
    return {
      stream: this.createFileStream(name),
      type,
    };
  }
}
