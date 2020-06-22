var _ = require('underscore')
    , fs = require('fs')
    , Garam = require('./Garam')

    , Base = require('./Base')
    , HostServer = require('./rpc/host/HostServer')
    , ClientServer = require('./rpc/remote/ClientServer')
    , async = require('async')
    , io = require('socket.io')
    , domain = require('domain')
    , redis = require('socket.io-redis')
    , assert= require('assert');

exports = module.exports = Error;

function Error (mgr, name) {
    Base.prototype.constructor.apply(this,arguments);
    this.errorMsg ={};
};

_.extend(Error.prototype, Base.prototype, {
    SystemError : 1, //정상적인 시스템 이라면 나올 수 없는 경우
    DatabaseError:2,
    NotLoginError : 3,//: Login 하지 않은 유저
    PacketDataTypeError : 4,
    InvalidActionReq : 5,
    InvalidError:7,
    BetError:8,
    BetBalanceError:9,
    NotFoundGame :1002,
    addErrorCode : function (errorName,code,msg) {
        this[errorName] = code;
        this.errorMsg[code]= msg;
    },

    getCode : function (errorName) {
        return this[errorName] ? this[errorName] : this.SystemError;
    }

});