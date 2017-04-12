var
    Backbone = require('backbone')
    ,Garam = require('../../../server/lib/Garam')
    , _ = require('underscore')
    ,Express = require('express')
    ,BaseTransaction = require('../../../server/lib/BaseTransaction');



/**
 *  추가 포트 개방
 */

module.exports =  BaseTransaction.extend({
    pid:'AddPortListenReq',
    type:'server',
    create : function() {

        this._packet = {
          //  pid : 'AddPortListenReq',
            port : 0

        }
    },
    addEvent : function(dcServer) {

    }





});

