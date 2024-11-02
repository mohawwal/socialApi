const express = require('express')
const router = express.Router()

const { getFollowers, addFollower, unFollowUser, getNonFollowers, getFollowersData, getFollowingData } = require('../controller/relationshipsController')
const { isAuthenticatedUser } = require('../middlewares/auth')

router.route('/follow-user').post(isAuthenticatedUser, addFollower)
router.route('/get-followers/:followedUserId').get(isAuthenticatedUser, getFollowers)
router.route('/unFollow-user').delete(isAuthenticatedUser, unFollowUser)
router.route('/non-followers/:followedUserId').get(isAuthenticatedUser, getNonFollowers)
router.get('/get-Followers-Data/:followedUserId', getFollowersData);
router.get('/get-Followed-Data/:followerUserId', getFollowingData);

module.exports = router;