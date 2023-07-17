const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        unique: true,
        required: true
    },
    user_image: {
        type: Array,
         required: true
    },
    phone_number: {
        type: String,
        required: true
    },
    dob: {
        type: String,
        required: true
    },
    verification_code :{
        type:Number,
        default : 0
    },
    is_verified :{
        type: Boolean,
        default : false
    },
    user_is_profile_complete :{
        type: Boolean,
        default : false
    },
    user_is_forgot :{
        type: Boolean,
        default : false
    },
    user_authentication: {
        type: String,
        default : ""
    },
    user_social_token: {
        type: String,
    },
    user_social_type: {
        type: String,
    },
    user_device_token: {
        type: String,
        required : true
    },
    user_device_type: {
        type: String,
        required : true
        
    },
    is_profile_deleted :{
        type: Boolean,
        default : false
    },
    is_notification :{
        type: Boolean,
        default : false
    },
    is_Blocked :{
        type: Boolean,
        default : false
    },
},
    { timestamps: true }
)
module.exports = mongoose.model("User", UserSchema);