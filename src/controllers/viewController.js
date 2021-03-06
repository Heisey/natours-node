// ?????????????????????????????????????????????????????????
// ??????????????????? User Controller ?????????????????????
// ?????????????????????????????????????????????????????????

// ??????????????????? File Modules ????????????????????????
// ?? Models
const Tour = require('../models/tourModel')

// ?? Utilities
const catchAsync = require('../utils/catchAsync')

// ??????????????????? Node Modules ????????????????????????

// ??????????????????? Vendor Modules ??????????????????????

// ~~ Get Home Page
exports.getHome = (req, res, next) => {

    res.status(200).render('base', {
        title: 'Exciting tours for adventurous people',
        
    })
}

// ~~ Get overview of all tours
exports.getOverview = catchAsync(async (req, res, next) => {
    
    // ## Query DB for all tours
    const data = await Tour.find();

    // ^^ Response
    res.status(200).render('overview', {
        title: 'All Tours',
        data
    })
})

// ~~ Get Detail about tour
exports.getTour = (req, res, next) => {

    // ^^ Response
    res.status(200).render('tour', {
        title: 'Tour 420'
    })
}