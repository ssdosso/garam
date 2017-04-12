
var Garam = require('../../server/lib/Garam')
    ,Application = require('../../server/lib/Application');

var App = Application.extend({

    init : function() {


        this.errorList = {
            SystemError : 1, //정상적인 시스템 이라면 나올 수 없는 경우
            DatabaseError:2,
            NotLoginError : 6,//: Login 하지 않은 유저
            PacketDataTypeError : 5,
            InvalidActionReq : 7,
            NotFoundRoom:8,
            InvalidError:9
        }
    },
    sendError : function(user,message,code) {
        var errorTransaction = this.getTransaction('ErrorRes');
        errorTransaction.addPacket({message:message,code:code ? code : this.errorList.SystemError});
    },
    sendInvalidError: function(user,message) {
        var errorTransaction = this.getTransaction('ErrorRes');
        user.send(errorTransaction.addPacket({message:message,code: this.errorList.InvalidActionReq}));
    }




});

exports.app  =App;
exports.className  = 'error'; //TempUserSession
