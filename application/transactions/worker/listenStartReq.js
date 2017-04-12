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
    addEvent : function(master) {
        /**
         *  마스터에서 port 를 오픈 하라는 명령을 받음.
         */
        master.on('listenStartReq',function(config){

           Garam.logger().info('listen port',config.port,'worker_id',Garam.getWorkerID());
            Garam.startWeb(config);
           
            //Garam.getMaster().sendAll('gamePlayEvent',eventType,result);
        });


    }




});

