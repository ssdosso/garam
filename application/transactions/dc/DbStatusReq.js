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
    pid:'DbStatusReq',
 
    create : function() {
        this._packet = {
            status : true,
            dbType : '',
            namespace :''
        }
    },
    addEvent : function(dcServer) {

    }





});

