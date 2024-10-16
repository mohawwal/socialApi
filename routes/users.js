const express = require('express')
const router = express.Router()

const {allUsers, findUserById} = require('../controller/usersController')
const { isAuthenticatedUser } = require('../middlewares/auth')

router.route('/users').get(isAuthenticatedUser, allUsers)
router.route('/user/:userId').get(isAuthenticatedUser, findUserById)


module.exports = router;