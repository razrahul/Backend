import { Course}  from '../Models/Course.js'
import {catchAsyncError} from '../Middlewares/catchAsyncError.js'
import ErrorHandler from '../Utils/errorHandler.js'
import getDataUri from '../Utils/dataUri.js';
import { v2 as cloudinary} from 'cloudinary'


export const getAllCourses = catchAsyncError( async (req , resp, next ) => {
  
    const keyword = req.query.keyword || "";
  const category = req.query.category || "";

  const courses = await Course.find({
    title: {
      $regex: keyword,
      $options: "i",
    },
    category: {
      $regex: category,
      $options: "i",
    },
  }).select("-lectures");
  
     resp.status(200).json({
         success: true,
         courses,
     })
   
})


export const createCourse = catchAsyncError( async (req , resp, next ) => {
  
    const {title, description, category, createdBy } = req.body;
    
    if(! title || !description || !category || !createdBy) return next( new ErrorHandler("Please fill all the fields", 400))

    const file = req.file;
    // console.log(file);

    const fileUri = getDataUri(file)

    const mycloud = await cloudinary.uploader.upload(fileUri.content)
    

    await Course.create({
        title, description, category , createdBy,
        poster:{
            public_id: mycloud.public_id,
            url:mycloud. secure_url,
        }

    })


     resp.status(200).json({
         success: true,
         message: "Course Created Successfully. you can add lecture now",
     })
   
})

export const getCourseLectures = catchAsyncError( async (req , resp, next ) => {
  
    const course = await Course.findById(req.params.id);

    if(!course) return next(new ErrorHandler("Course not found", 404))

    course.views += 1;

    await course.save();

    resp.status(200).json({
        success: true,
        lectures: course.lectures,
    })
  
})
// max video size 100mb
export const addLecture = catchAsyncError( async (req , resp, next ) => {
    const { id } = req.params;
    const {title, description} = req.body;

    // const file = req.file

    const course = await Course.findById(id);

    if(!course) return next(new ErrorHandler("Course not found", 404))
 //uploaded cloudanary here
    const file = req.file;
    // console.log(file);
    const fileUri = getDataUri(file)

    const mycloud = await cloudinary.uploader.upload(fileUri.content,{
        resource_type: "video"
    })

   course.lectures.push({
       title,
       description,
       video: {
          public_id: mycloud.public_id,
          url:mycloud.secure_url,
       }
   })

   course.numOfVideos = course.lectures.length;

    await course.save();

    resp.status(200).json({
        success: true,
        message: "Lecture added in Course"
    })
  
})

export const deleteCourse = catchAsyncError( async (req , resp, next ) => {
  
    const {id} = req.params;
    
    const course = await Course.findById(id);
    
    if(!course) return next(new ErrorHandler("Course not found", 404))

    await cloudinary.uploader.destroy(course.poster.public_id)

    for (let i = 0; i < course.lectures.length; i++) {
        const singleLecture = course.lectures[i]

        await cloudinary.uploader.destroy(singleLecture.video.public_id,{
            resource_type: "video"
        })
        
    }
        // console.log(course);
        
    await course.deleteOne()

     resp.status(200).json({
         success: true,
         message: "Course Deleted Successfully."
     })
   
})
export const deleteLecture = catchAsyncError( async (req , resp, next ) => {
  
    const {courseId, lectureId} = req.query;
    
    const course = await Course.findById(courseId);
    
    if(!course) return next(new ErrorHandler("Course not found", 404))


  const lecture = course.lectures.find((item) => {
        if(item._id.toString() === lectureId.toString()) return item;
    })

     await cloudinary.uploader.destroy(lecture.video.public_id,{
        resource_type: "video"
    })

    course.lectures = course.lectures.filter((item) => {
        if(item._id.toString() !== lectureId.toString()) return item;
    })
    course.numOfVideos = course.lectures.length;

    await course.save()


     resp.status(200).json({
         success: true,
         message: "Lecture Deleted Successfully."
     })
   
})

