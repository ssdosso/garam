var
    Garam = require('../../../server/lib/Garam')
    ,BaseTransaction = require('../../../server/lib/BaseTransaction');



module.exports = BaseTransaction.extend({
    pid:'reqChatMessage',
    create : function() {

        this._packet = {
            "pid":"reqChatMessage",
            "data":""

        }
    },
    addEvent : function(user) {
        user.on(this.pid,function (message) {
          var socketCtl = Garam.getCtl('socket');
            socketCtl.addChatMessage(user,message)
        });
    }




});

