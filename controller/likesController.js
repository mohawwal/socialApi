const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const { db } = require("../config/database");

exports.getLikes = catchAsyncErrors(async (req, res, next) => {
	const postId = req.params.postId

	const q = `SELECT userId FROM likes WHERE postId = ?`;

	db.query(q, [postId], (err, data) => {
		if (err) {
            console.error("Database error:", err); 
            return next(new ErrorHandler(err, 400));
        }
        
		return res.status(200).json(
			data.map(like=>like.userId)
		);
        
	});
});


exports.addLike = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user;
    const { postId } = req.body;

    const checkQuery = "SELECT * FROM likes WHERE userId = ? AND postId = ?";
    db.query(checkQuery, [userId, postId], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return next(new ErrorHandler("Database error", 500)); 
        }

        if (result.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Post already liked by this user",
            });
        }

        const insertQuery = "INSERT INTO likes (`userId`, `postId`) VALUES (?, ?)";
        const values = [userId, postId];

        db.query(insertQuery, values, (err, data) => {
            if (err) {
                console.error("Database error during like insertion:", err);
                return next(new ErrorHandler("Error adding like", 500)); // Handle error during like insertion
            }

            return res.status(201).json({
                success: true,
                message: "Post liked successfully",
            });
        });
    });
});


exports.deleteLike = catchAsyncErrors(async (req, res, next) => {
	const userId = req.query.userId;
	const postId = req.query.postId;

	const q = "DELETE FROM likes WHERE userId = ? AND postId = ?";
    

	db.query(q, [userId, postId], (err, data) => {
		if (err) {
			console.error("Database error:", err);
			return next(new ErrorHandler("Failed to remove like", 500));
		}

		if (data.affectedRows === 0) {
			return next(new ErrorHandler("Like not found", 404));
		}
        
		return res.status(200).json({
			success: true,
			message: "Like removed successfully",
            data
		});
	});

});
