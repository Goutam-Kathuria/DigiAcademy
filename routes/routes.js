const express = require('express')
const router = express.Router()

const {register,users,verifyOtp,create,addCourse,getCourse} = require('../controllers/controllers')
const upload = require('../middleware/multer')

router.post('/register',register)
// router.post('/stats',stats)
// router.post('/update',updateStats)
router.post('/addCourse',upload.single('image'),addCourse)
router.get('/courses',getCourse)
router.get('/users',users)
router.post('/verifyOtp',verifyOtp)
router.post('/create',create)
// router.get('/showData',getDashboard)
// router.patch('/conversion-rate', conversionRate)
// router.get('/getconversion', getconversionRate)
// router.get('/Sessions', Sessions)
module.exports=router