require("module-alias/register")

const mongoose = require("mongoose")
const pino = require("pino")


function verifyNullish (...fields){
    return fields.some((val) => val == null)
}

//// LOGGER ////
function pinoInstance(){
    const logger = pino({
        base: null,
    },pino.transport({
        targets: [
            // {
            //     target: "pino/file",
            //     options: {destination: dstPath, mkdir: true}
            // },
            {
                target: "pino-pretty",
                options: {
                    destination: 1,
                    colorize: true,
                    customColors: 'info:green,err:white,warn:white,fatal:white,debug:white',
                    
                    translateTime: "SYS:standard",
                    ignore: "pid,hostname"
                }
            }
        ]
    }))

    return logger
}

module.exports = {
    verifyNullish,
    pinoInstance,
}