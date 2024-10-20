// app.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')

const app = express();

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Credentials", true)
    next()
})

// Allow both localhost domain
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())

// Import and use routes
const AuthRouter = require('./routes/auth')
app.use('/api', AuthRouter)

const userRouter = require('./routes/users');
app.use('/api', userRouter);

const postRouter = require('./routes/posts');
app.use('/api', postRouter);

const commentRouter = require('./routes/comments');
app.use('/api', commentRouter);

const likeRouter = require('./routes/likes');
app.use('/api', likeRouter);

const relationshipRouter = require('./routes/relationships');
app.use('/api', relationshipRouter);



// Error handling middleware (optional)
const errorMiddleware = require('./middlewares/errors');
app.use(errorMiddleware);

module.exports = app;