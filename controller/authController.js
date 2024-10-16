const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const { db } = require("../config/database");
const bcrypt = require("bcryptjs");
const sendToken = require('../utils/jwtTokens');
const uploadFile = require("../utils/uploadFile");

require('dotenv').config();


//REGISTER USER
exports.register = catchAsyncErrors(async (req, res, next) => {
    let avatar = null;
    
    // Check if all required fields are provided
    if (
        !req.body ||
        !req.body.username ||
        !req.body.email ||
        !req.body.password ||
        !req.body.name
    ) {
        return next(new ErrorHandler("Please provide all required fields", 400));
    }

    // Attempt to upload the avatar if file is provided
    try {
        if (req.file) {
            avatar = await uploadFile(req.file.buffer, "socialApp/profileImg");
        }
    } catch (error) {
        console.log(error);
        return next(new ErrorHandler("Error in uploading avatar", 400));
    }

    // Check if user already exists
    const checkUserQuery = "SELECT * FROM users WHERE username = ? OR email = ?";

    db.query(checkUserQuery, [req.body.username, req.body.email], async (err, data) => {
        if (err) {
            return next(new ErrorHandler(err.message, 500));
        }

        if (data.length) {
            return next(new ErrorHandler("Username or email already exists", 409));
        }

        // If user does not exist, proceed with user creation
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = bcrypt.hashSync(req.body.password, salt);

        const insertUserQuery =
            "INSERT INTO social.users (`username`, `email`, `password`, `name`, `profilePic`) VALUES (?)";
        
        // Use avatar URL or set a default value if no avatar uploaded
        const avatarUrl = avatar ? avatar.secure_url : "default/avatar/url"; 

        const values = [
            req.body.username,
            req.body.email,
            hashedPassword,
            req.body.name,
            avatarUrl
        ];

        db.query(insertUserQuery, [values], (err, data) => {
            if (err) {
                return next(new ErrorHandler("Error registering user", 500));
            }

            return res.status(200).json({
                success: true,
                message: "User has been created",
                data: {
                    username: req.body.username,
                    email: req.body.email,
                    name: req.body.name,
                    profilePic: avatarUrl
                }
            });
        });
    });
});



exports.login = catchAsyncErrors(async (req, res, next) => {
	const checkUserQuery = "SELECT * FROM social.users WHERE username = ?";

	db.query(checkUserQuery, [req.body.username], (err, data) => {
		if (err) {
			return next(new ErrorHandler(err.message, 500));
		}

		if (data.length === 0) {
			return next(new ErrorHandler("Username not found", 404));
		}

		// Check password
		const isPasswordCorrect = bcrypt.compareSync(
			req.body.password,
			data[0].password,
		);

		if (!isPasswordCorrect) {
			return next(new ErrorHandler("Incorrect username or password", 400));
		}

		// Remove password from the response
		const { password, ...profileData } = data[0];

		sendToken(profileData, 200, res)
	});
});


exports.logout = catchAsyncErrors(async (req, res, next) => {
	res
		.clearCookie("accessToken", {
			secure: process.env.NODE_ENV === "production",
			sameSite: "none",
		})
		.status(200)
		.json({
			success: true,
			message: "User has been logged out",
		});
});