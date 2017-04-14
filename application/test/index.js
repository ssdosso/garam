
var
    Garam = require('../../server/lib/Garam')
    , crypto = require('crypto')
    ,Test = require('../../server/lib/Test');

var Backbone = require('backbone')
    , _ = require('underscore');

var util = require('util');


var TestApp = Test.extend({

    create :function() {
        var bufferMng = Garam.getBufferMng();
            var self = this;
            var crypto = require('crypto');


        if (Garam.getInstance().get('service')) {
            Garam.getInstance().on('listenService', function () {

                var a = [1,100,66,5,88,8,99];
                //선택 정렬
                for (var i=0; i <= a.length; i++) {
                    for (var j=0; j <=a.length; j++) {
                        if(a[j] > a[j+1]) {

                            swap(a,j,j+1);
                        }

                    }
                }



                console.log(a)
                var a = [133,6,22,41,5,1,8,31];
                //삽입 정렬

                for (var i =1; i <a.length;i++) {
                    var key = a[i],j= i-1;
                    while(j>=0 && key <a[j]) {

                        swap(a,j,j+1);
                        j--;
                    }
                }
                console.log(a)

                //버블정렬
                var a = [7,1,8,3,100,33,44,5,11,22];
                for (var i =1; i <a.length;i++) {
                  for(var j = 1; j <a.length;j++) {
                      if(a[j-1] > a[j]) {
                          swap(a,j,j-1);
                      }
                  }
                }

                console.log(a)


                var a = [7,1,8,3,66,88,87,5,11,22];
                var mergeSort = function(array) {
                    if (array.length < 2) return array; // 원소가 하나일 때는 그대로 내보냅니다.
                    var pivot = Math.floor(array.length / 2); // 대략 반으로 쪼개는 코드
                    var left = array.slice(0, pivot); // 쪼갠 왼쪽
                    var right = array.slice(pivot, array.length); // 쪼갠 오른쪽
                    return merge(mergeSort(left), mergeSort(right)); // 재귀적으로 쪼개고 합칩니다.
                }
                function merge(left, right) {
                    var result = [];
                    while (left.length && right.length) {
                        if (left[0] <= right[0]) { // 두 배열의 첫 원소를 비교하여
                            result.push(left.shift()); // 더 작은 수를 결과에 넣어줍니다.
                        } else {
                            result.push(right.shift()); // 오른쪽도 마찬가지
                        }
                    }
                    while (left.length) result.push(left.shift()); // 어느 한 배열이 더 많이 남았다면 나머지를 다 넣어줍니다.
                    while (right.length) result.push(right.shift()); // 오른쪽도 마찬가지
                    return result;
                };

                console.log( mergeSort(a))
                function swap(arr, idx1, idx2) {
                    var temp = arr[idx1];
                    arr[idx1] = arr[idx2];
                    arr[idx2] = temp;
                }
                // Garam.getDB('account').getProcedure('xx_GetTokenKey').getToken('dfrdf',function (err,rows) {
                //     console.log(rows)
                // })

                //
                //
                // Garam.getDB('match').getModel('BattleBoardModel').get({ACTSERIAL:1,START:1,END:2},function (err,model) {
                //     console.log(model)
                // });


               // Garam.getDB('mysqltest').getModel('testQuery').testQuery();
            });

        }
    }
});

//exports.TestApp  =TestApp;
exports = module.exports = TestApp;