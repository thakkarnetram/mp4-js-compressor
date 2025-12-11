# 🎬 MP4 JS Compressor

A robust, full-stack **MERN** (MongoDB, Express, React, Node.js) application for compressing video and image files. It features a tiered user system, strict quota management, and a resilient background processing engine designed to handle large file uploads without server timeouts.

https://tinycompression.netlify.app/

## 🚀 Features

* **Video Compression**: Efficiently reduces MP4 file size using FFmpeg with CRF (Constant Rate Factor) control.
* **Image Compression**: Optimizes JPEG and PNG images using the Sharp library.
* **User Tiers**:
    * **Anonymous**: 25MB Daily Quota (Tracked via Cookie/IP).
    * **Free**: 100MB Daily Quota.
    * **Pro**: 250MB Daily Quota + Batch Uploads & ZIP Export.

## 🛠️ Tech Stack

* **Frontend**: React, Tailwind CSS, Framer Motion, Axios.
* **Backend**: Node.js, Express.
* **Database**: MongoDB (Mongoose).
* **Core Libraries**: `fluent-ffmpeg`, `@ffmpeg-installer/ffmpeg`, `sharp`, `multer`.

