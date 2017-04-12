var _ = require('underscore')
    , fs = require('fs')
    ,Base =require('../../server/lib/Base')
    , Garam = require('../../server/lib/Garam')
    , request = require('request')
    , moment = require('moment')
    , winston = require('winston')
    , assert= require('assert');


exports = module.exports = UserBase;

function UserBase () {
    Base.prototype.constructor.apply(this,arguments);

        this._current_user_on = false;
        this._userDuplicateClose = false; //중복 로그인 제거
};

_.extend(UserBase.prototype, Base.prototype,{
        create: function (socket) {},

        setUserLevel : function(lv) {
            this._userGameLv = lv;
        },
        setUserExp : function(exp) {
            this._userGameExp = exp;
        },
        setGold : function(gold) {
            if (typeof gold ==='undefined') {
                gold = 0;
            }
            this._gold = parseInt(gold);

        },
        getGold : function() {
            return this._gold;
        },
        setNickName : function(name) {
            this._Nickname = name;
        },
        setUserSerial : function(serial) {
            this._serial =   serial;
        },
        getUSerSerial : function() {
            return this._serial;
        },
        setUserID : function(user_id) {
            this._userID = user_id;
        },
        getNickName : function() {
            return  this._Nickname ;
        },
        setWorkerLeave : function() {
            this._workerLeave = true;
        },
        getWorkerLeave : function() {
            return this._workerLeave;
        },
        getServer_id : function() {
            return this._server_id;
        },
        setLogin : function(roomName) {
            var socketCtl = Garam.getCtl('socket');
            var loginSuccessRes = socketCtl.getTransaction('loginSuccessRes');
            this.send( loginSuccessRes.addPacket({}));
            this._roomName = roomName;
            this.getSocket().join(this._roomName);
            clearTimeout(this._loginTimerID);
            this._current_user_on = true;
            Garam.logger().info('user login sitdown')
        },


        deleteSocket : function(callback) {
            Garam.logger().warn('deleteSocket  !!!!! is not source')
        },
        deleteSession : function(callback) {

            Garam.logger().warn('delete session !!!!! is not source')



        },

        getToken : function() {
            return this._token;
        },
        getUserID : function() {

            return this._userID;
        },
        errorSend : function(message,code) {
            if (!code) code = 1;
            var errorTransaction = Bf.getTransaction('ErrorRes');
            errorTransaction.errorSend(this,{code:code,message:message});
        },
        send : function(packet) {
            if (this.getSocket() !== null) {
                this.getSocket().send(packet);
            }

        },
        setLogout : function(state) {
            if (state) {
                this._userDuplicateClose = true;
                clearTimeout(this._loginTimerID);
            }

            this._current_user_on = false;
        },
        isLogin:function () {

            return this._current_user_on;
        },
        onLoginTimeout : function() {
            var self = this;

            if (!this.isLogin() && !this._userDuplicateClose) {

                this.disconnect(function(){
                    self.emit('loginTimeoutEnd');
                });
            }
        },
        addTransactionPacket : function(pid,packet) {
            this._transactionUserPacket[pid] = packet;
        },
        getTranPacket : function(pid) {
            return this._transactionUserPacket[pid];
        },
        toArrayByArg : function(enu) {
            var arr = [];
            for (var i in enu )
                arr.push(enu[i]);

            return arr;
        },
        onMessage : function(data) {
            var pid =  data.pid;

            var p = _.clone(this.getTranPacket(pid));

            for (var i in p) {
                if(i === 'pid') {
                    delete p[i];
                } else {
                    p[i] = data[i];
                }
            }

            delete data.pid;
            var args = this.toArrayByArg(p);
            var packet = [pid].concat(args);
            this.emit.apply(this,packet);
        },
        disconnect : function(callback) {
            var socket =  this.getSocket();

            if ( typeof socket !== 'undefined' && typeof   socket.disconnect !== 'undefined') {
                Garam.logger().warn('disconnect user')
                socket.disconnect();
            }

            if (socket) {
                this._socket = null;
                if(typeof callback ==='function') {
                    callback();
                }
            }
        },
        /**
         * 서버에서 종료 처리
         */
        doEnd : function() {
            var socket =  this.getSocket();

            socket.disconnect();
        },
        setRoomUserModel : function(model) {
            this.roomUserModel = model;
        },
        getRoomUserModel : function() {
            return this.roomUserModel;
        },
        getRoom:function () {

            return Bf.getCtr('Room').getRoom(this._room_id);
        },
        setRoom:function (room_id) {
            this._room_id = room_id;
        },
        setSocket:function (socket) {
            this._socket = socket;
        },
        getSocket:function() {
            return  this._socket;
        },
        setOfflineUser : function() {
            this._off =false;
        },
        getOfflineUser : function() {
            return this._off;
        },
        getBetDelayTime : function() {
            return this.getRoomUserModel().p('sitdownTime');
        }





    }
);



