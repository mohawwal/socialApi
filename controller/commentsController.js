const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const { db } = require("../config/database");
const moment = require("moment");


exports.postComment = catchAsyncErrors(async (req, res, next) => {
    const {desc, postId} = req.body
    const userId = req.user;
    console.log(userId)

    if (!userId) {
        return next(new ErrorHandler("UserId cannot be empty", 500));
    }

    const q = `INSERT INTO comments (\`desc\`, createdAt, userId, postId) VALUES (?) `

    const values = [
        desc,
        moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
        userId,
        postId
    ]

    db.query(q, [values], (err, data) => {
        if(err) return next (new ErrorHandler(err, 400))
        return res.status(201).json({
            success: true,
            message: 'comment added',
            data
    })
    })

});


exports.getComments = catchAsyncErrors(async (req, res, next) => {

    const q = `
            SELECT c.*, u.id AS userId, name, profilePic 
            FROM comments AS c 
            JOIN users AS u ON (u.id = c.userId)
            WHERE c.postId = ?
            ORDER BY c.createdAt DESC`;

        db.query(q, [req.query.postId], (err, data) => {
            if(err) return next (new ErrorHandler(err, 400))

            return res.status(200).json({
                success: true,
                data
            })
        })
});
