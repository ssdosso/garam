
var
    Backbone = require('backbone')
    ,Garam = require('../../../server/lib/Garam')
    , _ = require('underscore')
    ,Express = require('express')
    ,BaseTransaction = require('../../../server/lib/BaseTransaction');

module.exports = BaseTransaction.extend({
    pid:'workerPortOpenSuccessReq',

    create : function() {
        this._packet = {
            pid : 'workerPortOpenSuccessReq',
            status : 0

        }


    },
    addEvent : function(client) {
        //
        //client.on('workerOnReady',function(eventType,result){
        //    //startChildServer
        //    console.log('workerOnReady')
        //    //Garam.getMaster().sendAll('gamePlayEvent',eventType,result);
        //});
    }




});

