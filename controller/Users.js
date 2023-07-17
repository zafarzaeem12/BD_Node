const User = require("../model/Users");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const moment = require("moment");

const Register_New_User = async (req, res) => {
  const typed_Email = req.body.email;
  const typed_phone_number = req.body.phone_number;
  try {
    const check_email = await User.findOne({ email: typed_Email });

    if (check_email?.email == typed_Email) {
      res.send({
        message: "this email is already exists",
        status: 400,
      });
    } else if (typed_phone_number.length > 11) {
      res.send({
        message: "No phone_number more than exceed with 11 digits",
        status: 400,
      });
    } else {
      const userAvator = req?.files?.user_image?.map((data) =>
        data?.path?.replace(/\\/g, "/")
      );
      const db = moment(req.body.dob, "YYYY-MM-DD").toDate();
      const newUser = new User({
        name: req.body.name,
        email: typed_Email,
        password: CryptoJS.AES.encrypt(
          req.body.password,
          process.env.SECRET_KEY
        ).toString(),
        user_image: userAvator,
        phone_number: req.body.phone_number,
        dob: db,
        user_device_token: req.body.user_device_token || "asdfghjkl",
        user_device_type: req.body.user_device_type || "android",
      });
      const Register = await newUser.save();

      res.send({
        message: `New User ${Register?.name} created Successfully`,
        status: 201,
        data: Register,
      });
    }
  } catch (err) {
    res.send({
      message: err.message,
      status: 404,
    });
  }
};

const LoginRegisteredUser = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const user_device_token = req.body.user_device_token || "asdfghjkl";
    const user_device_type = req.body.user_device_type || "android";

    const LoginUser = await User.findOne({
      email: email,
      user_device_token: user_device_token,
      user_device_type: user_device_type,
    });
    const gen_password = CryptoJS.AES.decrypt(
      LoginUser?.password,
      process.env.SECRET_KEY
    );
    const original_password = gen_password.toString(CryptoJS.enc.Utf8);

    if (email !== LoginUser?.email) {
      res.send({ message: "Email Not Matched" });
    } else if (password !== original_password) {
      res.send({ message: "Password Not Matched" });
    } else {
      const token = jwt.sign(
        {
          id: LoginUser._id,
        },
        process.env.SECRET_KEY,
        { expiresIn: "1h" }
      );
      const save_token = await User.findByIdAndUpdate(
        { _id: LoginUser?._id?.toString() },
        { $set: { user_authentication: `${token}` } },
        { new: true }
      );
      const { user_authentication } = save_token;

      res.send({
        message: "Login Successful",
        status: 200,
        data: { user_authentication },
      });
    }
  } catch (err) {
    res.send({
      message: "Login Failed",
      status: 404,
    });
  }
};

const VerifyRegisteredUser = async (req, res) => {
  try {
    const Id = req.id;

    const verified_User = await User.findById(Id);
    const { password, ...details } = verified_User._doc;
    res.send({
      message: `${details?.name} Logged in Successfully`,
      status: 200,
      data: { ...details },
    });
  } catch (err) {
    res.send({
      message: "Login Failed!",
      status: 404,
    });
  }
};

const Update_Existing_User = async (req, res, next) => {
  const userAvator = req?.files?.user_image?.map((data) =>
    data?.path?.replace(/\\/g, "/")
  );
  const db = moment(req.body.dob, "YYYY-MM-DD").toDate();
  const Id = req.id;
  try {
    const Update_user = await User.findByIdAndUpdate(
      { _id: Id },
      {
        $set: {
          name: req.body.name,
          phone_number: req.body.phone_number,
          dob: db,
          user_image: userAvator,
          user_is_profile_complete: true,
        },
      },
      { new: true }
    );
    const { password, ...others } = Update_user._doc;

    res.send({
      message: `User Updated Successfully`,
      data: 204,
      data: others,
    });
  } catch (err) {
    res.send({
      message: `No User Updated`,
      status: 404,
    });
  }
};

const Delete_Existing_User_Permanently = async (req, res, next) => {
  const Id = req.id;
  try {
    const deleteUser = await User.deleteOne({ _id: Id });
    const { acknowledged, deletedCount } = deleteUser;

    if (acknowledged === true && deletedCount === 1) {
      res.send({
        message: "User Delete Successfully",
        status: 200,
      });
    } else {
      res.send({
        message: "User Not Delete",
        status: 200,
      });
    }
  } catch (err) {
    res.send({
      message: "User Not Found",
      status: 200,
    });
  }
};

const User_Forget_Password = async (req, res, next) => {
  try {
    const email = req.query.email;
    const userfind = await User.findOne({ email: email });
    if (userfind.email == null) {
      res.send({
        message: "Not OTP generated",
        code: 404,
      });
      next();
    } else if (userfind?.email) {
      const num = Math.floor(Math.random() * 9000) + 1000;
      const nums = await User.findOneAndUpdate(
        userfind?.email && userfind?._id,
        {
          $set: {
            verification_code: num,
            user_is_forgot: true,
          },
        },
        { new: true }
      );
      const { verification_code, email, ...others } = nums;
      res.send({
        message: "OTP generated",
        code: 201,
        data: { verification_code, email },
      });
    }
  } catch (err) {
    res.send({
      message: "Not Found OTP",
      code: 404,
    });
  }
};

const OTP_Verification = async (req, res, next) => {
  try {
    const typed_OTP = req.query.verification_code;
    const typed_email = req.query.email;
    const data = await User.findOne({ email: typed_email });
    if (typed_email == data?.email && typed_OTP == data?.verification_code) {
      const checked = await User.updateOne(
        { _id: data?._id },
        { is_verified: true },
        { new: true }
      );
      const { acknowledged, modifiedCount } = checked;
      acknowledged === true && modifiedCount === 1
        ? res.send({
            message: "OTP verified",
            status: 200,
            data: { email: data?.email },
          })
        : null;
    } else {
      res.send({
        message: "OTP Not verified",
        status: 404,
      });
    }
  } catch (err) {
    res.send({
      message: "Data not found",
      status: 404,
    });
  }
};

const User_Reset_Password = async (req, res, next) => {
  const typed_email = req.query.email;
  const typed_password = req.body.password;

  const data = await User.findOne({ email: typed_email });
  if (typed_email == data?.email) {
    const gen_password = CryptoJS.AES.decrypt(
      data?.password,
      process.env.SECRET_KEY
    );
    const original_password = gen_password.toString(CryptoJS.enc.Utf8);

    if (typed_password != original_password) {
      const users = await User.findOneAndUpdate(
        data?.email && data?._id,
        {
          $set: {
            password: CryptoJS.AES.encrypt(
              typed_password,
              process.env.SECRET_KEY
            ).toString(),
          },
        },
        { new: true }
      );

      const { password, ...others } = users;

      res.send({
        message: "Password Changed Successfully",
        status: 201,
        data: others._doc,
      });
    } else {
      res.send({
        message: "Password Not Changed",
        status: 404,
      });
    }
  }
};

const Delete_Existing_User_Temporaray = async (req, res, next) => {
  try {
    const email = req.query.email;
    const is_Blocked = req.query.is_Blocked;
    const is_profile_deleted = req.query.is_profile_deleted;
    const Users = await User.findOne({ email: email });

    if (is_Blocked) {
      const reported_User = await User.findByIdAndUpdate(
        { _id: Users._id },
        { $set: { is_Blocked: is_Blocked } },
        { new: true }
      );
      res.send({
        message:
          reported_User?.is_Blocked === true
            ? `this user ${reported_User?.name} is Blocked successfully`
            : `this user ${reported_User?.name} is Un_Blocked successfully`,
        status: 201,
      });
    } else if (is_profile_deleted) {
      const reported_User = await User.findByIdAndUpdate(
        { _id: Users._id },
        { $set: { is_profile_deleted: is_profile_deleted } },
        { new: true }
      );
      res.send({
        message:
          reported_User?.is_profile_deleted === true
            ? `this user ${reported_User?.name} is Deleted successfully`
            : `this user ${reported_User?.name} is Restore successfully`,
        status: 201,
      });
    }
  } catch (err) {
    res.send({
      message: "Status Not Chnaged",
      status: 404,
    });
  }
};

const Turn_on_or_off_Notifications = async (req, res, next) => {
  const email = req.query.email;
  const notification = req.query.is_notification;
  try{
    const Notify = await User.findOne({ email : email });

    const reported_User = await User.findByIdAndUpdate(
      { _id: Notify._id },
      { $set: { is_notification: notification } },
      { new: true }
    );
    res.send({
      message:
        reported_User?.is_notification === true
          ? `this user ${reported_User?.name} has been Subscribed`
          : `this user ${reported_User?.name} has been Un_Subscribed`,
      status: 201,
    });

  }catch(err){
    res.send({
      message: "Status Not Chnaged",
      status: 404,
    });
  }
};

module.exports = {
  Register_New_User,
  LoginRegisteredUser,
  VerifyRegisteredUser,
  Update_Existing_User,
  Delete_Existing_User_Permanently,
  Delete_Existing_User_Temporaray,
  User_Forget_Password,
  OTP_Verification,
  User_Reset_Password,
  Turn_on_or_off_Notifications,
};
