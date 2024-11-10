const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const { db } = require("../config/database");
const moment = require("moment");

exports.sendMessage = catchAsyncErrors(async (req, res, next) => {
    const { userId, receiverId, content } = req.body;

    const query = `
        INSERT INTO message (senderId, receiverId, content, createdAt) VALUES (?,?,?,?)
    `;

    if (userId === receiverId) {
        return next(new ErrorHandler("You can't message yourself", 500));
    }

    const values = [
        userId,
        receiverId,
        content,
        moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
    ];

    db.query(query, values, (err, data) => {
        if (err) return next(new ErrorHandler(err, 400));

        // Fetch sender's username and profile picture after message is sent
        const senderQuery = `SELECT id, username, profilePic FROM users WHERE id = ?`;
        db.query(senderQuery, [userId], (err, senderData) => {
            if (err) return next(new ErrorHandler(err, 400));

            // Fetch receiver's username and profile picture
            const receiverQuery = `SELECT id, username, profilePic FROM users WHERE id = ?`;
            db.query(receiverQuery, [receiverId], (err, receiverData) => {
                if (err) return next(new ErrorHandler(err, 400));

                res.status(201).json({
                    success: true,
                    message: "Message sent",
                    data,
                    sender: senderData[0], 
                    receiver: receiverData[0],  
                });
            });
        });
    });
});


exports.getConversation = catchAsyncErrors(async (req, res, next) => {
    const { userId1, userId2 } = req.query;

    const checkUsersQuery = `SELECT * FROM users WHERE id IN (?, ?)`;

    db.query(checkUsersQuery, [userId1, userId2], (err, data) => {
        if (err) return next(new ErrorHandler(err, 400));

        if (data.length < 2) {
            return next(
                new ErrorHandler("One or both users not found or accounts may have been deleted", 404)
            );
        }

        const query = `
            SELECT message.*, users.Username, users.profilePic 
            FROM message
            INNER JOIN users ON users.id = message.senderId
            WHERE 
                (message.senderId = ? AND message.receiverId = ?)
                OR 
                (message.senderId = ? AND message.receiverId = ?)
            ORDER BY message.createdAt ASC
        `;

        const values = [userId1, userId2, userId2, userId1];

        db.query(query, values, (err, data) => {
            if (err) return next(new ErrorHandler(err, 400));
            res.status(200).json({
                success: true,
                message: "Conversation fetched successfully",
                data,
            });
        });
    });
});


exports.getChatPartners = catchAsyncErrors(async (req, res, next) => {
    const userId = req.params.userId; 

    // Updated SQL query to fetch the last message sent between both users
    const query = `
        SELECT DISTINCT
            CASE
                WHEN senderId = ? THEN receiverId
                ELSE senderId
            END AS chatPartnerId,
            users.name,
            users.profilePic,
            lastMessage.content AS lastMessage,
            lastMessage.createdAt AS lastMessageCreatedAt
        FROM
            message
        JOIN
            users ON users.id = CASE
                WHEN senderId = ? THEN receiverId
                ELSE senderId
            END
        LEFT JOIN
            (SELECT 
                CASE
                    WHEN senderId = ? THEN receiverId
                    ELSE senderId
                END AS chatPartnerId,
                content,  -- Use content instead of message
                createdAt
            FROM
                message
            WHERE
                senderId = ? OR receiverId = ?
            ORDER BY
                createdAt DESC
            LIMIT 1) AS lastMessage ON lastMessage.chatPartnerId = CASE
                WHEN senderId = ? THEN receiverId
                ELSE senderId
            END
        WHERE
            senderId = ? OR receiverId = ?
    `;

    const values = [userId, userId, userId, userId, userId, userId, userId, userId];

    db.query(query, values, (err, data) => {
        if (err) return next(new ErrorHandler(err, 400));
        res.status(200).json({ success: true, data });
    });
});
