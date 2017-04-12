var _ = require('underscore')
    , fs = require('fs')
    , Garam = require('../../Garam')
    , Base = require('../../Base')
    , async = require('async')
    , JsonParse = require('../JsonParse')
    , Net = require('net' )
    , domain = require('domain')
//, HostServer = require('./server')
    , assert= require('assert');
var packetMessage = {"heartbeat timeout" : 40,"heartbeat interval":35};
exports = module.exports = Server;

function Server () {
    JsonParse.prototype.constructor.apply(this,arguments);
    this.options = {};
    this.disconnected = false;
    this.open = false;
    this.listenPort = [];
    this.remoteIP = '';
    this.setOpcodeHandlers();


};

_.extend(Server.prototype, JsonParse.prototype, {
    startConnect : function(options,callback) {
        var self = this;

        for (var i in options) {
            this.options[i] = options[i];
        }

        var serverDomain = domain.create();
        serverDomain.on('error', function(err) {
            if (err) {
                Garam.getInstance().log.error(err.stack);


            }
        });

        serverDomain.run(function() {
            assert(self.options.ip);
            
            self.socket =  Net.connect(self.options.port,self.options.ip);
            self.socket.on('connect',function(){
                Garam.logger().info('connect to server '+self.options.ip+':'+self.options.port);
                //self._decodeBreak = false;
                self.open = true;
                self._connectError = false;
                self.setHandlers();
               // self._onHeartbeatClear();
                self.onConnectEvent();
                self.disconnected = false;
               // self._setHeartbeatInterval();

                Garam.getInstance().getServerIP(function () {
                    self.remoteIP = Garam.get('serverIP');

                    Garam.logger().info('#server ip',self.remoteIP)
                    self.serverType = Garam.getInstance().get('serverType') ? Garam.getInstance().get('serverType') :assert(0);
                    self.serverName = self.remoteIP +':'+self.serverType;

                    self.portlist = Garam.getInstance().get('portlist') ? Garam.getInstance().get('portlist') : [];

                    if (typeof callback !== 'undefined') {
                        callback(self);
                    }

                    if(self.options.scope) {
                        self.options.scope.emit('onServerConnect',self);
                    } else {
                        Garam.getInstance().transport.emit('onServerConnect',self);
                    }
                });
            });
            self.socket.removeAllListeners('close');
            self.socket.on('close',function(){
                self.disconnected = true;
                self.open = false;
                //서버 접속 종료를 탐지 했을때의 처리
                if (typeof self.socket !== 'undefined') {
                    Garam.logger().warn('disconnected to',self.options.hostname);
                    self._clearHeartbeatTimeout();
                    self.socket.end();
                }
            });
            self.removeAllListeners('message');
            self.on('message',function(data){

                self.onMessage(data);
            });

        });

        //self.on('message',function(data){
        //
        //    self.send({a:22})
        //});


    },
    getHostname : function () {
        return this.options.hostname;
    },
    getHostIP : function () {
        return this.options.ip;
    },
    getHostPort : function () {
        return this.options.port;
    },
    reconnectToServer : function() {
        this.socket.removeAllListeners('connect');
        this.socket.removeAllListeners('close');
        this.socket.removeAllListeners('message');
        this.socket =  Net.connect(this.options.port,this.options.ip);
    },
    connectError : function() {
        this._connectError = true;
    },

    _onHeartbeatClear: function() {
        Garam.logger().info('clear heartbeat client');
        this._clearHeartbeatTimeout();
        this._setHeartbeatInterval();
    },
    /**
     * heartbeat 를 생성한다
     * @private
     */
    _setHeartbeatInterval: function() {
        if (!this._heartbeatInterval) {
            var self = this;


            this._heartbeatInterval = setTimeout(function () {
                self._heartbeat();
                self._heartbeatInterval = null;
            },packetMessage["heartbeat interval"] * 1000);
           Garam.logger().info('set heartbeat interval for dc', this.options.hostname,this.options.port);
        }
    },
    _clearHeartbeatTimeout: function() {
        if (this._heartbeatTimeout) {

            clearTimeout(this._heartbeatTimeout);
            this._heartbeatTimeout = null;
             Garam.logger().info('cleared heartbeat timeout for client');
        }

        if (this._heartbeatInterval) {

            clearTimeout(this._heartbeatInterval);

            this._heartbeatInterval = null;
             Garam.logger().info('cleared heartbeat timeout for client');
        }
    },
    /**
     * 지정된 시간안에 heartbeat 메세지가 도착하지 않으면 에러 처리
     * @private
     */
    _setHeartbeatTimeout: function() {
        if (!this._heartbeatTimeout) {
            var self = this;

            this._heartbeatTimeout = setTimeout(function () {
                Garam.logger().info('fired heartbeat timeout for client');
                self._heartbeatTimeout = null;
                Garam.logger().warn('disconnected to',self.options.hostname);
                self.disconnected = true;
                self.open = false;
            }, packetMessage["heartbeat timeout"] * 1000);

            //sv.logger.info('set heartbeat timeout for client', this.getServerName());
        }
    },
    _heartbeat: function(){
        if (this.open) {

            this.send({ pid: 'heartbeat' });
            this._setHeartbeatTimeout();
        }

        return this;
    },

    onMessage: function(data) {


        var pid = data.pid;
        delete data.pid;
        function toArrayByArg(enu) {
            var arr = [];
            for (var i in enu )
                arr.push(enu[i]);

            return arr;
        }
        var args = toArrayByArg(data);

        var packet = {
            name : pid,
            args:args
        }
        if (packet.name ==='heartbeat') {
            this._onHeartbeatClear();
            return;
        }

        var params = [packet.name].concat(packet.args);

        if (Garam.get('ispacket')) {

            Garam.logger().packet('response  ' +JSON.stringify(params));
        }
        this.emit.apply(this,params);
    },
    addPort : function(openPort) {
        this.listenPort = openPort;
        this.send({pid:'listenPort',openPort:this.listenPort});
    },

    // reconnect : function() {
    //     var self = this;
    //     setTimeout(function(){
    //         self.connect();
    //     },1000);
    // },


    end: function (reason,callback) {
        var self = this;

        if (!this.disconnected) {
            this.close(reason,callback);
            this.disconnected = true;

        }
    },
    close: function (reason,callback) {
        if (this.open) {

            this.doClose(callback);
            this.onClose(reason);
        }
    },
    onClose: function(reason) {
        if (this.open) {
            this.open = false;
            this.emit('disconnect',reason);
        }
    },
    doClose: function(callback){
        if (typeof this.socket !== 'undefined') {
            this.socket.end();
        }
        if (typeof callback === 'function') {
            callback();
        }
    }




});




var extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
        child = protoProps.constructor;
    } else {
        child = function(){ return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
};

Server.extend = extend;