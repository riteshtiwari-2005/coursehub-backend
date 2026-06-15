exports.signupSuccess = (email, name) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <title>Welcome to CourseHub</title>
      <style>
          body {
              background-color: #f4f7fb;
              font-family: Arial, sans-serif;
              color: #333;
              margin: 0;
              padding: 0;
          }

          .container {
              max-width: 600px;
              margin: 40px auto;
              background: #ffffff;
              border-radius: 10px;
              padding: 30px;
              text-align: center;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }

          .logo {
              width: 180px;
              margin-bottom: 20px;
          }

          .heading {
              font-size: 24px;
              font-weight: bold;
              color: #1e293b;
              margin-bottom: 20px;
          }

          .body {
              font-size: 16px;
              line-height: 1.6;
              color: #555;
              margin-bottom: 25px;
          }

          .button {
              display: inline-block;
              background-color: #2563eb;
              color: white !important;
              text-decoration: none;
              padding: 12px 25px;
              border-radius: 8px;
              font-size: 16px;
              font-weight: bold;
          }

          .footer {
              margin-top: 30px;
              font-size: 13px;
              color: #888;
          }
      </style>
  </head>

  <body>
      <div class="container">

          <a href="https://coursehub.vercel.app">
              <img
                  class="logo"
                  src="https://res.cloudinary.com/dlvab82tp/image/upload/v1781283935/logo_o6exae.png"
                  alt="CourseHub Logo"
              >
          </a>

          <div class="heading">
              Welcome to CourseHub, ${name}! 🎉
          </div>

          <div class="body">
              Thank you for joining <b>CourseHub</b>.<br><br>

              We're excited to have you onboard! Explore courses, learn new skills,
              and start your journey with us today.
          </div>

          <a class="button" href="https://coursehub.vercel.app">
              Explore CourseHub
          </a>

          <div class="footer">
              Need help?<br>
              Contact us at
              <a href="mailto:support@coursehub.com">
                  support@coursehub.com
              </a>
          </div>

      </div>
  </body>
  </html>
  `;
};