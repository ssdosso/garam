var _ = require('underscore')
    , Optparse = require('./optparse')
    , fs = require('fs')
    , Base = require('./Base')
    , Garam = require('./Garam')
    , assert= require('assert');

exports =  module.exports  = BlueConfigure;
function BlueConfigure(settingModel) {

    Base.prototype.constructor.apply(this,arguments);
    this._user_options = {};
    this.settingModel = settingModel;


}
_.extend(BlueConfigure.prototype, Base.prototype, {
    loadJson : function(options,appDir) {
        var scope = this,userOpt;

        this.appDir = appDir;
        this.userOpt =  userOpt = Optparse.parse(options, true);

        for (var i in options) {
            this._user_options[options[i].long] = options[i].value;
            for (var j in userOpt) {
                if (j ===options[i].long) {
                    this._user_options[options[i].long] = userOpt[j];
                }
            }

        }


        this.readJsonFile( 'conf', function () {

            this.merge(scope.userOpt);
            Garam.getInstance().emit('onloadConfig');

        });


    },
    get: function(key) {
        return this.settingModel.get(key);
    },
    set: function(key,val) {
        return this.settingModel.set(key,val);
    },
    /**
     * 외부 command 옵션을 읽어 들인다.
     * @param options
     */
    merge :function(options) {
        var scope = this;


        // options =  Optparse.parse(options, true);
        for (var key in options) {
            if (key.length < 2) {
                delete options[key]
            }
        }

        for (var key in options) {
            switch(key) {
                case 'port':

                    var service = this.settingModel.get('service');
                    service.port = options[key];

                    break;
                default :
                    this.settingModel.set(key,options[key]);
                    break;
            }
        }




    },
    jsonFileRead:function (root, callback) {
        this.setSettings(root, 'root', false, function () {
            callback();
        });
    },
    readJsonFile : function() {
        var args = [].slice.call(arguments);

        var fn = args.pop();
        var total = args.length,len=0;
        var self = this;
        _.each(args,function(confDir) {

            var path = __dirname +'/../../'+self.appDir+'/'+confDir;

            var jsonFiles = fs.readdirSync(path);

            var subTotal = jsonFiles.length,subLen=0;


            if (self._user_options.configname ===true) {

                jsonFiles = ['default.json'];
            } else {
                var debugFile = self._user_options.configname +'.json';

                jsonFiles = [debugFile];
            }


            subTotal = 1;

            _.each(jsonFiles,function(jsonfile) {

                var extension = jsonfile.split('.')[1];
                if (extension === 'json') {
                    var targetFile = path + '/' + jsonfile;

                    var setting = JSON.parse(fs.readFileSync(targetFile));

                    for (var key in setting ) {
                        this.settingModel.set(key,setting[key]);
                    }
                }
                subLen++;
                if (subLen ===subTotal) {
                    len++;
                    if (len === total) {

                        fn.call(this);
                    }
                }
            },this);


        },this);
    }
});