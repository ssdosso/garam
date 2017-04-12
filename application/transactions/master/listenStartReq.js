var
    Backbone = require('backbone')
    ,Garam = require('../../../server/lib/Garam')
    , _ = require('underscore')
    ,Express = require('express')
    ,BaseTransaction = require('../../../server/lib/BaseTransaction');

module.exports = BaseTransaction.extend({
    pid:'listenStartReq',

    create : function(master) {


        this._packet = {
            pid : 'listenStartReq',
            config : {}
        }

    },
    addEvent : function(client) {



    }




});

