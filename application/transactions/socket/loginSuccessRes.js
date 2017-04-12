var
    Garam = require('../../../server/lib/Garam')
    ,BaseTransaction = require('../../../server/lib/BaseTransaction');



module.exports = BaseTransaction.extend({
    pid:'loginSuccessRes',

    create : function() {

        this._packet = {
            pid : 'loginSuccessRes'

        }
    },
    addEvent : function(user) {

    }




});

