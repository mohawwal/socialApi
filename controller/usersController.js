const ErrorHandler = require('../utils/errorHandler')
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const { db } = require("../config/database");
const APIFeatures = require('../utils/apiFeatures');


exports.allUsers = catchAsyncErrors(async (req, res, next) => {
    try {
        let q = `SELECT * FROM users`

        const features = new APIFeatures(q, req.query)
            .search()

        q = features.query;

        db.query(q, (err, data) => {
            if(err) {
                return next (new ErrorHandler(err, 400))
            }

            const users = data.map(user => {
                const {password, ...info} = user
                return info
            })

            return res.status(200).json({
                success: true,
                data: users
            })
        })

    }catch(error) {
        console.log(error)
    }
})

exports.findUserById = catchAsyncErrors(async(req, res, next) => {
    try {
        const userId = req.params.userId

        const q = `SELECT * FROM users WHERE id = ?`

        db.query(q, [userId], (err, data) => {
            if(err) {
                return next (new ErrorHandler(err, 400))
            }

            if(data.length === 0) {
                return next (new ErrorHandler('user not found', 404))
            }

            const { password, ...info } = data[0]
            return res.status(200).json({
                info
            })
        })
    } catch(error) {
        console.log(error)
        next(new ErrorHandler('Internal Server Error', 500));
    }
})