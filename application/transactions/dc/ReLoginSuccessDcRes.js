var
    Backbone = require('backbone')
    ,Garam = require('../../../server/lib/Garam')
    , _ = require('underscore')
    ,Express = require('express')
    ,BaseTransaction = require('../../../server/lib/BaseTransaction');




module.exports =  BaseTransaction.extend({
    pid:'ReLoginSuccessDcRes',
    type:'server',
    create : function() {

        this._packet = {
            pid : this.pid


        }
    },
    addEvent : function(dcServer) {
        dcServer.on('ReLoginSuccessDcRes',function(state){

                Garam.logger().info('re connection success')

        });
    }





});

