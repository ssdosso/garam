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

};

_.extend(Error.prototype, Base.prototype, {
    SystemError : -1, //정상적인 시스템 이라면 나올 수 없는 경우
    DatabaseError:-2,
    NotLoginError : -6,//: Login 하지 않은 유저
    PacketDataTypeError : -5,
    InvalidActionReq : -7,
    InvalidError:-8,
    addErrorCode : function (errorName,code) {
        this[errorName] = code;
    },
    getErrorCode : function (errorName) {
        return this[errorName] ? this[errorName] : this.SystemError;
    }

});