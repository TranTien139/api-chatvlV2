'use strict';

const app = require('../../server/server.js');
const cst = require('./constant.js');
const ultil = require('../ultils/getmongo.js');
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

module.exports = function (LeaderPost) {


  LeaderPost.initTopUser = async function (type,cb) {

    let user = await app.models.Users.find({});

    cb(null, cst.HTTP_CODE_SUCCESS, cst.MESSAGE_GET_SUCCESS, {results:user, next_page:-1});
  }

  LeaderPost.remoteMethod(
    'initTopUser',
    {
      http: {verb:'post'},
      accepts: [
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
