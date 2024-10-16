const app = require("./app");
const dotenv = require("dotenv");
const cloudinary = require('cloudinary').v2

//Handle Uncaught Exception
process.on("uncaughtException", (err) => {
	console.log(`ERROR: ${err.message}`);
	console.log("Shutting Down Due To Uncaught Exception");
	process.exit(1);
});

//Setting up config file
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})


const server = app.listen(process.env.PORT, () => {
	console.log(
		`server running in PORT ${process.env.PORT} in ${process.env.NODE_ENV}`,
	);
});

//Handle Unhandled Promise Rejections
process.on("unhandledRejection", (err) => {
	console.log(`Error: ${err.message}`);
	console.log("Shutting Down The Server Due To Unhandled Promise Rejection");
	server.close(() => {
		process.exit(1);
	});
});
