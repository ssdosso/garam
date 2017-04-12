var _ = require('underscore')
    , fs = require('fs')
    ,Base =require('../../server/lib/Base')
    , Garam = require('../../server/lib/Garam')
    , request = require('request')
    , moment = require('moment')
    , winston = require('winston')
    , UserBase = require('./UserBase')
    , assert= require('assert');


exports = module.exports = User;

function User () {
    Base.prototype.constructor.apply(this,arguments);




};

_.extend(User.prototype, UserBase.prototype,{
        create: function (socket) {
            var self = this;
            this._userDuplicateClose = false;
            this._isDestroy = false;
            this._isLogined = false;
            this._workerLeave = false;
            this._userID = 0;
            this._off =false;
            this._transactionUserPacket = {};
            this._gold = 0;

            /**
             * 1분안에 로그인 처리 되지 않으면 종료 처리
             * @type {number}
             * @private
             */
         
            this._loginTimerID = setTimeout(this.onLoginTimeout.bind(this), 1 * 60 * 1000);
            this.setSocket(socket);
            socket.on('message',function(data){
                if (Garam.get('userPacketDebug')) {
                    Garam.logger().user(data);
                }
                self.onMessage(data);
                // self.emit('LoginReq',data);
            });
            socket.on('disconnect',function(){

               // var room =Garam.getCtr('Room');
               // room.userLeave(self,socket.id);
            });
        },


        setOfflineUser : function() {
            this._off =false;
        },
        getOfflineUser : function() {
            return this._off;
        }


    }
);


User.extend = Garam.extend;
