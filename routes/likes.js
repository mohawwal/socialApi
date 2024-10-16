const express = require('express')
const router = express.Router()

const { isAuthenticatedUser } = require('../middlewares/auth')
const { getLikes, addLike, deleteLike } = require('../controller/likesController')

router.route('/get-likes/:postId').get( getLikes)
router.route('/add-like').post(isAuthenticatedUser, addLike)
router.route('/delete-like').delete(isAuthenticatedUser, deleteLike)

module.exports = router;