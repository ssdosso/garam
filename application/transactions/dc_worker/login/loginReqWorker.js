var
   
    Garam = require(process.cwd()+'/server/lib/Garam')
    , _ = require('underscore')
  
    ,BaseTransaction = require(process.cwd()+'/server/lib/BaseTransaction');




module.exports = BaseTransaction.extend({
    pid:'loginReqWorker',
    create : function() {

        this._packet = {
            ip : '',
            serverType:'',
            serverName :'',
            masterServerName:'',
            port:0,
            workerId:0,
            servercode :''
        }
    },
    addEvent : function(client) {



    }




});

