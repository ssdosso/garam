var
    Backbone = require('backbone')
    ,Garam = require('../../../server/lib/Garam')
    , _ = require('underscore')
    ,Express = require('express')
    ,BaseTransaction = require('../../../server/lib/BaseTransaction');

module.exports = BaseTransaction.extend({
    pid: 'cartoonVersion',
    create: function (master) {
        this._packet = {
            pid: 'cartoonVersion',
            version: ''
        }
    },
    addEvent: function (master) {
        master.on('cartoonVersion', function (version) {
            Garam.getCtl('game').setCartoonVersion(version);
        });
    }
});

