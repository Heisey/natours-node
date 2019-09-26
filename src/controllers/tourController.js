// ?????????????????????????????????????????????????????????
// ??????????????????? Tour Controller ?????????????????????
// ?????????????????????????????????????????????????????????

// ??????????????????? File Modules ????????????????????????
// ?? Utilites
const APIFeatures = require('../utils/apiFeatures')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')

// ?? Model
const Tour = require('../models/tourModel');

// ??????????????????? Node Modules ????????????????????????

// ??????????????????? Vendor Modules ??????????????????????

// ??????????????????? Middleware ??????????????????????????

// ??????????????????? route Handlers ??????????????????????



// ~~ Get All Tours
exports.getAllTours = catchAsync(async (req, res, next) => {

    const features = new APIFeatures(Tour.find(), req.query)

    // ~~ Apply 
    features.filter().sort().limitFields().paginate()

    // ## Query DB
    const tours = await features.query;

    // ^^ Response
    res.status(200).json({
        status: 'success',
        requestTime: req.requestTime,
        results: tours.length,
        data: {
            tours
        }
    });
});

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
exports.getTour = catchAsync(async (req, res, next) => {

    // ~~ Convert param.id to Number
    const id = req.params.id;


    // ## Query DB by ID for Tour
    const tour = await Tour.findById(id);

    // !! Error Handler
    if (!tour) {
        return next(new AppError('No tour found', 404))
    }

    // ^^ Response
    res.status(200).json({
        status: 'success',
        requestTime: req.requestTime,
        data: {
            tour
        }
    });
})


// ~~ Create Tour
exports.createTour = catchAsync(async (req, res, next) => {

    // ## Create Tour Model Instance
    const newTour = await Tour.create(req.body);

    // ## Save Tour to DB
    newTour.save();

    // ^^ Response
    res.status(201).send({
        status: 'success',
        requestTime: req.requestTime,
        data: {
            tour: newTour
        }
    });
});

// ~~ Update Tour
exports.updateTour = catchAsync(async (req, res, next) => {

    // ~~ Convert param.id to Number
    const id = req.params.id;

    // ## Query DB by ID and Update
    const tour = await Tour.findByIdAndUpdate(id, req.body, {
        new: true
    });

    // !! Error Handler
    if (!tour) {
        return next(new AppError('No tour found', 404))
    }

    // ^^ Response
    res.status(200).json({
        status: 'success',
        requestTime: req.requestTime,
        data: {
            tour
        }
    });
});

// ~~ Delete Tour
exports.deleteTour = catchAsync(async (req, res, next) => {

    // ~~ Convert param.id to Number
    const id = req.params.id;

    // ## Query DB by ID to Delete Tour
    const tour = await Tour.findByIdAndDelete(id);

    // !! Error Handler
    if (!tour) {
        return next(new AppError('No tour found', 404))
    }

    // ^^ Response
    res.status(204).json({
        status: 'success',
        requestTime: req.requestTime,
        data: null
    });
});

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