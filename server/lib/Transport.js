var _ = require('underscore')
    , fs = require('fs')
    , Garam = require('./Garam')

    , Base = require('./Base')
    , HostServer = require('./rpc/host/HostServer')
    , TcpClientServer = require('./rpc/host/TcpClientServer') //user  와의  접속
    , ClientServer = require('./rpc/remote/ClientServer')
    , async = require('async')

    , domain = require('domain')
    , adapter = require('socket.io-redis')
    , assert= require('assert');


const { Server } = require("socket.io");
const Net = require("net");
const {WebSocketServer} = require("ws");
exports = module.exports = Transport;

function Transport (mgr, name) {
    Base.prototype.constructor.apply(this,arguments);
    this.openPort = [];
    this._hostServer = {};
    this._remoteServer = {};
    this.dcServerCheckInterval = {};
    this._tcpServer = null;
};

_.extend(Transport.prototype, Base.prototype, {
    addTcpSocket : async function (server) {
        return new Promise((resolve, reject)=>{
            if (!Garam.getInstance().get('service')) {
                return;
            }
            let self = this,port;
            if (!Garam.get('tcpPort')) {
                let defaultPort=Garam.get('portInfo').tcpPort,port = defaultPort + Garam.getWorkerID();
            } else {
                port = Garam.get('tcpPort');
            }


            this._tcpServer = new TcpClientServer({port:port});

            this._tcpServer.listen(function(){
                //   console.log(options.hostname);
                console.log('tcp litesn')
                resolve();
            });
        });

    },
    createTcpSocket : function (server,callback) {
        if (!Garam.getInstance().get('service')) {
            return;
        }


        let self = this,port;
        let options = function() {
            return server.options;
        }

        Garam.set('transportType',"tcp");
        if (!Garam.get('tcpPort')) {
            let defaultPort=Garam.get('portInfo').tcpPort,port = defaultPort + Garam.getWorkerID();
        } else {
            port = Garam.get('tcpPort');
        }

        Garam.logger().info('set tcp socket',port)
        this._tcpServer = new TcpClientServer({port:port});


        Garam.set('port',port);




        this._tcpServer.listen(function(){
            //   console.log(options.hostname);
            let controllers =  Garam.getControllers();


            callback();

        });


    },
    createWebSocket : function (httpServer,callback) {
        const {WebSocketServer  } = require('ws');
        let self = this;

        try {
            this._socketServer = new WebSocketServer({ server:httpServer});

            let controllers =  Garam.getControllers();
            Garam.set('transportType',"webSocket");
            Garam.logger().info('transportType webSocket')
            //
            this._socketServer.on('connection', function (socket,req) {
                socket.id = self.generateId();
                socket.remoteAddress = req.socket.remoteAddress;
                for (let i in controllers) {
                    controllers[i].emit('userConnection',socket);
                }
            });

            callback();
        } catch (e) {
            Garam.logger().error(e)
        }

    },
    createSocketIo : function(httpServer,callback) {
        var self = this;
        if (!Garam.getInstance().get('service')) {
            return;
        }
        var self = this;
        var options = function() {
            return httpServer.options;
        }
        Garam.set('transportType',"socketIo");
        Garam.logger().info('transportType socketIo')
        // this._socketServer =  io.listen(server);


        this._socketServer = new Server(httpServer, {

            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            },
            pingInterval: 10000,
            pingTimeout: 5000,
            cookie: false
        });


        let controllers =  Garam.getControllers();
        Garam.getInstance().log.info('Socket.io listen ');


        self._socketServer.sockets.on('connection', function (socket) {
            for (let i in controllers) {
                controllers[i].emit('userConnection',socket);
            }
        });




        callback();

    },
    generateId : function() {
        return Math.abs(Math.random() * Math.random() * Date.now() | 0).toString()
            + Math.abs(Math.random() * Math.random() * Date.now() | 0).toString();
    },
    getRemoteServer : function (hostname) {
        return this._remoteServer[hostname];
    },
    closeRemoteSocket : function (hostname) {
        if ( this._remoteServer[hostname]) {
            Garam.logger().info('close remote socket',hostname)
            this.removeReconnectEvent(hostname)
            this._remoteServer[hostname].socket.end();
            //delete this._remoteServer[hostname].socket;

        }
    },
    createRemote : async function(options,callback) {
        let self = this;
        let remoteOptions = options;
        assert(remoteOptions.hostname);
        Garam.logger().info('RPC login to ',remoteOptions)
        return new Promise((resolve, reject)=>{
            try {
                this._remoteServer[remoteOptions.hostname] = new ClientServer();
                this._remoteServer[remoteOptions.hostname].startConnect(remoteOptions,function(server){

                    self.emit('connect:'+remoteOptions.hostname,server);
                    resolve(server);
                });

                if (typeof remoteOptions.reconnectOptions !== 'undefined' && remoteOptions.reconnectOptions === false) {

                    return;
                }

                this.reconnectEvent(remoteOptions.hostname);
            } catch (e) {
                Garam.logger().error(e)
                reject(e);
            }

        });


    },
    createHost : function(options,callback) {

        assert(options.hostname);
        let self = this;
        this._hostServer[options.hostname] = new HostServer(options);
        this._hostServer[options.hostname].listen(function(){
            //   console.log(options.hostname);
            //Garam.logger().info('host listen:'+options.hostname,options.port);
            self.emit('listen:'+options.hostname,self._hostServer[options.hostname]);
            callback();

        });

    },
    getHost : function(hostname) {
        assert(hostname);
        return this._hostServer[hostname];
    },
    connectServer : function(options) {

        var  Net = require('net');
        var self = this;
        var checkconnect =  setInterval(function() {
            assert(options.hostname);
            var socket =  Net.connect(options.port,options.ip);
            socket.removeAllListeners('connect');
            socket.on('connect',function() {
                clearInterval(checkconnect);
                Garam.logger().info('reconnect success to',options.hostname);
                socket.end();
                delete self._remoteServer[options.hostname].socket;
                delete self._remoteServer[options.hostname];
                self._remoteServer[options.hostname] = null;
                self._remoteServer[options.hostname] = new ClientServer(options);
                self._remoteServer[options.hostname].startConnect(options,function(server){
                    self.emit('reconnect:'+options.hostname,server);
                });
                self.reconnectEvent(options.hostname);
            });
            socket.removeAllListeners('close');
            socket.on('close',function(){
                delete socket;

                socket.removeAllListeners('close');
                socket.removeAllListeners('connect');
                socket = null;

            });

        },5*1000);

    },
    removeReconnectEvent : function (hostname) {
        clearInterval(this.dcServerCheckInterval[hostname]);
        delete this.dcServerCheckInterval[hostname];
    },
    reconnectEvent : function(hostname) {
        var self = this;
        this.dcServerCheckInterval[hostname] =  setInterval(function(){
            if(self._remoteServer[hostname].disconnected) {

                clearInterval(self.dcServerCheckInterval[hostname]);
                self.connectServer(self._remoteServer[hostname].options);
            }
        },10*1000);
    },
    getHostServer : function(namespace) {
        return this.getHost(namespace);
    },
    getSocketIO : function() {
        return this._socketServer;
    },
    listenWebService : function(server) {


    }

});