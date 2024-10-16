const express = require('express')
const router = express.Router()

const { getComments, postComment } = require('../controller/commentsController')
const { isAuthenticatedUser } = require('../middlewares/auth')

router.route('/get-comments').get(isAuthenticatedUser, getComments)
router.route('/add-comments').post(isAuthenticatedUser, postComment)

module.exports = router;