var
    Backbone = require('backbone')
    ,Garam = require('../../../server/lib/Garam')
    , _ = require('underscore')
    ,Express = require('express')
    ,BaseTransaction = require('../../../server/lib/BaseTransaction');

module.exports = BaseTransaction.extend({
    pid: 'clientVersion',
    create: function (master) {
        this._packet = {
            pid: 'clientVersion',
            version: ''
        }
    },
    addEvent: function (master) {
        master.on('clientVersion', function (version) {
            Garam.getCtl('game').setClientVersion(version);
        });
    }
});

