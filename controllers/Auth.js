const bcrypt = require("bcrypt")
const User = require("../models/User")
const OTP = require("../models/OTP")
const jwt = require("jsonwebtoken")
const otpGenerator = require("otp-generator")
const mailSender = require("../utils/mailSender")
const { passwordUpdated } = require("../mail/templates/passwordUpdate")
const Profile = require("../models/Profile")
const { signupSuccess } = require("../mail/templates/signupsuccess")
const otpTemplate = require("../mail/templates/emailVerificationTemplate")
require("dotenv").config()

// Signup Controller for Registering USers

exports.signup = async (req, res) => {
  try {
    // Destructure fields from the request body
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body
    // Check if All Details are there or not
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).send({
        success: false,
        message: "All Fields are required",
      })
    }
    // Check if password and confirm password match 
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password and Confirm Password do not match. Please try again.",
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please sign in to continue.",
      })
    }

    // Find the most recent OTP for the email
    const response = await OTP.findOne({ email }).sort({ createdAt: -1 }).limit(1)
   // OTP not found 
   console.log(response)
    if (!response) {
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    }
     // Verify OTP
    if (String(otp) !== String(response.otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

     // Optional: Check OTP expiry (5 min)
    const otpCreatedTime = new Date(response.createdAt).getTime();
    const currentTime = Date.now();

    if (currentTime - otpCreatedTime > 5 * 60 * 1000) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create the user
    let approved = ""
    approved === "Instructor" ? (approved = false) : (approved = true)

    // mailSender(
    //   email,
    //   "Welcome to Studynotion | CodeHelp",
    //   signupSuccess(email, firstName)
    // )

    // Create the Additional Profile For User
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    })
    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType: accountType,
      approved: approved,
      additionalDetails: profileDetails._id,
      image: "",
    })

    return res.status(200).json({
      success: true,
      user,
      message: "User registered successfully",
      otp: response.otp, // For testing purposes, remove this in production
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "User cannot be registered. Please try again.",
    })
  }
}

// Login controller for authenticating users
exports.login = async (req, res) => {
  try {
    // ========================
    // Fetch Data From Request
    // ========================
    const { email, password } = req.body;

    // ========================
    // Validation
    // ========================
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please Fill up All the Required Fields",
      });
    }

    // ========================
    // Check User Existence
    // ========================
    const user = await User.findOne({ email }).populate("additionalDetails");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User is not Registered with Us Please SignUp to Continue",
      });
    }

    // ========================
    // Verify Password
    // ========================
    const isPasswordMatched = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordMatched) {
      return res.status(401).json({
        success: false,
        message: "Password is incorrect",
      });
    }

    // ========================
    // Generate OTP
    // ========================
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // ========================
    // Save OTP
    // ========================
    await OTP.create({
      email,
      otp,
    });

    // ========================
    // Send OTP Email
    // ========================
    // await mailSender(
    //   email,
    //   "Verification Email",
    //   otpTemplate(otp)
    // );

    // ========================
    // Send Response
    // ========================
    return res.status(200).json({
      success: true,
      message: "OTP Sent Successfully",
      otp: otp, // For testing purposes, remove this in production
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Login Failure Please Try Again",
    });
  }
};
// Send OTP For Email Verification
exports.sendotp = async (req, res) => {
  try {

    // Get email from request body
    const { email } = req.body;

    // Check if user already exists
    const checkUserPresent = await User.findOne({ email });

    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: "User is Already Registered",
      });
    }

    // Generate OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // Save OTP in database
    await OTP.create({
      email,
      otp,
    });

    // Send OTP mail
    await mailSender(
      email,
      "Verification Email",
      otpTemplate(otp)
    );

    // Send response
    return res.status(200).json({
      success: true,
      message: "OTP Sent Successfully",
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });

  }
};

//verify OTP For Email Verification
exports.verifyotp = async (req, res) => {
  try {

    // ========================
    // Fetch Data
    // ========================
    const { email, otp } = req.body;

    // ========================
    // Find Latest OTP
    // ========================
    const response = await OTP.findOne({ email })
      .sort({ createdAt: -1 });

    if (!response) {
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    }

    // ========================
    // Verify OTP
    // ========================
    if (String(otp) !== String(response.otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // ========================
    // Check OTP Expiry
    // ========================
    const otpCreatedTime = new Date(response.createdAt).getTime();

    const currentTime = Date.now();

    if (currentTime - otpCreatedTime > 5 * 60 * 1000) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // ========================
    // Find User
    // ========================
    const user = await User.findOne({ email })
      .populate("additionalDetails");

    // ========================
    // Generate JWT Token
    // ========================
    const token = jwt.sign(
      {
        email: user.email,
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    // ========================
    // Prepare User Object
    // ========================
    user.token = token;

    user.password = undefined;

    // ========================
    // Cookie Options
    // ========================
    const options = {
      expires: new Date(
        Date.now() + 3 * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    };

    // ========================
    // Send Response
    // ========================
    return res.cookie("token", token, options)
      .status(200)
      .json({
        success: true,
        token,
        user,
        message: "User Login Success",
      });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });

  }
};
// Controller for Changing Password
exports.changePassword = async (req, res) => {
  try {
    // Get user data from req.user
    const userDetails = await User.findById(req.user.id)

    // Get old password, new password, and confirm new password from req.body
    const { oldPassword, newPassword } = req.body

    // Validate old password
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password
    )
    if (!isPasswordMatch) {
      // If old password does not match, return a 401 (Unauthorized) error
      return res
        .status(401)
        .json({ success: false, message: "The password is incorrect" })
    }

    // Update password
    const encryptedPassword = await bcrypt.hash(newPassword, 10)
    const updatedUserDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: encryptedPassword },
      { new: true }
    )

    // Send notification email
    try {
      const emailResponse = await mailSender(
        updatedUserDetails.email,
        "Password for your account has been updated",
        passwordUpdated(
          updatedUserDetails.email,
          `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
        )
      )
      console.log("Email sent successfully:", emailResponse.response)
    } catch (error) {
      // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while sending email:", error)
      return res.status(500).json({
        success: false,
        message: "Error occurred while sending email",
        error: error.message,
      })
    }

    // Return success response
    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" })
  } catch (error) {
    // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
    console.error("Error occurred while updating password:", error)
    return res.status(500).json({
      success: false,
      message: "Error occurred while updating password",
      error: error.message,
    })
  }
}
