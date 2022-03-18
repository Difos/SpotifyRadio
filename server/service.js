import fs from 'fs';
import fsPromises from 'fs/promises';
import config from './config.js';
import { join, extname } from 'path';
import {randomUUID} from 'crypto';

import streamsPromises from 'stream/promises';

import Throttle from 'throttle';
import  childProccess  from 'child_process';

import { logger } from "./util.js"
import { once } from 'events'

import { PassThrough, Writable } from 'stream'
const {
  dir: { publicDirectory },
  constants: { 
    fallBackBitRate,
    englishConversation,
    bitRateDivisor
  }
} = config;

export class Service {

  constructor() {
    this.clientStreams = new Map()
    this.currentSong = englishConversation
    this.currentBitRate = 0,
    this.throttleTransform = {},
    this.currentReadable = {}

    this.startStream()
  }

  createClientStream(){
    const id = randomUUID()
    const clientStream = new PassThrough()
    this.clientStream.set(id,clientStreams)
    return {
      id,
      clientStream
    }
  }

  removeClientStream(id){
    this.clientStreams.delete(id)
  }

  _executeSoxCommand(args){
    return childProccess.spawn('sox',args)
  }

  async getBitRate(song){
    try{
      const args = [
        '--i', //info
        '-B',
        song
      ]

      const { 
        stderr, // erro
        stdout, // log
        //stdin // enviar dados como stream
      } = this._executeSoxCommand(args)
      
      await Promise.all([
        once(stderr,'readable'),
        once(stdout,'readable'),
      ])

      const [success,error] = [stdout,stderr].map(stream => stream.read())
      if(error) return await Promise.reject(error)

      return success
        .toString()
        .trim()
        .replace(/k/,'000')

    }catch(error){
      logger.error(`error on bitrate: ${error}`)
      return fallBackBitRate

    }
  }

  broadCast(){
    return new Writable({
      write: (chunk,enc,cb) => {
        for(const [id,stream] of this.clientStreams){
          // se o client descontou nao devendo mais mandar dados pra ele
          if(stream.writableEnded){
            this.clientStreams.delete(id)
            continue;
          }

          stream.write(chunk)
        }
        cb()
      }
    })
  }

  async startStream(){

    logger.info(`starting with ${this.currentSong}`)
    const bitRate = this.currentBitRate = (await this.getBitRate(this.currentSong))/bitRateDivisor
    const throttleTransform = this.throttleTransform = new Throttle(bitRate)
    const songReadable = this.currentReadable = this.createFileStream(this.currentSong)

    return streamsPromises.pipeline(
      songReadable,
      throttleTransform,
      this.broadCast()
    )
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
