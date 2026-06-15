# ENV Analysis — CourseHub-Backend-Code

This document lists all environment variables referenced in the backend code, where they are used, and short recommendations.

- PORT
  - Where: index.js (default fallback used)
  - Purpose: server listening port
  - Notes: default `4000` when `PORT` is unset

- MONGODB_URL
  - Where: config/database.js
  - Purpose: MongoDB connection string
  - Notes: provide full URI (e.g., `mongodb+srv://<user>:<pass>@cluster0.mongodb.net/dbname`)

- JWT_SECRET
  - Where: controllers/Auth.js, middleware/auth.js
  - Purpose: signing/verifying JWT tokens
  - Notes: must be a strong secret; do not commit plaintext to VCS

- CLOUD_NAME
  - Where: config/cloudinary.js
  - Purpose: Cloudinary cloud name for image uploads

- API_KEY
  - Where: config/cloudinary.js
  - Purpose: Cloudinary API key

- API_SECRET
  - Where: config/cloudinary.js
  - Purpose: Cloudinary API secret

- MAIL_HOST
  - Where: utils/mailSender.js
  - Purpose: SMTP host for sending emails

- MAIL_USER
  - Where: utils/mailSender.js
  - Purpose: SMTP user/email used as `from` address

- MAIL_PASS
  - Where: utils/mailSender.js
  - Purpose: SMTP password/credential

- FOLDER_NAME
  - Where: controllers/Course.js, controllers/profile.js, controllers/Subsection.js
  - Purpose: Cloudinary folder name or storage folder identifier

Recommendations
- Create a `.env` with placeholder values and add it to `.gitignore`.
- Store secrets (JWT_SECRET, DB creds, Cloudinary API secret, MAIL_PASS) in a secrets manager for production.
- Use strong random values for `JWT_SECRET` and database passwords.

Example `.env` (placeholders):

PORT=4000
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_here
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
MAIL_HOST=smtp.example.com
MAIL_USER=your_email@example.com
MAIL_PASS=your_email_password
FOLDER_NAME=your_cloud_folder

