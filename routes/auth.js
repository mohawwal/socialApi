const express = require('express')
const router = express.Router()

const {register, login, logout} = require('../controller/authController')
const upload = require("../middlewares/upload")

router.route('/auth/register').post(upload.single('avatar'), register)
router.route('/auth/login').post(login)
router.route('/auth/logout').post(logout)

module.exports = router;