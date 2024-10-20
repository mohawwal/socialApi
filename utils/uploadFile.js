const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");

const uploadFile = (fileBuffer, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                quality: "auto", 
                format: "webp",  
                //allowedFormats: ['png', 'jpg', 'jpeg', 'avif'],
                transformation: [
                    { width: 800, crop: "scale" }
                ]
            },
            (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );
        const readableStream = new Readable();
        readableStream.push(fileBuffer);
        readableStream.push(null);
        readableStream.pipe(stream);
    });
};


module.exports = uploadFile;
