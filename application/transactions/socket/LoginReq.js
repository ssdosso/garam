 var

    Garam = require('../../../server/lib/Garam')

    ,BaseTransaction = require('../../../server/lib/BaseTransaction');




 module.exports = BaseTransaction.extend({
     pid:'LoginReq',

    create : function() {

            this._packet = {
                token : '',
                userId :'',

            }
    },
    addEvent : function(user) {
        /**
         * 사용자 접속
         */
        user.on('LoginReq',function(token,userId) {

             var ctl = Garam.getCtl('socket');
            // var errorCtl = Bf.getCtl('error');
            // if (!userId) {
            //     errorCtl.sendInvalidError(user,'userNotFoundError');
            //   return;
            // }
            //user.send(this.sendError('messgae error ',this._error.SystemError));
            console.log(token)
           
            ctl.sitdownUser(user,token);

           // UserCtl.onUserEnter(token,userId,user);
        }.bind(this));

    }




});

