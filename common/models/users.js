'use strict';

const app = require('../../server/server.js');
const cst = require('./constant.js');

module.exports = function (Users) {

  Users.getTopUser = function (user_id, type ,cb) {

    if(!type){
      type = 3;
    }

    Users.find({
      limit: 10,
    }).then((results)=> {

      results = results.map((obj)=>{
        if(type === 1) {
          obj['total_score'] = Math.floor(Math.random() * 100);
        }else if(type ===2){
          obj['total_score'] = Math.floor(Math.random() * 10000) + 100;
        }else {
          obj['total_score'] = Math.floor(Math.random() * 1000000) + 10000;
        }
        return obj;
      });
      cb(null, cst.HTTP_CODE_SUCCESS, cst.MESSAGE_GET_SUCCESS, {results, next_page:-1});
    }).catch(err=>{
      cb(null, cst.HTTP_CODE_SUCCESS, cst.MESSAGE_GET_SUCCESS, err);
    });

  }

  Users.remoteMethod(
    'getTopUser',
    {
      http: {verb:'post'},
      accepts: [
        {arg: 'user_id', type:'string', required: true},
        {arg: 'type', type:'number', required: true, description:"1 la ngay, 2 la tuan, 3 la tat ca"}
      ],
      returns: [
        {arg: 'code', type:'number'},
        {arg: 'message', type:'string'},
        {arg: 'data', type:'object'}
      ]
    }
  );
}
