// router.js
const express = require('express');
const router = express.Router();

const { allUsers, findUserById, updateProfile } = require('../controller/usersController');
const { isAuthenticatedUser } = require('../middlewares/auth');
const upload = require("../middlewares/upload");

router.route('/users').get(isAuthenticatedUser, allUsers);
router.route('/user/:userId').get(isAuthenticatedUser, findUserById);
router.route('/update-User-Profile').put(
    upload.fields([
        { name: 'profilePic', maxCount: 1 },
        { name: 'coverPic', maxCount: 1 }
    ]),
    isAuthenticatedUser,
    updateProfile
);

module.exports = router;