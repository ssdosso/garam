var
    Backbone = require('backbone')
    ,Garam = require('../../../server/lib/Garam')
    , _ = require('underscore')
    ,Express = require('express')
    ,BaseTransaction = require('../../../server/lib/BaseTransaction');

module.exports = BaseTransaction.extend({
    pid: 'rsVersion',
    create: function (master) {
        this._packet = {
            pid: 'rsVersion',
            version: '',
            type :''
        }
    },
    addEvent: function (master) {

        function  setVersionData(type,version) {
         //  Garam.logger().info('set version',type,version)

            if (typeof Garam.getCtl('game') !=='object' || typeof Garam.getCtl('game').setVersionData  !== 'function') {
              
                setTimeout(function(){
                    setVersionData(type,version);
                },300);
                return;
            }
            Garam.getCtl('game').setVersionData(type,version);
        }
        master.on('rsVersion', function (version,type) {


            if (typeof Garam.getCtl('game') !=='object') {

              
                setTimeout(function(){
                    setVersionData(type,version);
                },300);
            } else {
             
                setVersionData(type,version);
            }
            // if (typeof  Garam.getCtl('game') ==='object' && typeof Garam.getCtl('game').setVersionData ==='function') {
            //
            // } else {
            //
            //     setTimeout(function(){
            //         setVersionData(type,version);
            //     },300);
            // }

        });
    }
});

