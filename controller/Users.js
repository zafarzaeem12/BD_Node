const User = require('../model/Users')
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
const moment = require('moment');

const Register_New_User = async (req,res) => {
    try{
        const userAvator =  req?.files?.user_image?.map((data) => data?.path?.replace(/\\/g, "/"))
        const db = moment(req.body.dob, 'YYYY-MM-DD').toDate()
        const newUser = new User({
            name : req.body.name ,
            email : req.body.email,
            password : CryptoJS.AES.encrypt(req.body.password, process.env.SECRET_KEY).toString(),
            user_image : userAvator,
            phone_number : req.body.phone_number,
            dob : db
        })
       const Register = await newUser.save();
     
        res.send({
            message:`New User ${Register?.name} created Successfully`,
            status:201,
            data: Register
        })
    }catch(err){
        res.send({
            message:err.message,
            status:404
        })
    }
}

const LoginRegisteredUser = async (req,res,next) => {
    try{
        const email = req.body.email;
        const password = req.body.password;
        const LoginUser = await User.findOne({ email : email });
        const gen_password = CryptoJS.AES.decrypt(LoginUser?.password , process.env.SECRET_KEY);
        const original_password = gen_password.toString(CryptoJS.enc.Utf8);
    
        if(email !== LoginUser?.email ){
            res.send({ message:"Email Not Matched" })
        }else if (password !== original_password){
            res.send({ message:"Password Not Matched" })
        }else{
          const token =  jwt.sign({
                id : LoginUser._id
            }, process.env.SECRET_KEY , { expiresIn: '1h' } )

          console.log( "kkk" ,token)

          const save_token = await User.findByIdAndUpdate( { _id :LoginUser?._id?.toString()} , { $set :{user_authentication : `${token}`} } , {new : true})
        const { user_authentication } = save_token
          
            res.send({
                 message:"Login Successful",
                 status:200,
                 data:{ user_authentication}
                })
        }
    }catch(err){
        res.send({
            message:"Login Failed",
            status:404
           })
    }

}


const VerifyRegisteredUser = async (req,res) => {
    try{
       
        const Id =  req.id

        const verified_User = await User.findById(Id);
        const { password  , ...details } = verified_User._doc
        res.send({
            message:`${details?.name} Logged in Successfully`,
            status:200,
            data : {...details}
        })
    }catch(err){
        res.send({
            message:"Login Failed!",
            status:404
        })
    }
}

const Update_Existing_User = async (req,res,next) => {
    const userAvator =  req?.files?.user_image?.map((data) => data?.path?.replace(/\\/g, "/"))
    const db = moment(req.body.dob, 'YYYY-MM-DD').toDate()
    const Id = req.id;
    try{
        const Update_user = await User.findByIdAndUpdate(
            { _id : Id },
            {
                $set:{
                    name :  req.body.name,
                    phone_number : req.body.phone_number,
                    dob : db,
                    user_image : userAvator
                }
            },
            { new : true}
        )
        const { password , ...others  } = Update_user._doc
       
        res.send({
            message: `User Updated Successfully`,
            data : 204,
            data : others
        })
    }catch(err){
        res.send({
            message: `No User Updated`,
            data : 200,
            data : Update_user
        })
    }
}

const Delete_Existing_User = async ( req, res, next ) => {
    const Id = req.id;
    try{
        const deleteUser = await User.deleteOne({ _id : Id });
        const { acknowledged , deletedCount } = deleteUser

        if(acknowledged === true &&  deletedCount === 1){
            res.send({
                message:'User Delete Successfully',
                status : 200
            })
        } else{
            res.send({
                message:'User Not Delete',
                status : 200
            })
        }
    }catch(err){
        res.send({
            message:'User Not Found',
            status : 200
        })
    }
}

const User_Forget_Password = async (req,res , next ) => {
    try{
    const email = req.query.email;
        const userfind = await User.findOne({ email : email })
        if(userfind.email == null){
            res.send({
                    message: 'Not OTP generated',
                    code : 404
                })
                next();
        }
        else if(userfind.email){
            const num = Math.floor(Math.random() * 9000) + 1000
            const nums = await User.findOneAndUpdate(
                userfind.email  ,
                {
                    $set:{
                        otp : num
                    }
                } ,
                { new : true }
            )
            const { otp , email , ...others } = nums
            res.send({
                message: 'OTP generated',
                code : 201,
                data : { otp , email  }
            })
        }


}catch(err){
    res.send({
        message: 'Not Found OTP',
        code : 404
    })
}


}

const OTP_Verification = async (req,res , next) => {
    try{
        const typed_OTP = req.query.otp;
        const typed_email = req.query.email;
        const data = await User.findOne({ email : typed_email  });
        if(typed_email  == data?.email &&  typed_OTP == data?.otp) {
            res.send({
                message: 'OTP verified',
                status : 200,
                data : {email : data?.email}
            })
        }else{
            res.send({
                message: 'OTP Not verified',
                status : 404
            }) 
        }
    }catch(err){
        res.send({
            message: 'Data not found',
            status : 404
        }) 
    }
}

const User_Reset_Password = async (req,res,next) => {
 
    const typed_email = req.query.email;
    const typed_password = req.body.password

    const data = await User.findOne({ email : typed_email  });
    if(typed_email  == data?.email ) {
        const gen_password = CryptoJS.AES.decrypt(data?.password , process.env.SECRET_KEY);
        const original_password = gen_password.toString(CryptoJS.enc.Utf8);

        if(typed_password != original_password){
               const users =  await User.findOneAndUpdate( 
                data?.email , 
                { $set : { password : CryptoJS.AES.encrypt(typed_password, process.env.SECRET_KEY).toString(),}} ,
                { new : true }
                 )
                
                 const { password , ...others  } = users

            res.send({
                message : "Password Changed Successfully",
                status : 201,
                data :others._doc
            })
        }else{
            res.send({
                message : "Password Not Changed",
                status : 404
            })
        }

       
   
    }
}

module.exports = {
    Register_New_User,
    LoginRegisteredUser,
    VerifyRegisteredUser,
    Update_Existing_User,
    Delete_Existing_User,
    User_Forget_Password,
    OTP_Verification,
    User_Reset_Password
}
