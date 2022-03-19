import { Service } from './service.js'
import { logger } from './util.js'

export class Controller {
    constructor(){ 
        this.service = new Service();
    }

    async getFileStream(filename){ 
        return this.service.getFileStream(filename)
    }

    async handleCommand({command}){
        logger.info(`command received:${command}`)
        const cmd = command.toLowerCase()
        const result = {
            result:'ok'
        }

        if(cmd.include('start')){
            this.service.startStream()
            return result
        }

        if(cmd.include('stop')){
            this.service.stopStream()
            return result
        }

        return this.service.startStream()
    }

    createClientStream(){
        const {
            id,
            clientStream
        } = this.service.createClientStream()

        const onClose = () => {
            logger.info(`closing connection of ${id}`)
            this.service.removeClientStream(id)
        }

        return {
            stream:clientStream,
            onClose
        }
    }
}