var
    Backbone = require('backbone')
    ,Garam = require('../../../server/lib/Garam')
    , _ = require('underscore')
    ,Express = require('express')
    ,BaseTransaction = require('../../../server/lib/BaseTransaction');


/**
 *  DC 가 Restart 한후 서버에 서버 상태를 요청
 *  서버의 포트 오픈 상태를 알려주면 됨.
 */

module.exports =  BaseTransaction.extend({
    pid:'serverStatusRes',
    type:'server',
    create : function() {

        this._packet = {
            pid : 'serverStatusRes',
            port :{},
            serverName : ''

        }
    },
    addEvent : function(dcServer) {


    }





});

