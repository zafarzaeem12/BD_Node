const router = require('express').Router();
const auth = require('../middleware/Authentication');
const File = require('../middleware/ImagesandVideosData');
const { 
    Register_New_User ,
    LoginRegisteredUser , 
    VerifyRegisteredUser,
    Update_Existing_User,
    Delete_Existing_User_Permanently,
    User_Forget_Password,
    OTP_Verification,
    User_Reset_Password,
    Delete_Existing_User_Temporaray
} = require('../controller/Users')

router.post('/create_new_User' , File.upload , Register_New_User);
router.post('/login' ,  File.upload ,LoginRegisteredUser);
router.get('/profile' ,auth ,File.upload ,VerifyRegisteredUser );
router.put('/update',auth ,File.upload , Update_Existing_User );
router.delete('/delete',auth , File.upload  , Delete_Existing_User_Permanently );
router.put('/softdelete' , Delete_Existing_User_Temporaray )
router.post('/forget_password' , User_Forget_Password );
router.post('/otp_verify' , OTP_Verification);
router.post('/reset_password' , User_Reset_Password)

module.exports = router