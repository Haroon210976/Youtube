import { asyncHandler } from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';

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
    [fullName, email, username, password].some((field) => field?.trim() === '')
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
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.avatar[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, 'Avatar is required');
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, 'Avatar is required');
  }

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

export { registerUser };
