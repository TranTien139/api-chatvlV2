'use strict';

const app = require('../../server/server.js');
const cst = require('./constant.js');

module.exports = function(Articles) {


  Articles.disableRemoteMethod('__get__getUser', false);

  Articles.getArticleNew = function (user_id, slug_user ,size, page, cb) {

    size = parseInt(size, 10);
    page = parseInt(page, 10);
    let skip = (page - 1)*size;

    let where = {status: "Publish"};
    if(slug_user){
      where.userSlug = slug_user;
    }

    Articles.find({
      include:{
        relation: "getUser",
        scope:{
          fields: ["image","userSlug","name"]
        }
      },
      where: where,
      skip: skip,
      limit: size,
      order: "date DESC"
    }).then(results=>{
      if(!results){
          results = [];
      }
      let next_page = results.length - size < 0 ? -1 : page + 1;
        cb(null, cst.HTTP_CODE_SUCCESS, cst.MESSAGE_GET_SUCCESS,{results, next_page});
    }).catch(err=>{
        cb(null,cst.HTTP_CODE_FAILED_DATA, cst.MESSAGE_GET_FAILED, err);
    });
  }

  Articles.remoteMethod(
    'getArticleNew',
    {
      http: {verb:'post'},
      accepts: [
        {arg: 'user_id', type:'string',required: true},
        {arg: 'slug_user', type:'string'},
        {arg: 'size', type:'number', default: 10},
        {arg: 'page', type:'number', default: 1}
      ],
      returns: [
        {arg: 'code', type:'number'},
        {arg: 'message', type:'string'},
        {arg: 'data', type:'object'}
      ]
    }
  );


  Articles.getArticleDetail = function (user_id, id_article, cb) {

    id_article = id_article.toString();

    Articles.findOne({
      include:{
        relation: "getUser",
        scope:{
          fields: ["image","userSlug","name"]
        }
      },
      where: {
        status: "Publish",
        _id: id_article
      },
    }).then(results=>{
      if(!results){
        results = {};
      }
      cb(null, cst.HTTP_CODE_SUCCESS, cst.MESSAGE_GET_SUCCESS,results);
    }).catch(err=>{
      cb(null,cst.HTTP_CODE_FAILED_DATA, cst.MESSAGE_GET_FAILED, err);
    });
  }

  Articles.remoteMethod(
    'getArticleDetail',
    {
      http: {verb:'post'},
      accepts: [
        {arg: 'user_id', type:'string',required: true},
        {arg: 'id_article', type:'string', required: true}
      ],
      returns: [
        {arg: 'code', type:'number'},
        {arg: 'message', type:'string'},
        {arg: 'data', type:'object'}
      ]
    }
  );

};
