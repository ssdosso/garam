var

    Garam = require(process.cwd()+'/server/lib/Garam')
    , _ = require('underscore')
    ,BaseTransaction = require(process.cwd()+'/server/lib/BaseTransaction');




module.exports = BaseTransaction.extend({
    pid:'reLoginMasterServer',
    create : function() {

        this._packet = {
         
            ip : '',
            serverType:'',
            serverName :'',
            servercode :''

        }
    },
    addEvent : function(client) {



    }




});

