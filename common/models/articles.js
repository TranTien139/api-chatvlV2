'use strict';
module.exports = function(Articles) {
  Articles.getArticleNew = function (user_id, cb) {
    Articles.find({
      where: {
        status: "Publish"
      }
    }).then(data=>{
      cb(null, 200, 'Thanh cong', data);
    }).catch(err=>{
      cb(null, 200, 'That bai', err);
    });
  }

  Articles.remoteMethod(
    'getArticleNew',
    {
      http: {verb:'post'},
      accepts: [
        {arg: 'user_id', type:'string',required: true}
      ],
      returns: [
        {arg: 'code', type:'number'},
        {arg: 'message', type:'string'},
        {arg: 'data', type:'object'}
      ]
    }
  );
};
