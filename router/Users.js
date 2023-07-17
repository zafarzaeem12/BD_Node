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
    Delete_and_Blocked_Existing_User_Temporaray,
    Turn_on_or_off_Notifications,
    Logout_Existing_User
} = require('../controller/Users')

router.post('/create_new_User' , File.upload , Register_New_User);
router.post('/login' ,  File.upload ,LoginRegisteredUser);
router.get('/profile' ,auth ,File.upload ,VerifyRegisteredUser );
router.put('/update',auth ,File.upload , Update_Existing_User );
router.delete('/delete',auth , File.upload  , Delete_Existing_User_Permanently );
router.put('/softdelete' , Delete_and_Blocked_Existing_User_Temporaray )
router.post('/forget_password' , File.upload , User_Forget_Password );
router.post('/otp_verify' , File.upload , OTP_Verification);
router.post('/reset_password' , File.upload , User_Reset_Password)
router.put('/isnotify' , auth , File.upload ,  Turn_on_or_off_Notifications );
router.post('/logout' , auth , Logout_Existing_User );

module.exports = router