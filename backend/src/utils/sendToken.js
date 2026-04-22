const sendToken = (req, res) => {
  const token = req.cookies.token;
  console.log(token);
};
module.exports = sendToken();
