// ?????????????????????????????????????????????????????????
// ?????????????? Authorization Contorller ?????????????????
// ?????????????????????????????????????????????????????????

// ??????????????????? File Modules ????????????????????????
// ?? Models
const User = require('../models/userModel')

// ?? Utilites
const AppError = require('../utils/AppError')
const catchAsync = require('../utils/catchAsync')
const sendEmail = require('../utils/email')

// ??????????????????? Node Modules ????????????????????????
const crypto = require('crypto')
const {
    promisify
} = require('util')

// ??????????????????? Vendor Modules ??????????????????????
const jwt = require('jsonwebtoken')

const signToken = id => {
    return jwt.sign({
        id
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

// ~~ Sign Up Users
exports.signup = catchAsync(async (req, res, next) => {

    // ## Query DB to create a new User
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role
    })

    // ** Create a JWT token
    const token = signToken(newUser._id)

    // ^^ Response
    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    })
})

exports.login = catchAsync(async (req, res, next) => {
    const {
        email,
        password
    } = req.body;

    // ~~ Check for email and password exist
    if (!email || !password) {
        throw new AppError('Please provide email and password', 400)
    }

    // ## Query DB by email to get user
    const user = await User.findOne({
        email
    }).select('+password')

    // !! Error Handler
    if (!user) {
        throw new AppError('Sorry could not find that email')
    }

    // ** Check password is correct
    const match = await user.checkPassword(password, user.password)

    // !! Error Handler
    if (!match) {
        throw new AppError('Incorrect email or password', 401)
    }


    // ** Create JWT Token
    const token = signToken(user._id)

    // ^^ Response
    res.status(200).json({
        status: 'success',
        token
    })
})

// ** Protect tours with JWT
exports.protect = catchAsync(async (req, res, next) => {
    let token;
    // ~~ Check for token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    }

    // !! Error Handler
    if (!token) {
        return next(new AppError('You are not logged in', 401))
    }

    // ** Validate Token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

    // ## Query DB
    const user = await User.findById(decoded.id)

    // !! Error Handler
    if (!user) {
        return next(new AppError('The User no longer exists', 401))
    }

    // ** Check user password against token
    if (user.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password please login again', 401))
    }

    req.user = user

    next()
})

// ** Protect paths to roles
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission for this task', 403))
        }

        next()
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {

    // ## Query DB for user
    const user = await User.findOne({
        email: req.body.email
    })

    // !! Error Handler
    if (!user) {
        return next(new AppError('Sorry that email doesnt exist', 404))
    }

    // ** Generate Token
    const resetToken = user.resetToken()
    console.log(resetToken)
    await user.save({
        validateBeforeSave: false
    })


    // ^^ Send response to email
    const resetURL = `${req.protocol}://${req.get('host')}/api/users/resetPassword/${resetToken}`
    const message = `forgot your password submit a ptach request with your new password and passwordConfirm to ${resetURL}`

    try {

        await sendEmail({
            email: user.email,
            subject: 'Your password reset token',
            message
        })
    } catch (err) {
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        await user.save({
            validateBeforeSave: false
        })

        return next(new AppError('There was a problem sending the email', 500))
    }

    res.status(200).json({
        status: 'success',
        message: 'token sent to email'
    })
})

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on the token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: {
            $gt: Date.now()
        }
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3) Update changedPasswordAt property for the user
    // 4) Log the user in, send JWT
    const token = signToken(user._id)

    res.status(200).json({
        status: 'success',
        token
    })
})