var
    Backbone = require('backbone')
    ,Garam = require('../../../server/lib/Garam')
    , _ = require('underscore')

    ,Express = require('express')
    ,BaseTransaction = require('../../../server/lib/BaseTransaction');



var ErrorRes = BaseTransaction.extend({
    pid:'ErrorRes',
    create : function() {

        this._packet = {

            message :'',
            code:0
        }

    },
    addEvent : function(user) {}





});

module.exports = ErrorRes;