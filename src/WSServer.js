import IOJsonString from './IOJsonString'
import ServerCore from './ServerCore'

export default class WSServer extends ServerCore {

  start (options, cb = () => {}, extraOptions) {
    let WebSocket = {}
    try {
      WebSocket = require(extraOptions.wsLib)
      console.log(`${extraOptions.wsLib} module is used for WebSocket server`)
    } catch (err) {
      const anotherLib = extraOptions.wsLib === 'uws' ? 'ws' : 'uws'
      console.log(`INFO: ${err.message}. Will use ${anotherLib} instead`)
      try {
        WebSocket = require(anotherLib)
      } catch (err2) {
        console.log(`ERROR: ${err2.message}. Thus the WebSocket server cannot be run`)
      }
    }
    const WebSocketServer = WebSocket.Server

    // Starting server
    this.server = new WebSocketServer(options, cb)

    this.server.on('error', err => console.error(`Server error: ${err}`))

    this.server.on('connection', socket => {
      socket.onerror = err => {
        console.log(`Socket error while sending ${err.code}: ${err.reason}`)
      }
      socket.onmessage = msgEvent => {
        try {
          super.handleMessage(socket, new IOJsonString(msgEvent.data))
        } catch (err) {
          if (err.name !== 'SigverError') {
            console.log(`WebSocketServer: Error which not a SigverError instance: : ${err.message}`)
          } else {
            console.log(err.message)
            socket.close(err.code, err.message)
          }
        }
      }
    })
  }
}
