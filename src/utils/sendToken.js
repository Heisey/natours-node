const jwt = require('jsonwebtoken')

const signToken = id => {
    return jwt.sign({
        id
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

const createSendToken = (user, statusCode, res) => {

    // ** Create JWT Token
    const token = signToken(user._id)

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