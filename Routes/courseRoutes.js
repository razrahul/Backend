import express from 'express'
import {deleteLecture, deleteCourse, addLecture, getCourseLectures, getAllCourses, createCourse}  from '../Controllers/courseControllers.js'
import {authorizeAdmin, isAuthenticated, authorizeSubscribers} from '../Middlewares/auth.js'

import singleUpload from '../Middlewares/multer.js'

const router = express.Router()

// get all courses without lectures
router.route("/courses").get( getAllCourses);

// create new couses -only admin
router.route("/createcourse").post(isAuthenticated, authorizeAdmin, singleUpload, createCourse)

// get add lecture . delete couses , det couses details

router.route("/course/:id") 
 .get(isAuthenticated, authorizeSubscribers, getCourseLectures)
 .post(isAuthenticated, authorizeAdmin, singleUpload, addLecture)
 .delete(isAuthenticated, authorizeAdmin, deleteCourse )


//delete lecture 

router
    .route("/lecture")
    .delete(isAuthenticated, authorizeAdmin,deleteLecture);

export default router

// router.route('/').get(healthcheck);

