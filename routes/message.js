const express = require('express');
const router = express.Router();

const { isAuthenticatedUser } = require('../middlewares/auth');
const { 
    sendMessage, 
    getConversation, 
    getChatPartners 
} = require('../controller/messageController');


router.route('/send-message').post(isAuthenticatedUser, sendMessage);
router.route('/get-message').get(isAuthenticatedUser, getConversation);
router.route('/chat-partners/:userId').get(isAuthenticatedUser, getChatPartners);

module.exports = router;
