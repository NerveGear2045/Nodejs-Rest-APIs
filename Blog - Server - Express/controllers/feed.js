const fs = require('fs');
const path = require('path');
const Post = require('../models/post');
const User = require('../models/user');

const { validationResult } = require('express-validator');

const deleteImage = filepath => {
  const p = path.join(
    path.dirname(process.mainModule.filename),
    'images',
    filepath
  );
  // console.log(p);
  fs.unlink(p, error => {
    if (error) {
      console.log(error);
    }
  });
};

exports.getPosts = async (req, res, next) => {
  const page = req.query.page || 1;
  const perPage = 2;
  try {
    const totalPosts = await Post.countDocuments();

    const posts = await Post.find()
      .skip((page - 1) * perPage)
      .limit(perPage);

    res.status(200).json({
      posts: posts,
      message: 'Fetched all posts successfully.',
      totalItems: totalPosts,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Invalid typed input!');
    error.statusCode = 422;
    throw error;
  }

  if (!req.file) {
    const error = new Error('No image attached or wrong image format.');
    error.statusCode = 422;
    throw error;
  }

  const title = req.body.title;
  const content = req.body.content;
  const imageUrl = req.file.filename;

  const post = new Post({
    title: title,
    content: content,
    imageUrl: '/' + imageUrl,
    creator: req.userId,
  });
  try {
    await post.save();
    const user = await User.findById(req.userId);
    user.posts.push(post);
    await user.save();

    res.status(201).json({
      message: 'Create new post success!',
      post: post,
      creator: { _id: user._id, name: user.name },
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("Couldn't find any post with that Id.");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ post: post, message: 'Post fetched!' });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.editPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Invalid entered input!');
    error.statusCode = 422;
    throw error;
  }

  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = '/' + req.file.filename;
  }
  if (!imageUrl) {
    const error = new Error("Couldn't find any image.");
    error.statusCode = 422;
    throw error;
  }
  try {
    const post = await Post.findById(postId);

    if (!post) {
      const error = new Error("Couldn't find any post.");
      error.statusCode = 404;
      throw error;
    }
    if (post.creator.toString() !== req.userId) {
      const error = new Error('Not authorized.');
      error.statusCode = 403;
      throw error;
    }
    if (post.imageUrl !== imageUrl) {
      deleteImage(post.imageUrl);
    }
    post.title = title;
    post.content = content;
    post.imageUrl = imageUrl;
    const savedPost = await post.save();

    res.status(200).json({
      post: savedPost,
      message: 'Updated post successfully!',
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("Couldn't find any post.");
      error.statusCode = 404;
      throw error;
    }
    if (post.creator !== req.userId) {
      const error = new Error('Not authorization');
      error.statusCode = 403;
      throw error;
    }
    deleteImage(post.imageUrl);
    await Post.findByIdAndRemoveove(postId);

    const user = await User.findById(req.userId);

    user.posts.pull(postId);
    await user.save();

    res.status(200).json({
      message: 'Deleted post.',
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
