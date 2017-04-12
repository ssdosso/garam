/**
 * 샘플입니다.
 * @type {{getInstance: Function}}
 */
var    Backbone = require('backbone')
    ,Garam = require('../../../server/lib/Garam')
    , _ = require('underscore')
    ,assert = require('assert')
    ,moment = require('moment')
    ,crypto = require('crypto')
    ,Model = require('../../../server/lib/inMemoryModel')
    ,Type = require('../../../server/lib/Types');


var Model = Model.extend({
    name :'LiveHitterModel',
    dbName :'inmemory',
    modelType:'inmemory',
    create : function() {
       // this._common = new Common();
        //필드명, 타입, true 이면  null  허용
        /**
         * unique : 중복 허용안함.
         * isNull : null 허용
         */
        this.addField('PlayerID',Type.Int,{unique:true}); // 선수코드
        this.addField('DATA', Type.Json); // 선수데이터
        this.addField('PlayDate',Type.Timestamp); // 경기날짜
        this.addField('WriteDate', Type.Timestamp); // 입력시간
        this.addField('UserName', Type.Str,{isNull:true});


        this.setDefault({
            proceduresOptions: {
                'get': ['PlayerID'] , //기본 get 프로시저의 인자 필드 지정
                'get1':['PlayerID','UserName']
            }
        });


        /**
         * 기본 프로시저는 다음과 같이 생성됨. 
         *   P_LiveHitterModel_Get   : get
         *   P_LiveHitterModel_Set   : set
         *   P_LiveHitterModel_Del   : del
         *   P_LiveHitterModel_Update : put
         */
        this.createModel(function(){
            
        },this);
    },
    setParameter: function(saveData, toDay) {
        return {
            PLAYERID: parseInt(saveData.PLAYERID),
            DATA: saveData,
            PLAYDATE: this._common.setMomentValueOf(toDay),
            WRITEDATE: moment().valueOf()
        }
    },
    setObject: function(saveData) {
        return {
            PLAYERID: parseInt(saveData.PLAYERID),
            AB: saveData.OAB,
            PA: saveData.PA,
            RUN: saveData.RUN,
            H1: saveData.H1,
            H2: saveData.H2,
            H3: saveData.H3,
            HR: saveData.HR,
            RBI: saveData.RBI,
            SB: saveData.STEAL,
            CS: saveData.CS,
            SFH: parseInt(saveData.SH) + parseInt(saveData.SF),
            BB: saveData.BB,
            HP: saveData.HBP,
            KK: saveData.SO,
            GD: saveData.DP
        }
    },
    get: function (keyData, callback) {
        this.query({PLAYDATE: keyData.PLAYDATE, PLAYERID: keyData.PLAYERID}, function (err, models, idx, rows) {
            if (models && typeof models.length !== 'undefined' && models.length > 0) {
                callback(models);
            } else {
                callback(null);
            }
        });
    },
    getPlayerList: function(PLAYERID, callback) {
        this.query({PlayerID: PLAYERID},'get', function (err, models) {
            if (models && typeof models.length !== 'undefined' && models.length > 0) {
                callback(models);
            } else {
                callback(null);
            }
        });
    },
    save1 : function (saveData,callback) {
        this.insert(saveData, function (err,model) {
            if (err) {
                Garam.logger().error('save LiveHitterModel insert : ' + err);
                callback(err);
                return;
            }
          //  console.log('save LiveHitterModel insert : success');
            callback(null,model);
        });
    },
    save: function(saveData, callback) {
        // 순서가 필요 없기때문에 업데이트 추가.
        this.query({PLAYDATE: saveData.PLAYDATE, PLAYERID: saveData.PLAYERID}, function (err, models, idx, rows) {
            if (models && typeof models.length !== 'undefined' && models.length > 0) {
                this.update(models[0], saveData, callback);
            } else {
                this.insert(saveData, function (err) {
                    if (err) {
                        Garam.logger().error('save LiveHitterModel insert : ' + err);
                        callback(err);
                        return;
                    }
                    console.log('save LiveHitterModel insert : success');
                    callback(null);
                });
            }
        }.bind(this));
    },
    update: function(model, saveData, callback) {

        if (!model) {
            Garam.logger().error('Not Found Model');
            callback('Not Found Model');
            return;
        }

        if (!saveData) {
            Garam.logger().error('Not Found Save Data');
            callback('Not Found Save Data');
            return;
        }
       
        model.p({
            DATA: saveData.DATA,
            WriteDate: moment().valueOf()
        });
  
        model.save(function (err) {
            if (err) {
                Garam.logger().error('LiveHitterModel Update : ' + err);
                callback(err);
                return;
            }

            console.log('LiveHitterModel Update : success');
            callback(null);
        });
    },
    delete: function(PlayerID, callback) {

        var self = this;
        console.log('remove1111')
        this.query({PlayerID: PlayerID},'get', function (err, models, idx, rows) {

            if (err) {
                console.log(err);
                return;
            }
         
            self.remove(models[0], function (err) {
                if (err) {
                    Garam.logger().error(err);
                    callback(err);
                    return;
                }
                console.log('## : Delete Redis Player Info');
                callback(null);
            });
          
        });

      
    }
});

module.exports = Model;