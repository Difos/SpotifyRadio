import { logger } from './util.js';
import { Controller } from './controller.js';
import config from './config.js';


const {
    location,
    pages:{
        homeHTML,
        controllerHTML
    }
} = config

const controller = new Controller()

async function routes(request,response){
    const {method, url} = request;

    if(method === 'GET' && url==='/'){
        response.writeHead(302,{
            'Location': location.home
        })

        return response.end();
    }

    if(method === 'GET' && url==='/home'){
        const {
            stream
        } = await controller.getFileStream(homeHTML)

        //padrao response e txt/html
        return stream.pipe(response)
    }

    if(method === 'GET' && url==='/controller'){
        const {
            stream
        } = await controller.getFileStream(controllerHTML)

        //padrao response e txt/html
        return stream.pipe(response)
    }

    if(method === 'GET'){
        const { 
            stream,
            type
        } = await controller.getFileStream(url)

        return stream.pipe(response)

    
    }
    response.writeHead(404);
    return response.end('hello')
}


function handlerError(error,response){
    if(error.message.includes('ENOENT')){
        logger.warn(`asset not found ${error.stack}`);
        response.writeHead(404)
        return response.end()
    }

    logger.end(`caught error on API ${error.stack}`);
    response.writeHead(500)
        return response.end()

    
}
export function handler (request, response){
    return routes(request,response)
    .catch(error=> handlerError(error,response));
}