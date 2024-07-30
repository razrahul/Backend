import jwt from "jsonwebtoken";
import ErrorHandler from "../Utils/errorHandler.js";
import { catchAsyncError } from "./catchAsyncError.js";
import { User } from "../Models/User.js";
import { Course } from "../Models/Course.js";

export const isAuthenticated = catchAsyncError(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) return next(new ErrorHandler("Not Logged In", 401));

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decoded._id);

  next();
});

// export const authorizeSubscribers = async(req, res, next) => {
//   const cousesId = req.params.id;
//   const activeSubscriptions = req.user.subscription.filter(item => item.course.toString() === cousesId && item.status === "active");//item.status === "active"
//   // console.log(req.user.subscription);
//   // console.log(req.course);
//   // const course = await Course.findById(req.params.id);

//   // console.log(course);
//   // console.log(req.params.id);
  
  
//   //activeSubscriptions.length === 0
//   console.log(activeSubscriptions);
//   if (activeSubscriptions.length === 0 && req.user.role !== "admin")  //req.user.subscription.status !== "active"
//     return next(
//       new ErrorHandler(`Only Subscribers can acces this resource`, 403)
//     );

//   next();
// };

export const authorizeSubscribers = async (req, res, next) => {
  const courseId = req.params.id;
  const hasActiveSubscription = req.user.subscription.some(
    item => item.course.toString() === courseId && item.status === "active"
  );
  // console.log(hasActiveSubscription);
  
  if (!hasActiveSubscription && req.user.role !== "admin") {
    return next(
      new ErrorHandler(`Only Subscribers can access this resource`, 403)
    );
  }

  next();
};


export const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin")
    return next(
      new ErrorHandler(
        `${req.user.role} is not allowed to access this resource`,
        403
      )
    );

  next();
};
