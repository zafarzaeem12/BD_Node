const jwt = require("jsonwebtoken");
const User = require("../model/Users");
const User_Token_Authentication = async (req, res, next) => {
  const token = req.headers["authorization"].split(" ")[1];
  const auth = await User.findOne({ user_authentication: token });

  if (!token) {
    return res.send({
      message: "token is expired you are still un-Authorized",
      status: 400,
    });
  } else if (auth?.user_authentication !== token) {
    return res.send({ message: "token is not matched", status: 400 });
  }
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.id = decoded.id;

    next();
  } catch (err) {
    res.status(400).send("Invalid token.");
  }
  return next;
};
module.exports = User_Token_Authentication;
