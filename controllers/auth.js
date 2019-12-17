const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

// @desc    Register user
// @route   POST /api/v1/auth
// @access  Public
exports.register = (request, response, next) => {
  const { name, email, password, role } = request.body;

  // create user
  User.create({
    name,
    email,
    password,
    role
  })
    .then(user => {
      sendTokenResponse(user, 200, response);
    })
    .catch(error => {
      next(error);
    });
};

// @desc    Register user
// @route   POST /api/v1/auth
// @access  Public
exports.login = (request, response, next) => {
  const { email, password } = request.body;

  // validate email and password
  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password", 400));
  }

  // get user
  User.findOne({
    email
  })
    .select("+password")
    .then(user => {
      //check if password matches
      user
        .matchPassword(password)
        .then(isMatch => {
          if (!isMatch) {
            next(new ErrorResponse("Invalid credentials", 401));
          }
          sendTokenResponse(user, 200, response);
        })
        .catch(error => {
          next(new ErrorResponse("Invalid credentials", 401));
        });
    })
    .catch(error => {
      next(new ErrorResponse("Invalid credentials", 401));
    });
};

// get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, response) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false
  };

  response
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token });
};

// @desc    Get currently logged in user
// @route   POST /api/v1/auth/me
// @access  Private
exports.getMe = (request, response, next) => {
  User.findById(request.user.id)
    .then(user => {
      response.status(200).json({
        success: true,
        data: user
      });
      next();
    })
    .catch(error => {
      next(error);
    });
};

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = (request, response, next) => {
  User.findOne({ email: request.body.email })
    .then(user => {
      // get reset token
      const resetToken = user.getPasswordResetToken();
      user
        .save({ validateBeforeSave: false })
        .then(() => {
          // create reset url
          const resetUrl = `${request.protocol}://${request.get(
            "host"
          )}/api/v1/auth/resetpassword/${resetToken}`;
          const message = `Reset password: ${resetUrl}`;
          sendEmail({
            email: user.email,
            subject: "Password reset token",
            message
          })
            .then(() => {
              response.status(200).json({
                success: true,
                data: "email sent"
              });
              next();
            })
            .catch(error => {
              console.log(error);
              user.resetPasswordToken = undefined;
              user.resetPasswordExpire = undefined;
              user.save({ validateBeforeSave: false }).then(() => {
                next(new ErrorResponse("Unable to send email"));
              });
            });
        })
        .catch(error => {
          next(error);
        });
    })
    .catch(error => {
      next(error);
    });
};

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Private
exports.resetPassword = (request, response, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(request.params.resettoken)
    .digest("hex");

  User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  })
    .then(user => {
      // set new password
      user.password = request.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      user
        .save()
        .then(() => {
          sendTokenResponse(user, 200, response);
          next();
        })
        .catch(error => {
          next(error);
        });
    })
    .catch(error => {
      next(new ErrorResponse("Invalid token", 400));
    });
};

// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = (request, response, next) => {
  const fields = {
    name: request.body.name,
    email: request.body.email
  };
  User.findByIdAndUpdate(request.user.id, fields, {
    new: true,
    runValidators: true
  })
    .then(user => {
      response.status(200).json({
        success: true,
        data: user
      });
      next();
    })
    .catch(error => {
      next(error);
    });
};

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = (request, response, next) => {
  User.findById(request.user.id)
    .select("+password")
    .then(user => {
      user
        .matchPassword(request.body.currentPassword)
        .then(() => {
          user.password = request.body.newPassword;
          user
            .save()
            .then(() => {
              sendTokenResponse(user, 200, response);
              next();
            })
            .catch(error => {
              throw error;
            });
        })
        .catch(error => {
          throw error;
        });
    })
    .catch(error => {
      next(error);
    });
};
