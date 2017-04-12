var
    Backbone = require('backbone')
    ,Garam = require('../../../server/lib/Garam')
    , _ = require('underscore')
    ,Express = require('express')
    ,BaseTransaction = require('../../../server/lib/BaseTransaction');



/**
 *  listen 한 port 정보를 DC 에
 */

module.exports =  BaseTransaction.extend({
    pid:'NoticeMessageReq',

    create : function() {

        this._packet = {
            pid : 'NoticeMessageReq',
            message : '',
            type :0

        }
    },
    addEvent : function(dc) {
        dc.on('NoticeMessageReq',function(message,type){
            Garam.getMaster().sendAll('NoticeMessageReq',message,type);

        });
    }
});

