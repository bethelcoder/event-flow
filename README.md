# 🎉 Event Management Platform (Real-Time Web App)

A full-stack real-time event management platform built with Express.js,
MongoDB, EJS templating, and Socket.IO. Designed to help organizers
manage event-day operations such as guest check-ins, live schedule
updates, venue mapping, and on-site staff coordination.

------------------------------------------------------------------------

## 📌 Features

🔹 Guest Check-In

-   Manual search by name or email
-   QR code scanning and generation
-   Upload guest list (CSV)

🔹 Live Schedule & Announcements

-   View, edit, and broadcast session schedules
-   Real-time announcements using Socket.IO

🔹 Interactive Venue Map

-   Upload static floorplans (JPG/PNG)
-   Draw and annotate with labels on top
-   Highlight emergency exits and booths

🔹 On-Site Staff Coordination

-   Assign tasks to staff members
-   Log incidents and updates
-   Real-time team chat (Socket.IO)
-   Optional offline-ready PWA features

------------------------------------------------------------------------

## 🛠️ Tech Stack

  Layer         Technology
  ------------- --------------------
  Frontend      HTML, CSS, EJS, JS
  Backend       Node.js, Express
  Database      MongoDB (Mongoose)
  Realtime      Socket.IO
  Templates     EJS Templating
  File Upload   Multer
  QR Codes      qrcode (NPM)

------------------------------------------------------------------------

## 🗃️ Folder Structure

\`\`\` event-management/ │ ├── backend/ │ ├── controllers/ \# Logic for
each module │ ├── models/ \# Mongoose schemas │ ├── routes/ \# Express
route handlers │ └── socket/ \# Socket.IO event logic │ ├── public/ \#
Static files (CSS, JS) │ ├── views/ \# EJS templates │ ├── checkin.ejs │
├── schedule.ejs │ ├── map.ejs │ └── staff.ejs │ ├── uploads/ \#
Uploaded files (e.g. maps, guest lists) │ ├── app.js \# Main Express app
├── .env \# Environment variables ├── package.json └── README.md \`\`\`

------------------------------------------------------------------------

## 🚀 Getting Started

1.  Clone the repo: \`\`\`bash git clone
    https://github.com/your-username/event-management.git cd
    event-management \`\`\`

2.  Install dependencies: \`\`\`bash npm install \`\`\`

3.  Create a .env file: \`\`\`
    MONGO_URI=mongodb://localhost:27017/event-platform PORT=3000 \`\`\`

4.  Run the app: \`\`\`bash npm start \`\`\`

5.  Open in browser: \`\`\` http://localhost:3000 \`\`\`

------------------------------------------------------------------------

## 💾 Sample MongoDB Schemas

🔹 Guest

\`\`\`js { name: String, email: String, checkedIn: Boolean, qrCode:
String } \`\`\`

🔹 Schedule Item

\`\`\`js { title: String, time: String, location: String, status: String
} \`\`\`

🔹 Staff Task

\`\`\`js { staffName: String, task: String, isCompleted: Boolean,
incidentNotes: String } \`\`\`

🔹 Map

\`\`\`js { imageUrl: String, annotations: \[ { type: String, x: Number,
y: Number, label: String } \] } \`\`\`

------------------------------------------------------------------------

## ⚙️ API Routes Overview

  Method   Route             Description
  -------- ----------------- ---------------------------------
  GET      /guests           List all guests
  POST     /guests/checkin   Mark guest as checked-in
  POST     /guests/upload    Upload guest list (CSV)
  GET      /schedule         Fetch event schedule
  POST     /schedule         Create/update schedule item
  POST     /announce         Send announcement via Socket.IO
  GET      /map              View map & overlays
  POST     /map/upload       Upload map image
  POST     /map/annotate     Save overlay/annotation
  GET      /tasks            View staff tasks
  POST     /tasks            Assign a task
  POST     /tasks/complete   Mark task completed

------------------------------------------------------------------------

## 🔐 Security

-   Input validation via express-validator
-   File type checks on uploads
-   Rate-limiting and sanitation for public endpoints

------------------------------------------------------------------------

## 📦 Dependencies

-   express
-   mongoose
-   ejs
-   socket.io
-   qrcode
-   multer
-   dotenv

------------------------------------------------------------------------

## 👥 Contributors

-   Mualusi (Lead Developer)
-   \[Add others as needed\]

------------------------------------------------------------------------

## 📄 License

MIT License
