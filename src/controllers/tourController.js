// ?????????????????????????????????????????????????????????
// ??????????????????? Tour Controller ?????????????????????
// ?????????????????????????????????????????????????????????

// ??????????????????? File Modules ????????????????????????
// ?? Utilites
const catchAsync = require('../utils/catchAsync')
const factory = require('../utils/factoryHandler')

// ?? Model
const Tour = require('../models/tourModel');

// ??????????????????? Node Modules ????????????????????????

// ??????????????????? Vendor Modules ??????????????????????

// ??????????????????? Middleware ??????????????????????????

// ??????????????????? route Handlers ??????????????????????

exports.tourFilterFeature = (req, res, next) => {



    next()
}

// ~~ Get All Tours
exports.getAllTours = factory.getAll(Tour)

// ~~ Top 5 Tours
exports.getTopFive = (req, res, next) => {

    // ~~ Set query str
    req.query.limit = '5';
    req.query.sort = '-ratingAverage,price'
    req.query.fields = 'name,price,ratingAverage,summary,difficulty';

    // ~~ Call Get All Tours
    next()
}

// ~~ Get Tour By ID
exports.getTour = factory.getOne(Tour, 'reviews')


// ~~ Create Tour
exports.createTour = factory.createOne(Tour)

// ~~ Update Tour
exports.updateTour = factory.updateOne(Tour)

// ~~ Delete Tour
exports.deleteTour = factory.deleteOne(Tour)

// ~~ Get Tour Stats by Difficulty
exports.getTourStats = catchAsync(async (req, res, next) => {

    // ## Query DB with data aggregation
    const stats = await Tour.aggregate([{
            $match: {
                ratingAverage: {
                    $gte: 3.0
                }
            }
        },
        {
            $group: {
                _id: '$difficulty',
                numTours: {
                    $sum: 1
                },
                numRatings: {
                    $sum: '$ratingsQuantity'
                },
                averageRating: {
                    $avg: '$ratingAverage'
                },
                avgPrice: {
                    $avg: '$price'
                },
                minPrice: {
                    $min: '$price'
                },
                maxPrice: {
                    $max: '$price'
                }
            }
        },
        {
            $sort: {
                avgPrice: 1
            }
        }
    ])

    // ^^ Response
    res.status(200).json({
        status: 'success',
        requestTime: req.requestTime,
        data: {
            stats
        }
    });
})

// ~~ Get Amount of Tours each month for selected year
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {

    // ~~ Parse year
    const year = req.params.year * 1;

    // ## Query DB with Aggregation
    const plan = await Tour.aggregate([{
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: {
                    $month: '$startDates'
                },
                numTourStarts: {
                    $sum: 1
                },
                tours: {
                    $push: '$name'
                }
            }
        },
        {
            $addFields: {
                month: '$_id'
            }
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $sort: {
                numTourStarts: -1
            }
        },
        {
            $limit: 10
        }
    ])

    // ^^ Response
    res.status(200).json({
        status: 'success',
        requestTime: req.requestTime,
        data: {
            plan
        }
    });
})