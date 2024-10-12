import { asyncHandler } from '../asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { log } from '../contants.js';

// function : generate access and refresh tokens
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await User.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      'Issues while generating Access and Refresh Tokens'
    );
  }
};

// Register User
const registerUser = asyncHandler(async (req, res) => {
  // Get data from the User
  // Validate Data
  // Check that the user is already registered or not : through username and email
  // Check for image and avatar
  // Check the image and avatar in cloudinary
  // Create a User in database
  // Create a response : without PASSWORD AND REFRESH TOKEN
  // check for user creation
  // return response

  // Data from the User
  const { fullName, email, username, password } = req.body;

  // Data Validation
  if (
    [fullName, email, username, password].some(
      (field) => field === undefined || field === null || field?.trim() === ''
    )
  ) {
    throw new ApiError(400, 'All Fields are Compulsaory');
  }

  // Check for existing user
  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) {
    throw new ApiError(
      409,
      'User with given Username or Email is already exist'
    );
  }

  // Check Avatar and coverImage

  let coverImageLocalPath, avatarLocalPath;
  if (req.files?.avatar?.length > 0) {
    avatarLocalPath = req.files.avatar[0].path;
  }
  if (req.files?.coverImage?.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  // log(req.files);

  if (!avatarLocalPath) {
    throw new ApiError(400, 'Avatar is required');
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, 'Avatar file is required');
  }

  // Create a user in database
  const user = await User.create({
    fullName,
    email,
    username: username.toLowerCase(),
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || '',
  });
  const createdUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );
  if (!createdUser) {
    throw new ApiError(500, 'Something went wrong while creating user');
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, 'User Created Successfully'));
});

// Login User
const loginUser = asyncHandler(async (req, res) => {
  // Get data from user
  // validate the fields
  // check for the username or email in db
  // compare the password
  // if (credentials == valid) {
  //    generate access and refresh token and send it to client through cookies
  // }else{
  //    throw an error
  // }

  // Get data
  const { username, email, password } = req.body;

  // Validate fields
  if (
    [username || email, password].some(
      (field) => field === undefined || field === null || field?.trim() === ''
    )
  ) {
    throw new ApiError(404, 'All fields are Compulsory');
  }

  // check for username or email
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, 'User with username or email is not found.');
  }

  // Password check
  const isvalidPassword = await user.isPasswordCorrect(password);

  if (!isvalidPassword) {
    throw new ApiError(404, 'Invalid Credientails');
  }

  // Generate Access and Refresh tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie('Access Token', accessToken, options)
    .cookie('Refresh Token', refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        'User Successfully LoggedIn'
      )
    );
});

// Logout User
const logoutUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // removes the field from the database
      },
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new ApiResponse(200, {}, 'User Logout Successfully'));
});

export { registerUser, loginUser, logoutUser };
