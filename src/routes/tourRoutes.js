// ?????????????????????????????????????????????????????????
// ??????????????????? Tour Router ?????????????????????????
// ?????????????????????????????????????????????????????????

// ??????????????????? File Modules ????????????????????????
const tourController = require('../controllers/tourController')

// ??????????????????? Node Modules ????????????????????????

// ??????????????????? Vendor Modules ??????????????????????

const express = require('express')



// ~~ Create Router for Tours
const router = express.Router();
module.exports = router

// ~~ Check for valid ID Middleware
router.param('id', tourController.checkID)

// ~~ Tours Root Route
router
    .route('/')
    .get(tourController.getAllTours) // ^^ Get All Tours
    .post(tourController.checkBody, tourController.createTour); // ^^ Create Tour

// ~~ Tours ID Route
router
    .route('/:id')
    .get(tourController.getTour) // ^^ Get Tour By Id
    .patch(tourController.updateTour) // ^^ Update Tour By id
    .delete(tourController.deleteTour); // ^^ Delete Tour By id