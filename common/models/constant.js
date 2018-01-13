function define(name, value) {
  Object.defineProperty(exports, name, {
    value: value,
    enumerable: true,
  });
}
exports.MESSAGE_GET_SUCCESS = 'Tải thành công';
exports.MESSAGE_GET_FAILED = 'Tải không thành công';
exports.MESSAGE_GET_DUPLICATE = 'Dữ liệu đã tồn tại';
exports.MESSAGE_GET_NOTFOUND = 'Dữ liệu không tồn tại';
exports.MESSAGE_GET_MISSING_PARAM = 'Nhập thiếu dữ liệu';

exports.HTTP_CODE_SUCCESS = 200;
exports.HTTP_CODE_FAILED_DATA = 400;
exports.HTTP_CODE_FAILED_SERVER = 500;
exports.HTTP_CODE_DUPLICATE = 300;
exports.HTTP_CODE_NOTFOUND = 404;
exports.HTTP_CODE_MISSING_PARAM = 401;
