const express = require('express')
const router = express.Router()

const { getUsersPosts, addPost, getAllPosts, deletePost } = require('../controller/postsController')
const { isAuthenticatedUser } = require('../middlewares/auth')
const upload = require("../middlewares/upload")

router.route('/add-post').post(upload.single('img'), isAuthenticatedUser, addPost)
router.route('/posts').get(isAuthenticatedUser, getUsersPosts)
router.route('/all-posts').get(isAuthenticatedUser, getAllPosts)
router.route('/delete-post/:postId').delete(isAuthenticatedUser, deletePost)

module.exports = router;