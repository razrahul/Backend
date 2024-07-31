import { User } from '../Models/User.js'
import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import ErrorHandler from '../Utils/errorHandler.js';
import { sendToken } from '../Utils/sendToken.js';
import { sendEmail } from '../Utils/sendEmail.js';
import crypto from 'crypto'
import { Course } from "../Models/Course.js"
import {v2 as cloudinary} from 'cloudinary'
import getDataUri from '../Utils/dataUri.js'
import { Stats } from '../Models/Stats.js'



export const register = catchAsyncError( async(req, res , next) => {
    const { name, email, password } = req.body;

    const file = req.file;

    if(!name || !email || !password ) return next(new ErrorHandler("please enter All filed ", 400))
    
    let user = await User.findOne({ email }) 
    if(user) return next(new ErrorHandler("User Already Exist", 409))   
    // upload file on cloudanary 

    const fileUri = getDataUri(file);

    const myCloud = await cloudinary.uploader.upload(fileUri.content)


    user = await  User.create({
         name, email, password,
         avatar:{
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
         }
         })
    sendToken(res, user, "Register Suessfully ",201)
})

export const login = catchAsyncError( async(req, res, next) => {
    const { email, password } = req.body;

    if(!email || !password) return next(new ErrorHandler("please enter All filed ", 400))

    const user = await User.findOne({ email }).select("+password")

    if(!user) return next(new ErrorHandler("Invalid Email or Password", 401))

    const isPasswordMatched = await user.comparePassword(password)

    if(!isPasswordMatched) return next(new ErrorHandler("Invalid  Password", 401))

    sendToken(res, user, `Welcome Back, ${user.name}`, 200)
})


export const logout = catchAsyncError( async(req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });
    res.status(200).json({
        success: true,
        message: "Logged Out suessfully",
    });
})

export const getUserProfile = catchAsyncError( async(req, res, next) => {
    const user = await User.findById(req.user._id)

    res.status(200).json ({
        success: true,
        user,
    });
})

export const changePassword = catchAsyncError( async(req, res, next) => {
    const { oldPassword, newPassword } = req.body;

    if(!oldPassword || !newPassword) return next(new ErrorHandler("please enter All filed ", 400))

    const user = await User.findById(req.user._id).select("+password")

    const isPasswordMatched = await user.comparePassword(oldPassword)

    if(!isPasswordMatched) return next(new ErrorHandler("Old Password is Incorrect", 401))

    user.password = newPassword;

    await user.save();

    sendToken(res, user, "Password Changed Successfully", 200)
})


export const updateProfile = catchAsyncError( async(req, res, next) => {
    const { name, email } = req.body;

    const user = await User.findById(req.user._id)

    if(name) user.name = name;
    if(email) user.email = email;

    await user.save();

    res.status(200).json ({
        success: true,
        message: "Profile Updated Successfully",
    });
})

export const updateProfilePic = catchAsyncError(async (req, res, next) =>{
    const file = req.file;

    const user = await User.findById(req.user._id)
    //todo cloudanarry

    const fileUri = getDataUri(file);

    const myCloud = await cloudinary.uploader.upload(fileUri.content)
    // delted upload file from  cloudanary
    
    await cloudinary.uploader.destroy(user.avatar.public_id)

    user.avatar ={
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
    }

    await user.save();

    res.status(200).json({
        success: true,
        message: "Profile Pic Updated Successfully",
    })
})


export const forgetPassword = catchAsyncError(async (req, res, next) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) return next(new ErrorHandler("user not found", 400));

    const resetToken = await user.getResetToken();
    await user.save();

    // send token to email
    //http://localhost:5173//resetpassword/xbaiBidAOUDCbuc

    const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

    const message = `Click on the link to reset your password. 
    ${url}.
    if you have not request then please ignore`;

    await sendEmail(user.email, "E-Learning Password Reset", message)
    
        res.status(200).json({
            success: true,
            message: `Reset Token  sent to ${user.email}`,
            hashtoken:resetToken,
        });
    
});

export const resetPassword = catchAsyncError(async (req, res, next) => {
    const { token } = req.params;
  
    // console.log("Token from request:", token);

    const dbtoken = token;

    // const resetPasswordToken = token
  
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
  
    // console.log("Hashed token:", resetPasswordToken);
  
    const user = await User.findOne({
        $or: [
          { resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } },
          { resetPasswordToken: dbtoken   },
        ]
      });

  
    if (!user) {
      console.log("User not found with token:", resetPasswordToken);
      return next(new ErrorHandler("Token is invalid or has been expired", 401));
    }
  
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
  
    await user.save();
  
    res.status(200).json({
      success: true,
      message: "Password Changed Successfully",
    });

});

export const addToPlaylist = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const course = await Course.findById(req.body.id);

  if (!course) return next(new ErrorHandler("Invalid Course Id", 404));

  const itemExist = user.playlist.find((item) => {
    if (item.course.toString() === course._id.toString()) return true;
  });

  if (itemExist) return next(new ErrorHandler("Item Already Exist", 409));

  user.playlist.push({
    course: course._id,
    poster: course.poster.url,
  });

  await user.save();

  res.status(200).json({
    success: true,
    message: "Added to playlist",
  });
});

export const removeFromPlaylist = catchAsyncError (async (req, res, next) => {
   
    const user = await User.findById(req.user._id)

    const course = await Course.findById(req.query.id)

    if(!course ) return next(new ErrorHandler("Invalid Couse Id", 404))

    const newPlaylist = user.playlist.filter((item)=>{
        if(item.course.toString() !== course._id.toString()) return item;
    })

    user.playlist = newPlaylist;

    user.save()

    res.status(200).json({
        success: true,
        message: "Removed from playlist",
    });

})

// admin controller

export const getAllUsers = catchAsyncError(async (req, res, next ) =>{

    const users = await User.find({})

    res.status(200).json({
        success: true,
        message: "All Users",
        users,
    });
})
export const updateUserRole = catchAsyncError(async (req, res, next ) =>{

    const user = await User.findById(req.params.id)

    if(!user) return next(new ErrorHandler("User not Found", 404))

        if(user.role === "user") user.role = "admin";
        else user.role = "user";

        await user.save();

    res.status(200).json({
        success: true,
        message: " Role Updated",
        
    });
})

export const deleteUser = catchAsyncError(async (req, res, next ) =>{

    const user = await User.findById(req.params.id)

    if(!user) return next(new ErrorHandler("User not Found", 404))

    await cloudinary.uploader.destroy(user.avatar.public_id)  
    
    // cancel Susscripsion
    
    await user.deleteOne();

    res.status(200).json({
        success: true,
        message: "USer Deleted Sucessfully",
        
    });
})

export const deleteMyProfile = catchAsyncError(async (req, res, next ) =>{

    const user = await User.findById(req.user._id)


    await cloudinary.uploader.destroy(user.avatar.public_id)  
    
    // cancel Susscripsion
    
    await user.deleteOne();

    res.status(200)
        .cookie("token", null, {
            expires: new Date(Date.now()),
            // httpOnly: true,
        })
        .json({
        success: true,
        message: "USer Deleted Sucessfully",
        
    });
})

User.watch().on("change", async () => {
    try {
      const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(1);
  
      if (stats.length === 0) {
        console.error('No stats document found.');
        return;
      }
  
      const subscriptionCount = await User.countDocuments({ "subscription.status": "active" });
      const userCount = await User.countDocuments();
  
      stats[0].users = userCount;
      stats[0].subscription = subscriptionCount;
      stats[0].createdAt = new Date();
  
      await stats[0].save();
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  });
  
  