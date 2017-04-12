var
    Backbone = require('backbone')
    ,Garam = require('../../../server/lib/Garam')
    , _ = require('underscore')
    ,Express = require('express')
    ,BaseTransaction = require('../../../server/lib/BaseTransaction');




module.exports =  BaseTransaction.extend({
    pid:'ServerLoginMasterStatusRes',
   
    create : function() {
        this._packet = {
          //  pid : 'LoginSuccessDcRes',
            state : false

        }
    },
    addEvent : function(dcServer) {
        dcServer.on('ServerLoginMasterStatusRes',function(state){


            Garam.getInstance().startService(state);
        });
    }





});

