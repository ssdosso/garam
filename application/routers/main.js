
var Router = require('../../server/lib/Router'),
    Garam = require('../../server/lib/Garam');


var ViewRouter = Router.extend(
    {
        start : function() {

            var router=this,self=this;

            this.get('/test',function (req,res) {
                console.log('call test')
            })




        }
    });

/**
 * 필수   exports, 라우터 네임
 * @type {Function}
 */
exports.MainRouter  = ViewRouter;