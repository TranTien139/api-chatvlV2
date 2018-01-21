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

  Articles.addPostArticle = function (user_id, title ,description, linkVideo, image, cb) {

    user_id = user_id.toString();

    let UserModel = app.models.Users;

    UserModel.findOne({
      where: {
        id: user_id
      }
    }).then(results =>{
      if(results && results.userSlug && results.userId) {

        let data = {};
        let type;
        if(linkVideo){
          type = "video";
        } else {
          type = "article";
        }
        data["date"] = Math.floor(Date.now()/1000);
        data["source"] = "Post By User";
        data["type"] = type;
        data["title"] = title;
        data["description"] = description;
        data["linkVideo"] = linkVideo;
        data["linkCrawler"] = "Post By User";
        data["status"] = "Publish";
        data["image"] = image;

        data["total_like"] = 0;
        data["like_icon"] = [];
        data["total_share"] = 0;
        data["total_comment"] = 0;

        data["published_at"] = Math.floor(Date.now()/1000);
        data["userId"] = results.userId;
        data["userSlug"] = results.userSlug;

        Articles.create(data).then(result=>{
          cb(null, cst.HTTP_CODE_SUCCESS, cst.MESSAGE_GET_SUCCESS, result);
        });

      } else {
        cb(null, cst.HTTP_CODE_FAILED_DATA, "Không tồn tại user này", {});
      }
    }).catch(err=>{
      cb(null,cst.HTTP_CODE_FAILED_DATA, cst.MESSAGE_GET_FAILED, err);
    });

  }

  Articles.remoteMethod(
    'addPostArticle',
    {
      http: {verb:'post'},
      accepts: [
        {arg: 'user_id', type:'string',required: true},
        {arg: 'title', type:'string', required: true},
        {arg: 'description', type:'string'},
        {arg: 'linkVideo', type:'string'},
        {arg: 'image', type:'string', required: true}
      ],
      returns: [
        {arg: 'code', type:'number'},
        {arg: 'message', type:'string'},
        {arg: 'data', type:'object'}
      ]
    }
  );


  Articles.deteteArticle = function (user_id, article_id , cb) {

    user_id = user_id.toString();
    article_id = article_id.toString();

    Articles.findOne({
      where: {
        userId: user_id,
        id: article_id
      }
    }).then(data=>{
      if(data) {
        Articles.destroyAll({id:article_id}).then(val=>{
          cb(null, cst.HTTP_CODE_SUCCESS, cst.MESSAGE_GET_SUCCESS, data);
        });
      } else {
        cb(null, cst.HTTP_CODE_FAILED_DATA, cst.MESSAGE_GET_FAILED, {});
      }
    }).catch(err=>{
        cb(null,cst.HTTP_CODE_FAILED_DATA, cst.MESSAGE_GET_FAILED, err);
    });

  }

  Articles.remoteMethod(
    'deteteArticle',
    {
      http: {verb:'post'},
      accepts: [
        {arg: 'user_id', type:'string',required: true},
        {arg: 'article_id', type:'string', required: true},
      ],
      returns: [
        {arg: 'code', type:'number'},
        {arg: 'message', type:'string'},
        {arg: 'data', type:'object'}
      ]
    }
  );

};
