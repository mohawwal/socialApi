const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const { db } = require("../config/database");
const APIFeatures = require("../utils/apiFeatures");
const cloudinary = require('cloudinary')
const uploadFile = require('../utils/uploadFile')

exports.allUsers = catchAsyncErrors(async (req, res, next) => {
	try {
		let q = `SELECT * FROM users`;

		const features = new APIFeatures(q, req.query).search();

		q = features.query;

		db.query(q, (err, data) => {
			if (err) {
				return next(new ErrorHandler(err, 400));
			}

			const users = data.map((user) => {
				const { password, ...info } = user;
				return info;
			});

			return res.status(200).json({
				success: true,
				data: users,
			});
		});
	} catch (error) {
		console.log(error);
	}
});

exports.findUserById = catchAsyncErrors(async (req, res, next) => {
	try {
		const userId = req.params.userId;

		const q = `SELECT * FROM users WHERE id = ?`;

		db.query(q, [userId], (err, data) => {
			if (err) {
				return next(new ErrorHandler(err, 400));
			}

			if (data.length === 0) {
				return next(new ErrorHandler("user not found", 404));
			}

			const { password, ...info } = data[0];
			return res.status(200).json({
				info,
			});
		});
	} catch (error) {
		console.log(error);
		return next(new ErrorHandler("Internal Server Error", 500));
	}
});


exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
	const userId = req.user;

	try {
		const newUserData = {
			username: req.body.username,
			email: req.body.email,
			city: req.body.city,
			website: req.body.website,
			Bio: req.body.Bio,
			instagram: req.body.instagram,
			x: req.body.x,
			linkedln: req.body.linkedln,  
		};

		const checkUserQuery = `SELECT username FROM users WHERE username=? AND id !=?`

		db.query(checkUserQuery, [newUserData.username, userId], (err, result) => {
			if(err) return next(new ErrorHandler(err, 500));
			
			if(result.length > 0) {
				return next(new ErrorHandler("Username is already taken, please choose a different one.", 400));
			}
		})

		// SQL query to fetch profile and cover pictures
		const q = `SELECT profilePic, coverPic FROM users WHERE id=?`;
		db.query(q, [userId], async (err, data) => {
			if (err) return next(new ErrorHandler(err, 500));

			const profilePic = data[0].profilePic;
			const coverPic = data[0].coverPic;

			if (req.files) {
				if (req.files['profilePic'] && profilePic && profilePic.length !== 0) {
					const public_Id = profilePic.split('/').slice(-3).join('/').split('.')[0];
					await cloudinary.uploader.destroy(public_Id);
				}

				// If coverPic is provided
				if (req.files['coverPic'] && coverPic && coverPic.length !== 0) {
					const public_Id = coverPic.split('/').slice(-3).join('/').split('.')[0];
					await cloudinary.uploader.destroy(public_Id);
				}

				if(req.files['profilePic']) {
					const profilePicResult = await uploadFile(req.files['profilePic'][0].buffer, "socialApp/profileImg");
					if (profilePicResult) {
						newUserData.profilePic = profilePicResult.secure_url;
					}
				}

				if (req.files['coverPic']) {
					const coverPicResult = await uploadFile(req.files['coverPic'][0].buffer, "socialApp/coverImg");
					if (coverPicResult) {
						newUserData.coverPic = coverPicResult.secure_url;
					}
				}

			}

			await updateUserProfile(req, res, next, newUserData);
		});
	} catch (error) {
		console.log(error);
		return next(new ErrorHandler("Internal Server Error", 500));
	}
});

// Function to update the user's profile in the database
async function updateUserProfile(req, res, next, newProfileData) {
	const userId = req.user;
	const { username, email, city, website, Bio, instagram, x, coverPic, profilePic, linkedln } = newProfileData;

	try {
		const q = "UPDATE users SET username=?, email=?, city=?, website=?, Bio=?, instagram=?, coverPic=?, profilePic=?, x=?, linkedln=? WHERE id = ?";
		const values = [username, email, city, website, Bio, instagram, coverPic, profilePic, x, linkedln, userId];

		db.query(q, values, (err, data) => {
			if (err) {
				return next(new ErrorHandler(err.message, 400));
			}

			if (data.affectedRows > 0) {
				return res.json({
					success: true,
					message: "Profile updated successfully",
				});
			}

			return next(
				new ErrorHandler(
					"User not found or unauthorized to update this profile",
					404,
				),
			);
		});
	} catch (error) {
		console.log(error);
		return next(new ErrorHandler("Internal Server Error", 500));
	}
}
