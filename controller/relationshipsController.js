const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const { db } = require("../config/database");
const APIFeatures = require("../utils/apiFeatures");

exports.getFollowers = catchAsyncErrors(async (req, res, next) => {
	const followedUserId = req.params.followedUserId;

	const q = `SELECT followerUserId FROM relationships WHERE followedUserId = ?`;

	db.query(q, [followedUserId], (err, data) => {
		if (err) {
			return next(new ErrorHandler(err, 404));
		}

		if (!followedUserId) {
			return next(new ErrorHandler("No user specified for following", 404));
		}

		if (data.length === 0) {
			return res.status(200).json({
				success: true,
				message: `User with ID ${followedUserId} has no followers.`,
				data: [],
			});
		}

		return res
			.status(200)
			.json(data.map((followed) => followed.followerUserId));
	});
});

exports.addFollower = catchAsyncErrors(async (req, res, next) => {
	const { followerUserId, followedUserId } = req.body;

	if (!followerUserId || !followedUserId) {
		return res.status(400).json({
			success: false,
			message: "Both followerUserId and followedUserId are required.",
		});
	}

	const checkQuery =
		"SELECT * FROM relationships WHERE followerUserId = ? AND followedUserId = ?";
	db.query(checkQuery, [followerUserId, followedUserId], (err, result) => {
		if (err) {
			return next(new ErrorHandler("Database error", 500));
		}

		if (result.length > 0) {
			return res.status(400).json({
				success: false,
				message: "User is already a follower",
				result,
			});
		}

		const q =
			"INSERT INTO relationships (`followerUserId`, `followedUserId`) VALUES (?, ?)";
		const values = [followerUserId, followedUserId];

		db.query(q, values, (err, data) => {
			if (err) {
				return next(new ErrorHandler("Error in following", 500));
			}

			return res.status(201).json({
				success: true,
				message: "Followed successfully",
				data,
			});
		});
	});
});

exports.unFollowUser = catchAsyncErrors(async (req, res, next) => {
	const followerUserId = req.query.followerUserId;
	const followedUserId = req.query.followedUserId;

	// Check if the relationship exists
	const checkQuery =
		"SELECT * FROM relationships WHERE followerUserId = ? AND followedUserId = ?";
	db.query(checkQuery, [followerUserId, followedUserId], (err, result) => {
		if (err) {
			return next(new ErrorHandler("Database error", 500));
		}

		if (result.length === 0) {
			return res.status(404).json({
				success: false,
				message: "No follow relationship found",
			});
		}

		// Delete the relationship
		const deleteQuery =
			"DELETE FROM relationships WHERE followerUserId = ? AND followedUserId = ?";
		db.query(deleteQuery, [followerUserId, followedUserId], (err, data) => {
			if (err) {
				return next(new ErrorHandler("Error in unFollowing", 500));
			}

			return res.status(200).json({
				success: true,
				message: "UnFollowed successfully",
				data,
			});
		});
	});
});

exports.getNonFollowers = catchAsyncErrors(async (req, res, next) => {
	const followedUserId = req.params.followedUserId;
	const userId = req.user;

	if (!followedUserId) {
		return next(new ErrorHandler("Followed user ID is required.", 400));
	}
	if (!userId) {
		return next(new ErrorHandler("Requesting user ID is required.", 400));
	}

	const baseQuery = `
        SELECT u.id, u.username, u.name, u.profilePic
        FROM users u
        WHERE u.id != ? 
        AND NOT EXISTS (
            SELECT 1 
            FROM relationships r 
            WHERE r.followerUserId = u.id AND r.followedUserId = ?
        )
    `;

	const apiFeatures = new APIFeatures(baseQuery, req.query).pagination(10);

	db.query(apiFeatures.query, [userId, followedUserId], (err, data) => {
		if (err) {
			return next(new ErrorHandler(err, 500));
		}

		if (data.length === 0) {
			return res.status(200).json({
				success: true,
				message: `User with ID ${followedUserId} has no non-followers.`,
				data: [],
			});
		}

		return res.status(200).json({
			success: true,
			message: "Non-followers retrieved successfully.",
			data,
		});
	});
});


exports.getFollowingData = catchAsyncErrors(async (req, res, next) => {
    const followerUserId = req.params.followerUserId;

    // SQL query to fetch users that the follower is following
    const q = `
        SELECT u.id, u.username, u.name, u.profilePic 
        FROM users u 
        JOIN relationships r ON u.id = r.followedUserId 
        WHERE r.followerUserId = ?
    `;

    db.query(q, [followerUserId], (err, data) => {
        if (err) {
            return next(new ErrorHandler(err.message || 'Database query failed', 500));
        }

        if (data.length === 0) {
            return res.status(200).json({
                success: true,
                message: `User with ID ${followerUserId} has no followers.`,
                data: [],
            });
        }

        // Successfully retrieved followed users
        return res.status(200).json({
            success: true,
            message: "Followed retrieved successfully.",
            data,
        });
    });
});



exports.getFollowersData = catchAsyncErrors(async (req, res, next) => {
	const followedUserId = req.params.followedUserId;

	if (!followedUserId) {
		return next(new ErrorHandler("Followed user ID is required.", 400));
	}

	const baseQuery = `
        SELECT u.id, u.username, u.name, u.profilePic
        FROM users u
        JOIN relationships r ON u.id = r.followerUserId
        WHERE r.followedUserId = ?
    `;

	const apiFeatures = new APIFeatures(baseQuery, req.query).pagination(10);

	db.query(apiFeatures.query, [followedUserId], (err, data) => {
		if (err) {
			return next(new ErrorHandler(err, 500));
		}

		if (data.length === 0) {
			return res.status(200).json({
				success: true,
				message: `User with ID ${followedUserId} has no followers.`,
				data,
			});
		}

		return res.status(200).json({
			success: true,
			message: "Followers retrieved successfully.",
			data,
		});
	});
});
