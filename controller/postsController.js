const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const { db } = require("../config/database");
const moment = require("moment");
const APIFeatures = require("../utils/apiFeatures");
const uploadFile = require('../utils/uploadFile')
const cloudinary = require("cloudinary").v2;


exports.getAllPosts = catchAsyncErrors(async (req, res, next) => {
    try {
        // First, count the total number of posts
        const countQuery = `SELECT COUNT(*) AS totalPosts FROM posts`;
        
        db.query(countQuery, (err, countData) => {
            if (err) {
                return next(new ErrorHandler("Error in fetching post count", 402));
            }
            
            const totalPosts = countData[0].totalPosts;
            
            let q = `SELECT p.*, u.id AS userId, u.username, u.profilePic
                     FROM posts AS p 
                     JOIN users AS u ON u.id = p.userId`;

            // Initialize the APIFeatures with filtering and pagination
            const apiFeatures = new APIFeatures(q, req.query)
                .filterByUserId() // Filter by userId if provided

            // Get the modified query with LIMIT, OFFSET, and WHERE clause if applied
            q = apiFeatures.query;

            // Execute the query to fetch posts
            db.query(q, (err, data) => {
                if (err) {
                    return next(new ErrorHandler("Error in fetching post data", 402));
                }
                return res.status(200).json({
                    success: true,
                    totalPosts,
                    data,
                });
            });
        });
    } catch (err) {
        return next(new ErrorHandler(err, 400));
    }
});


exports.getUsersPosts = catchAsyncErrors(async (req, res, next) => {
	const userId = req.user;

	try {
		const q = `
            SELECT DISTINCT p.*, u.id AS userId, username, profilePic 
            FROM posts AS p 
            JOIN users AS u ON (u.id = p.userId) 
            LEFT JOIN relationships AS r ON (p.userId = r.followedUserId) 
            WHERE r.followerUserId = ? OR p.userId = ?
            ORDER BY p.createdAt DESC`;

		db.query(q, [userId, userId], (err, data) => {
			if (err) {
				console.error("SQL Error: ", err);
				return next(new ErrorHandler("Database query failed", 500));
			}
			return res.status(200).json({
				success: true,
				data,
			});
		});
	} catch (err) {
		console.error("Catch Error: ", err);
		return next(new ErrorHandler(err.message, 400));
	}
});


exports.addPost = catchAsyncErrors(async (req, res, next) => {
	let uploadFileResult = null;

	try {
		if (req.file) {
			// Use the uploadFile utility function to upload the image
			uploadFileResult = await uploadFile(req.file.buffer, "socialApp/DescImg");
		}
	} catch (error) {
		console.error("Error uploading post image:", error);
		return next(new ErrorHandler("Error in uploading profile picture", 400));
	}

	const { desc } = req.body;
	const userId = req.user;

	// Validate userId and desc
	if (!userId) {
		return next(new ErrorHandler("UserId cannot be empty", 500));
	}

	if (!desc || desc.length === 0) {
		return next(new ErrorHandler("Post description cannot be empty", 500));
	}

	// Continue with the database insert
	const query = `INSERT INTO posts (\`desc\`, img, createdAt, userId) VALUES (?, ?, ?, ?)`;

	const values = [
		desc,
		uploadFileResult ? uploadFileResult.secure_url : null,
		moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
		userId,
	];

	db.query(query, values, (err, data) => {
		if (err) {
			console.error("Database error:", err);
			return next(new ErrorHandler("Failed to add post", 500));
		}
		return res.status(200).json({
			success: true,
			message: "Post created successfully",
			data,
		});
	});
});


exports.deletePost = catchAsyncErrors(async (req, res, next) => {
    const postId = req.params.postId;

    const q = `SELECT img FROM posts WHERE id = ?`;

    db.query(q, [postId], async (err, data) => {
        if (err) return next(new ErrorHandler(err, 500));

        if (data.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        const imgUrl = data[0].img;
        if (imgUrl && imgUrl.length !== 0) {
            try {
                // Extract the full public_id (including folder path) from the URL
                const public_Id = imgUrl.split('/').slice(-3).join('/').split('.')[0];

                // Delete the image from Cloudinary
                await cloudinary.uploader.destroy(public_Id);
                console.log(`Image deleted from Cloudinary with public ID: ${public_Id}`);

            } catch (error) {
                console.error("Error deleting image from Cloudinary:", error);
                return next(new ErrorHandler("Failed to delete image from Cloudinary", 500));
            }
        }

        // After successfully deleting from Cloudinary, delete the post from the database
        const deleteQuery = `DELETE FROM posts WHERE id = ?`;
        db.query(deleteQuery, [postId], (err, result) => {
            if (err) return next(new ErrorHandler(err, 500));

            return res.status(200).json({
                success: true,
                message: 'Post deleted successfully',
                postId
            });
        });
    });
});
