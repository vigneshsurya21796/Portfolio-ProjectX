class Apiresponse {
  constructor(statusCode, data, message = "suceess") {
    this.data = data;
    this.statusCode = statusCode;
    this.message = message;
    this.success = statusCode < 400;
  }
}
module.exports = Apiresponse;
