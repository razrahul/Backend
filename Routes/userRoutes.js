import express from 'express';
import {resetPassword, addToPlaylist, removeFromPlaylist, getAllUsers,updateUserRole,deleteUser, deleteMyProfile,
    forgetPassword, updateProfilePic, register, login, logout, getUserProfile, changePassword, updateProfile }  from '../Controllers/userControllers.js'
import { isAuthenticated, authorizeAdmin} from '../Middlewares/auth.js'
import singleUpload from '../Middlewares/multer.js'


const router = express.Router();

//regidster
router.route("/register").post(singleUpload, register)

//login 
router.route("/login").post(login)


//logout
router.route("/logout").get(logout)
//get my pofile
router.route("/me").get(isAuthenticated, getUserProfile)

//delete my pofile
router.route("/me").delete(isAuthenticated, deleteMyProfile)
//cnhe pass

router.route("/changepassword").put(isAuthenticated, changePassword)

//update profile
router.route("/updateprofile").put(isAuthenticated, updateProfile)

//update profile picture
router.route("/updateprofilepicture").put(isAuthenticated, singleUpload, updateProfilePic)

//forget password  // yee sahi se3 kaam nahi kr rha
router.route("/forgetpassword").post(forgetPassword)

//reset password

router.route("/resetpassword/:token").put(resetPassword)

// add to playlist

router.route("/addtoplaylist").post(isAuthenticated, addToPlaylist)

// remove from playlist

router.route("/removefromplaylist").delete(isAuthenticated, removeFromPlaylist)

// admin routes
router.route("/admin/allusers").get(isAuthenticated, authorizeAdmin, getAllUsers)

//update user role &&d  delete user
router.route("/admin/user/:id")
        .put(isAuthenticated,authorizeAdmin,updateUserRole)
        .delete(isAuthenticated, authorizeAdmin, deleteUser)

export default router;