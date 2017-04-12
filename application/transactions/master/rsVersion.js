var
    Backbone = require('backbone')
    ,Garam = require('../../../server/lib/Garam')
    , _ = require('underscore')
    ,Express = require('express')
    ,BaseTransaction = require('../../../server/lib/BaseTransaction');

module.exports = BaseTransaction.extend({
    pid:'rsVersion',
    create : function(master) {
        this._packet = {
            pid: 'rsVersion',
            version: '',
            type :''
        }
    },
    addEvent : function(worker) {
        worker.on('rsVersion', function (version) {
        });
    }




});

