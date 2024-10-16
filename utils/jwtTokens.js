const jwt = require("jsonwebtoken")

const sendToken = (user, statusCode, res) => {
    const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET
    );
 
    const expiresInDays = parseInt(process.env.EXPIRES_TIME, 10) || 7
    const expiresDate = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)

    const options = {
        expires: expiresDate,
        httpOnly: true,
        secure: process.env.NODE_ENV==='PRODUCTION',
    }
    res.status(statusCode).cookie('accessToken', token, options).json({
        success: true,
        token,
        user
    })
}

module.exports = sendToken;