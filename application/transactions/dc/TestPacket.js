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
    pid:'TestPacket',
    type:'server',
    create : function() {

        this._packet = {

            data :''

        }
    },
    addEvent : function(dcServer) {


    }





});

