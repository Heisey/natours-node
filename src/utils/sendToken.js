// ?????????????????????????????????????????????????????????
// ???????????????????? JWT Handler ????????????????????????
// ?????????????????????????????????????????????????????????

// ??????????????????? File Modules ????????????????????????

// ??????????????????? Node Modules ????????????????????????

// ??????????????????? Vendor Modules ??????????????????????
const jwt = require('jsonwebtoken')

// ~~ Sign JWT Token
const signToken = id => {
    return jwt.sign({
        id
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

// ~~ Create JWT Token
const createSendToken = (user, statusCode, res) => {

    // ** Create JWT Token
    const token = signToken(user._id)

    // ~~ convert expire time into milliseconds
    const expireTime = process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000

    // ** Set cookie parameters
    const cookieOptions = {
        expires: new Date(Date.now() + expireTime),
        httpOnly: true
    }

    // ** Check environment for production to set secure cookie option
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true

    // ** Set cookie with jwt token
    res.cookie('jwt', token, cookieOptions)

    // todo remove token from response and have only in cookie, will have to go through code to implement
    // ^^ Responses
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}

module.exports = createSendToken