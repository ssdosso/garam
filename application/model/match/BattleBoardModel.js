/**
 * 샘플입니다.
 * @type {{getInstance: Function}}
 */
var Garam = require('../../../server/lib/Garam')
    , moment = require('moment')
    , Model = require('../../../server/lib/Model')
    , Type = require('../../../server/lib/Types');

var Model = Model.extend({
    name :'BattleBoardModel',
    dbName :'match',

    create : function() {
        this.addField('ACTSERIAL', Type.Int, false, ['notEmpty'], true);
        this.addField('START', Type.Boolean, false, [], true);
        this.addField('END', Type.Boolean, false, [], true);
        this.addField('DATA', Type.Json, false);
        this.addField('WRITEDATE', Type.Timestamp, false); // 입력시간
        this.createModel();
    },
    setParameter: function(actserial, start, end, data) {
        return {
            ACTSERIAL: actserial,
            START: start,
            END: end,
            DATA: data,
            WRITEDATE: moment().valueOf()
        }
    },
    get: function(params, callback) {
        this.query({ACTSERIAL: params.ACTSERIAL, START: params.START, END: params.END}, function (err, models, idx, rows) {
            if (models && typeof models.length !== 'undefined' && models.length > 0) {
                callback(err, models);
            } else {
                callback(err, null);
            }
        });
    },
    save: function(saveData, callback) {
        this.query({ACTSERIAL: saveData.ACTSERIAL}, function (err, models, idx, rows) {
            if (models && typeof models.length !== 'undefined' && models.length > 0) {
                this.update(models[0], saveData, callback);
            } else {
                this.insert(saveData, function (err) {
                    if(err) {
                        GFW.logger().error('save BattleBoardModel insert : ' + err);
                        callback(err);
                        return;
                    }
                    console.log('save BattleBoardModel insert : success');
                    callback(null);
                });
            }
        }.bind(this));
    },
    update: function(model, saveData, callback) {

        if (!model) {
            GFW.logger().error('Not Found Model');
            callback('Not Found Model');
            return;
        }

        if (!saveData) {
            GFW.logger().error('Not Found Save Data');
            callback('Not Found Save Data');
            return;
        }

        model.p({
            DATA: saveData.DATA,
            START: saveData.START,
            END: saveData.END,
            WRITEDATE:  moment().valueOf()
        });

        model.save(function (err) {
            if (err) {
                GFW.logger().error('BattleBoardModel Update : ' + err);
                callback(err);
                return;
            }

            console.log('BattleBoardModel Update : success');
            callback(null);
        });
    },
    delete: function(callback) {

        var self = this;
        this.query({}, function (err, models, idx, rows) {

            if (err) {
                console.log(err);
                return;
            }
            run(models, function() {
                console.log('end');
            });
        });

        function run(list, callback) {
            if(list.length > 0) {
                var data = list.pop();
                deleteHitter(list, callback, data)
            } else {

            }
        }

        function deleteHitter(parendData, callback, model) {
            console.log(model);
            self.remove(model, function (err) {
                if (err) {
                    GFW.logger().error(err);
                    callback(err);
                    return;
                }
                run(parendData, callback);
            });
        }
    }
});

module.exports = Model;