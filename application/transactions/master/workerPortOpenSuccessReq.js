var
    Backbone = require('backbone')
    ,Garam = require('../../../server/lib/Garam')
    , _ = require('underscore')
    ,Express = require('express')
    ,BaseTransaction = require('../../../server/lib/BaseTransaction');

module.exports = BaseTransaction.extend({
    pid:'workerPortOpenSuccessReq',

    create : function(master) {


        this._packet = {
            pid : 'workerPortOpenSuccessReq'
        }

    },
    addEvent : function(workerInstance) {
        var self = this;
        //BaseWorker.js
        workerInstance.on('workerPortOpenSuccessReq',function(){
            //startChildServer
            workerInstance.setListen();
            if (typeof Garam.get('workerConnectionDC') ==='undefined') {
                assert(0,'환경 설정값 workerConnectionDC 를 추가하세요');
            }
            if (Garam.get('clusterMode') && Garam.get('workerConnectionDC')) {
                Garam.getInstance().addRPC(workerInstance.getID(),'dc');
            }
        });
    }




});

