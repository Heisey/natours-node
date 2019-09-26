// ?????????????????????????????????????????????????????????
// ???????????????????? User Model ?????????????????????????
// ?????????????????????????????????????????????????????????

// ??????????????????? File Modules ????????????????????????
// ?? Utilites
const catchAsync = require('../utils/catchAsync');

// ??????????????????? Node Modules ????????????????????????
const crypto = require('crypto');

// ??????????????????? Vendor Modules ??????????????????????
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name']
    },
    email: {
        type: String,
        required: [true, 'Please provide a email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'please provie a valid email']
    },
    photo: {
        type: String
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [8, 'A password must be 8 or more characters'],
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm password'],
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: 'Passwords do not match'
        }
    },
    passwordChangedAt: {
        type: Date
    },
    passwordResetToken: {
        type: String
    },
    passwordResetExpires: {
        type: Date
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    }
});

// ** Hash Password
userSchema.pre('save', async function (next) {
    // ## Check to seee if password has been modified
    if (!this.isModified('password')) return next();

    // ** Hash Password with Coast 12
    this.password = await bcrypt.hash(this.password, 12);

    // ## Delete passwordConfirm
    this.passwordConfirm = undefined;

    next();
});

userSchema.pre('save', function (next) {

    // ## Check to see if password is modified
    if (!this.isModified('password') || this.isNew) return next()

    this.passwordChangedAt = Date.now() - 5000

    next()
})

// ** Check password
userSchema.methods.checkPassword = async function (candidate, actual) {
    const compare = await bcrypt.compare(candidate, actual);

    return compare;
};

// ** check to see if password has changed after logged in
userSchema.methods.changedPasswordAfter = function (timestamp) {
    if (this.passwordChangedAt) {
        const changeTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );

        return timestamp < changeTimestamp;
    }

    return false;
};

// ** Create reset token for forgotten password
userSchema.methods.resetToken = function () {
    // ** Create reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.passwordResetExpires = Date.now() + (10 * 60 * 1000);

    return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;