// ?????????????????????????????????????????????????????????
// ??????????????????? User Router ?????????????????????????
// ?????????????????????????????????????????????????????????


// ??????????????????? File Modules ????????????????????????
// ?? Controllers
const authController = require('../controllers/authController')
const userController = require('../controllers/userController')

// ??????????????????? Node Modules ????????????????????????

// ??????????????????? Vendor Modules ??????????????????????
const express = require('express');

// ~~ Create Router for Users
const router = express.Router();
module.exports = router

// ~~ Signup new user
router
    .route('/signup')
    .post(authController.signup)

// ~~ Login user
router
    .route('/login')
    .post(authController.login)

// ~~ Forgot Password
router
    .route('/forgotPassword')
    .post(authController.forgotPassword)

// ~~ Reset Password
router
    .route('/resetPassword/:token')
    .patch(authController.resetPassword)

// ~~ Update Password
router
    .route('/updatePassword')
    .patch(authController.protect, authController.updatePassword)


// ~~ Update user info
router
    .route('/updateMe')
    .patch(authController.protect, userController.updateMe)

// ~~ Delete User
router
    .route('/deleteMe')
    .delete(authController.protect, userController.deleteMe)
    
// ~~ User Root Route
router
    .route('/')
    .get(userController.getAllUsers) // ^^ Get All Users
    .post(userController.createUser) // ^^ Create User

// ~~ User ID Route
router
    .route('/:id')
    .get(userController.getUser) // ^^ Get User By Id
    .patch(userController.updateUser) // ^^ Update User By id
    .delete(userController.deleteUser) // ^^ Delete User By id