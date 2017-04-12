var
    Backbone = require('backbone')
    ,Garam = require('../../../server/lib/Garam')
    , _ = require('underscore')
    ,Express = require('express')
    ,BaseTransaction = require('../../../server/lib/BaseTransaction');

module.exports = BaseTransaction.extend({
    pid:'workerOnReady',

    create : function(master) {


      this._packet = {
            pid : 'workerOnReady'
       }

    },
    addEvent : function(workerInstance) {
        var self = this;
        //BaseWorker.js
        workerInstance.on('workerOnReady',function(){
                //startChildServer

            var dc = Garam.getCtl('dc');
            /**
             * cluster/BaseWorker.js 참조
             */
            workerInstance.listen();
  


        });
    }




});

