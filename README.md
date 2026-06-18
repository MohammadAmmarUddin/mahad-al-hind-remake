# Ma'hadul Qiraat Al Hind — Full Stack Web Platform

Official digital platform for **Ma'hadul Qiraat Al Hind**, a Quranic education institute.
Built with a modern full-stack architecture using React, Node.js, and Dockerized infrastructure.

**Live:** [https://mahad-al-hind.netlify.app](https://mahad-al-hind.netlify.app)

---

## Overview

This project represents the official web presence of the institute — designed to showcase:

- Quranic courses & programs
- Admission information
- Scholars & instructors
- Institutional activities

The project follows a **monorepo architecture**:

- `client/` → React frontend (SPA)
- `server/` → REST API (Node.js + Express)

---

## Tech Stack

| Layer      | Technology             |
| ---------- | ---------------------- |
| Frontend   | React.js               |
| Backend    | Node.js, Express.js    |
| Database   | MongoDB (Mongoose)     |
| DevOps     | Docker, Docker Compose |
| CI/CD      | GitHub Actions         |
| Deployment | Netlify (Frontend)     |

---

## Project Structure

```
mahad-al-hind/
├── client/                # React frontend
├── server/                # Express backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── index.js
├── .github/workflows/     # CI/CD pipelines
├── docker-compose.dev.yml
├── docker-compose.prod.yml
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- Docker & Docker Compose
- Git

---

### Run with Docker (Recommended)

```bash
git clone https://github.com/MohammadAmmarUddin/mahad-al-hind-remake.git
cd mahad-al-hind-remake

docker compose -f docker-compose.dev.yml up --build
```

### For Testing
Admin - Admin

### Run Without Docker

#### Backend

```bash
cd server
npm install
npm run dev
```

#### Frontend

```bash
cd client
npm install
npm run dev
```

---

## Environment Variables

### Server (`server/.env`)

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret
NODE_ENV=development
```

### Client (`client/.env.local`)

```
VITE_MAHAD_baseUrl=https://your-backend.example.com
VITE_IMAGE_HOSTING_KEY=your-client-image-key-if-needed
```

---

## Docker Setup

### Development

```bash
docker compose -f docker-compose.dev.yml up --build
```

### Production

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

---

## CI/CD

Automated using **GitHub Actions**. Includes code linting, build checks, and auto deployment.

---

## Scripts

### Server

```bash
npm run dev     # Development (nodemon)
npm start       # Production
```

### Client

```bash
npm run dev     # Dev server
npm run build   # Production build
```

---

# API Reference

Base URL: `https://mahad-al-hind.vercel.app` (production) or `http://localhost:4000` (local dev)

All endpoints return JSON. Use `Content-Type: application/json` for POST/PATCH/PUT body requests, unless multipart is specified.

---

## Authentication

Most public endpoints require no auth. Some admin endpoints require a JWT.

### Get a JWT Token

```http
POST /api/user/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "Admin"
}
```

Response:

```json
{
  "user": { "_id": "...", "firstname": "Admin", "role": "admin" },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Using the Token

Add to request headers:

```
Authorization: Bearer <token>
```

Or as a custom header: `x-access-token: <token>`

Token expires in 3 days.

---

## Users

### Signup

```http
POST /api/user/signup
Content-Type: application/json

{
  "firstname": "John",
  "lastname": "Doe",
  "email": "john@example.com",
  "phone": "+8801234567890",
  "role": "student",
  "password": "securepass123"
}
```

Response: `{ user, token }`

### Login

```http
POST /api/user/login
Content-Type: application/json

{ "email": "john@example.com", "password": "securepass123" }
```

Response: `{ user, token }`

### Google Login

```http
POST /api/user/googleLogin
Content-Type: application/json

{
  "firstname": "John",
  "lastname": "Doe",
  "email": "john@gmail.com",
  "img": "https://...google-avatar-url"
}
```

Response: `{ user: {...user, isNewUser: bool}, token }`

### Forgot Password

```http
POST /api/user/forgetPassword
Content-Type: application/json

{ "email": "john@example.com" }
```

Sends password reset email. Response: `{ status: true, message }`

### Reset Password

```http
POST /api/user/resetPassword/<token>
Content-Type: application/json

{ "password": "newpassword123" }
```

Response: `{ status: true, message: "successfully reset!" }`

### Get All Users

```http
GET /api/user/allUsers
```

Response: `[ user, user, ... ]`

### Get Users Count

```http
GET /api/user/allUsersCount
```

Response: `{ usersCount: 42 }`

### Get Single User

```http
GET /api/user/singleUser/<userId>
```

Response: `{ user }`

### Update User

```http
PATCH /api/user/updateUser/<userId>
Content-Type: application/json

{ "firstname": "NewName", "phone": "+8801234567890" }
```

Response: Updated user doc. If `img` field changes, old Cloudinary image is auto-destroyed.

### Delete User

```http
DELETE /api/user/deleteUser/<userId>
```

Response: Deleted user doc.

### Delete My Account

```http
DELETE /api/user/deleteMyAccount
Content-Type: application/json

{ "password": "securepass123", "id": "<userId>" }
```

Response: `{ message: "User account deleted successfully." }`

### Change Password

```http
PATCH /api/user/changePassword
Content-Type: application/json

{ "oldPassword": "oldpass", "newPassword": "newpass", "retypePassword": "newpass", "id": "<userId>" }
```

Response: `{ message: "Password updated successfully." }`

### Make Admin

```http
PATCH /api/user/makeAdmin/<userId>
```

Response: User doc with role changed to "admin".

### Undo Admin

```http
PATCH /api/user/undoAdmin/<userId>
```

Response: User doc reverted to previous role.

### Change Role

```http
PATCH /api/user/changeRole/<userId>
Content-Type: application/json

{ "role": "instructor" }
```

Roles: `student`, `admin`, `instructor`.

### Language Preference

```http
PATCH /api/user/languagePreference/<userId>
Content-Type: application/json

{ "preferredLanguage": "bn" }
```

Languages: `en` (English), `bn` (Bengali).

---

## Courses

### Create Course

```http
POST /api/course/createCourse
Content-Type: application/json

{
  "userId": "<instructorId>",
  "title": "Quran Tajweed Course",
  "magnetLine": "Master Quranic recitation in 30 days",
  "details": "Full course description in HTML...",
  "requirements": "Basic Arabic reading ability",
  "instructorsId": ["<instructorId>"],
  "whatsappGroupLink": "https://chat.whatsapp.com/...",
  "banner": "https://res.cloudinary.com/.../banner.jpg",
  "bannerPublicId": "courses/banner_abc123",
  "category": "Tajweed",
  "subCategory": "Beginner",
  "syllabus": "https://res.cloudinary.com/.../syllabus.pdf",
  "syllabusPublicId": "courses/syllabus_abc123",
  "keywords": ["tajweed", "quran", "recitation"],
  "price": "2500",
  "discount": "500",
  "videos": [
    {
      "videoTitle": "Introduction",
      "videoLink": "https://www.youtube.com/embed/xxx",
      "publicId": "videos/vid1",
      "resourceType": "video"
    }
  ],
  "quiz": [
    {
      "question": "What is the first rule?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": 0
    }
  ]
}
```

Response: `201` — new course document.

### Get All Courses

```http
GET /api/course/getAllCourses
```

Response: `[ course, course, ... ]`

### Get Course Count

```http
GET /api/course/getCourseCount
```

Response: `{ courseCount: 12 }`

### Get Single Course

```http
GET /api/course/getSingleCourse/<courseId>
```

Response: Full course document with students, opinions, videos, quiz.

### Get Enrolled Courses for User

```http
GET /api/course/getAllEnrolledCourse/<userId>
```

Response: `{ message, courses: [{ title, category, subCategory, banner, students, videos }] }`

### Get Related Courses

```http
GET /api/course/getReletedCourse?id=<courseId>
```

Response: Courses sharing keywords, excluding the given course.

### Top Courses

```http
GET /api/course/topCourses
```

Response: `{ success, data: [ top 6 courses by average rating ] }`

### Enrolled Users Count

```http
GET /api/course/enrolledUsersCourses
```

Response: `{ totalEnrolledStudents: 156 }`

### Get Total Revenue

```http
GET /api/course/getTotalRevenue
```

Response: `{ message, totalRevenue: 125000 }`

### Get Course Categories

```http
GET /api/course/getCourseCategories
```

Response: `{ categories: [{ name: "Tajweed", count: 5 }, ...] }`

### Get Average Rating

```http
GET /api/course/getAvgRating
```

Response: `{ avgRating: 4.5 }`

### Get Completed Courses Count

```http
GET /api/course/getCompletedCoursesCount
```

Response: `{ totalCompletedCourses: 42 }`

### Get Average Completion Time

```http
GET /api/course/getAverageCompletionTime
```

Response: `{ message, averageCompletionTimeInDays: 45 }`

### Get Videos Count for Student

```http
GET /api/course/getVideosCount/<studentId>
```

Response: `{ totalVideos: 24 }`

### Get User Course Progress

```http
GET /api/course/getUserCourseProgress/<studentId>
```

Response: `[{ courseId, title, unlockedVideo }, ...]`

### Get Total Spent by Student

```http
GET /api/course/getSpentByStudent/<studentId>
```

Response: `{ message, studentId, totalPayment: 5000 }`

### Update Course

```http
PATCH /api/course/updateCourse/<courseId>
Content-Type: application/json

{ "title": "Updated Title", "price": "3000" }
```

Response: Updated course doc. Replaced Cloudinary assets (banner, syllabus, videos) are auto-cleaned.

### Delete Course

```http
DELETE /api/course/deleteCourse/<courseId>
```

Response: Deleted course doc. All Cloudinary assets are destroyed.

### Give Rating

```http
POST /api/course/giveRating/<courseId>
Content-Type: application/json

{ "reviewerId": "<userId>", "rating": 5, "comments": "Excellent course!" }
```

Response: `{ message, course }`. One review per user.

### Unlock Next Video

```http
PATCH /api/course/unlockVideo/<studentId>
Content-Type: application/json

{ "_id": "<courseId>" }
```

Response: `{ message, updatedCourse }`. Increments `unlockedVideo` by 1.

### Complete Course

```http
PATCH /api/course/completeCourse/<studentId>
Content-Type: application/json

{ "_id": "<courseId>" }
```

Response: `{ message, certificateId, certificate }`. Generates certificate (format: `CERT-MAHAD-{year}-{seq}`).

### Complete Quiz

```http
PATCH /api/course/completeQuiz/<studentId>
Content-Type: application/json

{ "_id": "<courseId>", "quizMarks": 8, "quizMarksPercentage": 80 }
```

Response: `{ message, updatedCourse }`.

---

## Enrollment & Payments

### Initiate Payment (SSLCommerz)

```http
POST /api/course/payment/order
Content-Type: application/json

{ "courseId": "<courseId>", "studentsId": "<userId>", "price": "2000" }
```

Response: `{ url: "https://sandbox.sslcommerz.com/gwprocess/..." }`

Redirect user to this URL for SSLCommerz payment.

### Manual Enrollment (bKash / Nagad / etc.)

```http
POST /api/course/manual-enroll
Content-Type: application/json

{
  "courseId": "<courseId>",
  "studentsId": "<userId>",
  "payment": "2000",
  "paymentMethod": "bKash",
  "paymentNumber": "01XXXXXXXXX",
  "transactionId": "TX123456",
  "notes": "Paid via bKash"
}
```

Response: `{ message, transaction }`. Creates a pending enrollment. Admin must approve it.

### Get All Transactions

```http
GET /api/course/getAllTransactions
```

Response: `[ PaymentSession, ... ]`

### Get Total Payment (All Time)

```http
GET /api/course/getTotalPayment
```

Response: `{ message, totalPayment: 250000 }`

### Pending Enrollments (Admin — requires auth)

```http
GET /api/course/pending-enrollments
Authorization: Bearer <admin-token>
```

Response: `[ enrollment populated with courseId(title,price) and studentsId(firstname,lastname,email,phone), ... ]`

### All Enrollments (Admin — requires auth)

```http
GET /api/course/all-enrollments
Authorization: Bearer <admin-token>
```

Response: `[ all PaymentSession populated, ... ]`

### Approve Enrollment (Admin — requires auth)

```http
PATCH /api/course/approve-enrollment/<tranId>
Authorization: Bearer <admin-token>
```

Response: `{ message, transaction }`. Sends notification to student.

### Reject Enrollment (Admin — requires auth)

```http
PATCH /api/course/reject-enrollment/<tranId>
Authorization: Bearer <admin-token>
```

Response: `{ message, transaction }`. Removes student from course.

---

## Reviews

### Create Review

```http
POST /api/review/create
Content-Type: application/json

{ "name": "John Doe", "rating": 5, "comment": "Great institute!" }
```

Optional: `image` (URL string). Response: `{ message, review }`.

### Get All Reviews

```http
GET /api/review
```

Response: `[ review, ... ]` sorted by newest first.

---

## Videos

### Get All Videos

```http
GET /api/videos
```

Response: `[ { _id, title, tag, desc, embedUrl, createdAt }, ... ]`

### Create Video

```http
POST /api/videos
Content-Type: application/json

{ "title": "Lesson 1", "tag": "tajweed", "desc": "Introduction to Tajweed", "embedUrl": "https://www.youtube.com/embed/xxx" }
```

Response: `201` — new video document.

### Delete Video

```http
DELETE /api/videos/<videoId>
```

Response: `{ message: "Video deleted successfully" }`

---

## Media (Cloudinary Assets)

### Get Public Media

```http
GET /api/media/public
```

Response: `[ { url, public_id, type, title, description, isPublic }, ... ]` — only items with `isPublic: true`.

### Get All Media (Admin — requires auth)

```http
GET /api/media/admin
Authorization: Bearer <admin-token>
```

Response: All media items including unpublished.

### Upload Media (Admin — requires auth)

```http
POST /api/media/upload
Authorization: Bearer <admin-token>
Content-Type: multipart/form-data

file: <binary>
folder: "mahad-al-hind/images"
title: "Course Banner"
description: "Banner for Tajweed course"
isPublic: true
resourceType: "image"
```

Supports: images, videos (mp4/webm), PDFs. Max size: 300MB.

Response: Normalized media object with Cloudinary URL, publicId, dimensions, etc.

### Update Media (Admin — requires auth)

```http
PUT /api/media/<mediaId>
Authorization: Bearer <admin-token>
Content-Type: application/json

{ "title": "Updated Title", "isPublic": false }
```

### Delete Media (Admin — requires auth)

```http
DELETE /api/media/<mediaId>
Authorization: Bearer <admin-token>
```

Response: `{ message: "Media deleted successfully" }`. Cloudinary asset also destroyed.

---

## Gallery

### Get Gallery Items (Unified)

```http
GET /api/gallery?galleryType=student&page=1&limit=20
```

Query params: `galleryType` (student|faregin|general), `search`, `page`, `limit`, `admin` (bool).

Response: `{ success, data: [ items ], pagination: { page, limit, total, pages } }`

### Get Single Gallery Item

```http
GET /api/gallery/<itemId>
```

Response: `{ success, data: item }`

### Upload Gallery Image (Admin — requires auth)

```http
POST /api/gallery/upload
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "galleryType": "student",
  "imageUrl": "https://res.cloudinary.com/.../photo.jpg",
  "publicId": "gallery/photo_abc",
  "title": "Student Name",
  "sortOrder": 1,
  "isVisible": true
}
```

### Update Gallery Item (Admin — requires auth)

```http
PUT /api/gallery/<itemId>
Authorization: Bearer <admin-token>
Content-Type: application/json

{ "title": "Updated Name", "isVisible": false }
```

### Delete Gallery Item (Admin — requires auth)

```http
DELETE /api/gallery/<itemId>
Authorization: Bearer <admin-token>
```

### Get Upload Signature (Admin — requires auth)

```http
POST /api/gallery/upload-signature
Authorization: Bearer <admin-token>
```

Response: `{ success, signature, timestamp, apiKey, cloudName, folder }` — for direct browser-to-Cloudinary upload.

### Legacy Gallery Endpoint

```http
GET /api/galleries/<galleryType>
```

Same as unified but gallery type is a path param instead of query param.

---

## Orders (General)

### Create Order

```http
POST /api/orders
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "country": "Bangladesh",
  "streetAddress": "123 Main St",
  "city": "Dhaka",
  "district": "Dhaka",
  "postcode": "1205",
  "phone": "+8801234567890",
  "notes": "Leave at gate",
  "paymentMethod": "bKash",
  "paymentNumber": "01XXXXXXXXX",
  "transactionId": "TX123456"
}
```

Payment methods: `bKash`, `Nagad`, `GooglePay`, `PhonePe`.

Response: `{ message, order }`

### Get All Orders

```http
GET /api/orders
```

Response: `[ order, ... ]` sorted by newest first.

---

## Certificates

### Create Certificate

```http
POST /api/certificate/createCertificate
Content-Type: application/json

{
  "certificateId": "CERT-MAHAD-2025-001",
  "studentName": "John Doe",
  "courseName": "Quran Tajweed Course",
  "issueDate": "2025-01-15"
}
```

If certificateId already exists: `{ exists: true, certificate }`
If new: `{ exists: false, message, certificate }`

### Check Certificate

```http
GET /api/certificate/check/<certificateId>
```

Response: `{ valid: true, certificate }` or `{ valid: false, message }`

### Get All Certificates

```http
GET /api/certificate
```

### Get Certificate by Mongo ID

```http
GET /api/certificate/<mongoId>
```

### Delete Certificate

```http
DELETE /api/certificate/<mongoId>
```

Response: `{ message: "Certificate deleted successfully" }`

---

## Site Settings

### Get Home Page Settings

```http
GET /api/site-settings/home-page
```

Response: `{ success, data: { key: "home-page", homeSections: { hero, breakingNews, statsBanner, videos, studentGallery, pagriGallery } } }`

Each section is a boolean controlling visibility.

### Update Home Page Settings

```http
PATCH /api/site-settings/home-page
Content-Type: application/json

{
  "homeSections": {
    "hero": true,
    "breakingNews": false,
    "statsBanner": true,
    "videos": true,
    "studentGallery": true,
    "pagriGallery": true
  }
}
```

---

## Site Content (Localized Text)

### Get Public Site Content

```http
GET /api/site-content/public
```

Response: `{ success, data: { navbar: {...}, home: {...}, breakingNews: {...}, videoSection: {...}, gallerySection: {...}, enrollmentWidget: {...} } }`

All text fields are localized: `{ en: "English Text", bn: "বাংলা টেক্সট" }`

### Update Public Site Content

```http
PATCH /api/site-content/public
Content-Type: application/json

{
  "home": {
    "heroTitle": { "en": "Learn Quran", "bn": "কুরআন শিখুন" }
  }
}
```

---

## Notifications (Requires Auth)

All notification endpoints require `Authorization: Bearer <token>`.

### Get Notifications

```http
GET /api/notifications
Authorization: Bearer <token>
```

Response: Latest 50 notifications filtered by user role.

### Get Unread Count

```http
GET /api/notifications/unread-count
Authorization: Bearer <token>
```

Response: `{ count: 5 }`

### Mark as Read

```http
PATCH /api/notifications/read/<notificationId>
Authorization: Bearer <token>
```

Response: `{ message: "Marked as read" }`

### Mark All as Read

```http
PATCH /api/notifications/read-all
Authorization: Bearer <token>
```

Response: `{ message: "All marked as read" }`

---

## WhatsApp

### Send Template Message

```http
GET /api/whatsapp/sendTemplateMessage
```

Sends a "hello_world" WhatsApp template to the configured number. Response: `{ status, respondData }`

---

## Google Meet

### Create Meet

```http
POST /api/meet/createMeet
Content-Type: application/json

{
  "summary": "Tajweed Class - Week 1",
  "startTime": "2025-01-20T10:00:00Z",
  "endTime": "2025-01-20T11:00:00Z"
}
```

Response: `{ meetLink: "https://meet.google.com/..." }`

### Send Schedule Emails

```http
POST /api/meet/sendSchedule
Content-Type: application/json

{
  "usersData": [{ "email": "student@example.com" }],
  "meetLink": "https://meet.google.com/...",
  "courseTitle": "Tajweed Course"
}
```

Sends email notifications via Nodemailer. Response: "Emails sent successfully to all users"

---

## API Error Response Formats

**Validation error:**
```json
{ "error": "User already exists" }
```

**Auth error:**
```json
{ "success": false, "message": "Authentication required" }
```

**Not found:**
```json
{ "message": "Course not found" }
```

---

## Data Models (for mobile app development)

| Model | Key Fields |
|-------|-----------|
| User | `_id`, `firstname`, `lastname`, `email`, `phone`, `role`, `img`, `preferredLanguage` |
| Course | `_id`, `title`, `magnetLine`, `details`, `price`, `discount`, `category`, `subCategory`, `banner`, `instructorsId[]`, `videos[]`, `quiz[]`, `students[]`, `keywords[]` |
| Student enrollment | Inside course: `{ studentsId, paymentComplete, unlockedVideo, isCourseComplete, certificateUrl, quizMarks }` |
| Notification | `_id`, `userId`, `role`, `type`, `message`, `link`, `read`, `relatedId` |
| PaymentSession | `tranId`, `courseId`, `studentsId`, `payment`, `paymentComplete`, `status` (pending/approved/rejected/completed) |
| Certificate | `certificateId`, `studentName`, `courseName`, `issueDate`, `valid` |
| Review | `name`, `image`, `rating` (1-5), `comment` |

---

# Building an Android APK (Mobile App)

This guide explains how to convert the web app into a native Android APK using **Capacitor** (by Ionic). Capacitor wraps your built web app inside a native WebView, allowing you to publish it as a real mobile app on Google Play.

---

## Prerequisites for APK Build

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | v18+ | Build web app |
| Android Studio | Latest | Android SDK, emulator, signing |
| Java JDK | 17+ | Android compilation |
| Gradle | (bundled) | Android build system |

### Install Android Studio & SDK

1. Download & install [Android Studio](https://developer.android.com/studio)
2. Open Android Studio → **SDK Manager** → Install:
   - **Android SDK** (API 34 or latest)
   - **Android SDK Platform-Tools**
   - **Android SDK Build-Tools**
3. Set environment variables:

**Windows:**
```powershell
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
```
Add to PATH: `%ANDROID_HOME%\platform-tools` and `%ANDROID_HOME%\tools`

**Linux / macOS:**
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$JAVA_HOME/bin
```

---

## Step 1: Build the Web App

```bash
cd client
npm install
npm run build
```

This produces a production build in `client/dist/`.

---

## Step 2: Install Capacitor

```bash
# From the project root
npm init -y   # if no package.json at root
npm install @capacitor/core @capacitor/cli @capacitor/android
```

---

## Step 3: Initialize Capacitor

Create a `capacitor.config.json` file in the project root:

```json
{
  "appId": "com.mahad.alhind",
  "appName": "Ma'hadul Qira'at Al Hind",
  "webDir": "client/dist",
  "bundledWebRuntime": false,
  "server": {
    "androidScheme": "https",
    "cleartext": true
  },
  "android": {
    "allowMixedContent": true,
    "captureInput": true,
    "webContentsDebuggingEnabled": false
  }
}
```

> **Note:** `cleartext: true` and `allowMixedContent: true` are required if your backend API uses HTTP. For production, your backend should use HTTPS.

Then init Capacitor:

```bash
npx cap init Ma'hadul Qira'at Al Hind com.mahad.alhind
npx cap add android
```

---

## Step 4: Copy Web Build to Android Project

After every web build:

```bash
npx cap copy android
```

To open the Android project in Android Studio:

```bash
npx cap open android
```

---

## Step 5: Customize the Android App

### Change App Name & Icon

**App name:** Edit `client/android/app/src/main/res/values/strings.xml` (auto-generated by Capacitor).

**App icon:** Replace these files with your own images:

| Resolution | Path (res/mipmap-*) | Size |
|------------|---------------------|------|
| mdpi | `mipmap-mdpi/ic_launcher.png` | 48×48 |
| hdpi | `mipmap-hdpi/ic_launcher.png` | 72×72 |
| xhdpi | `mipmap-xhdpi/ic_launcher.png` | 96×96 |
| xxhdpi | `mipmap-xxhdpi/ic_launcher.png` | 144×144 |
| xxxhdpi | `mipmap-xxxhdpi/ic_launcher.png` | 192×192 |

Use a tool like [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html) or [App Icon Generator](https://appicon.co/) to generate all sizes from a single image.

### Splash Screen (Optional)

Install the Capacitor Splash Screen plugin:

```bash
npm install @capacitor/splash-screen
npx cap sync
```

Add to `capacitor.config.json`:

```json
{
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 2000,
      "backgroundColor": "#047857",
      "androidSplashResourceName": "splash",
      "androidScaleType": "CENTER_CROP",
      "splashFullScreen": true,
      "splashImmersive": true
    }
  }
}
```

Place a `splash.png` (at least 2732×2732px, center-cropped) in `client/android/app/src/main/res/values/drawables/` or use Android Studio's built-in splash generator.

---

## Step 6: Generate an Unsigned APK (Debug)

For testing on a device or emulator:

```bash
cd client/android
./gradlew assembleDebug
```

The APK will be at:
`client/android/app/build/outputs/apk/debug/app-debug.apk`

Install it on a device:
```bash
adb install client/android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Step 7: Generate a Signed Release APK (for Distribution)

### 7.1 Create a Keystore

```bash
keytool -genkey -v -keystore mahad-al-hind.keystore -alias mahad-al-hind -keyalg RSA -keysize 2048 -validity 10000
```

Keep this file safe and never commit it to git.

### 7.2 Configure Signing

Create or edit `client/android/app/key.properties`:

```
storePassword=your-store-password
keyPassword=your-key-password
keyAlias=mahad-al-hind
storeFile=mahad-al-hind.keystore
```

Place the `mahad-al-hind.keystore` file in `client/android/app/`.

### 7.3 Configure Gradle for Signing

Edit `client/android/app/build.gradle` and add signing config inside the `android` block:

```gradle
android {
    // ... existing config ...

    signingConfigs {
        release {
            def keystorePropertiesFile = rootProject.file("app/key.properties")
            def keystoreProperties = new Properties()
            keystoreProperties.load(new FileInputStream(keystorePropertiesFile))

            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 7.4 Build the Release APK

```bash
cd client/android
./gradlew assembleRelease
```

APK location: `client/android/app/build/outputs/apk/release/app-release.apk`

### 7.5 Build Android App Bundle (AAB) — for Google Play

```bash
cd client/android
./gradlew bundleRelease
```

AAB location: `client/android/app/build/outputs/bundle/release/app-release.aab`

---

## Step 8: Quick Full Build Script

Save this as `build-apk.sh` at the project root:

```bash
#!/bin/bash
set -e

echo "=== Building Web App ==="
cd client
npm install
npm run build

cd ..

echo "=== Syncing with Capacitor ==="
npx cap copy android
npx cap sync android

echo "=== Building Release APK ==="
cd android
./gradlew assembleRelease

echo "=== Done ==="
echo "APK: client/android/app/build/outputs/apk/release/app-release.apk"
echo "AAB: client/android/app/build/outputs/bundle/release/app-release.aab"
```

On Windows, create `build-apk.bat`:

```batch
@echo off
echo === Building Web App ===
cd client
call npm install
call npm run build
cd ..

echo === Syncing with Capacitor ===
call npx cap copy android
call npx cap sync android

echo === Building Release APK ===
cd android
call gradlew assembleRelease

echo === Done ===
echo APK: android\app\build\outputs\apk\release\app-release.apk
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `ANDROID_HOME` not found | Set environment variable pointing to SDK location |
| Java not recognized | Install JDK 17+ and set `JAVA_HOME` |
| Gradle build fails with memory error | Add `org.gradle.jvmargs=-Xmx2048m` to `gradle.properties` |
| Network requests fail on Android | Add `android:usesCleartextTraffic="true"` to `AndroidManifest.xml` |
| White screen on launch | Run `npx cap copy` again and rebuild |
| App doesn't fit screen properly | Set viewport in `index.html`: `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">` |

---

## Google Play Store Checklist

Before uploading your AAB to Google Play Console:

- [ ] App icon generated for all mipmap densities
- [ ] App signed with a production keystore
- [ ] API endpoints use HTTPS (not HTTP)
- [ ] Privacy Policy added (required by Google Play)
- [ ] Content rating questionnaire completed
- [ ] App bundle (AAB) built with `./gradlew bundleRelease`
- [ ] APK tested on a physical device

---

## Updating the App

1. Make changes to the web app
2. Rebuild: `cd client && npm run build`
3. Sync: `npx cap copy android`
4. Increment version in `capacitor.config.json` and `client/android/app/build.gradle`
5. Rebuild: `./gradlew bundleRelease`
6. Upload new AAB to Google Play Console

---

## Author

**Engineer Qari Muhammad Ammar Uddin**
Full-Stack Developer • Qari of the Quran

- GitHub: [https://github.com/MohammadAmmarUddin](https://github.com/MohammadAmmarUddin)
- Contact: +8801883128299
