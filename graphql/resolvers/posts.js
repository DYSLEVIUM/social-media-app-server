const { AuthenticationError, UserInputError } = require('apollo-server-errors');
const Post = require('../../models/Post');
const checkAuth = require('../../utils/check-auth');

module.exports = {
	Query: {
		getPosts: async () => {
			try {
				const posts = await Post.find().sort({ createdAt: -1 });
				return posts;
			} catch (error) {
				throw new Error(error);
			}
		},

		getPost: async (parent, args, context, info) => {
			const { postId } = args;

			try {
				const post = await Post.findById(postId);

				if (post) {
					return post;
				} else {
					throw new Error('Post not found');
				}
			} catch (error) {
				throw new Error(error);
			}
		},
	},

	Mutation: {
		createPost: async (parent, args, context, info) => {
			const { body } = args;
			const user = checkAuth(context);

			if (body.trim() === '') throw new Error('Post body must not be empty');

			const newPost = new Post({
				body,
				user: user.id,
				username: user.username,
				createdAt: new Date().toISOString(),
			});

			const post = await newPost.save();

			context.pubSub.publish('NEW_POST', {
				newPost: post,
			});

			return post;
		},
		deletePost: async (parent, args, context, info) => {
			const { postId } = args;
			const user = checkAuth(context);

			try {
				const post = await Post.findById(postId);
				if (user.username === post.username) {
					await post.delete();

					return 'Post deleted successfully';
				} else {
					throw new AuthenticationError('Action not allowed');
				}
			} catch (error) {
				throw new Error(error);
			}
		},
		likePost: async (parent, args, context, info) => {
			const { postId } = args;
			const { username } = checkAuth(context);

			const post = await Post.findById(postId);

			if (post) {
				if (post.likes.find((like) => like.username === username)) {
					//	post already liked
					post.likes = post.likes.filter((like) => like.username !== username);
				} else {
					//	post not liked
					post.likes.push({
						username,
						createdAt: new Date.toISOString(),
					});
				}
				await post.save();
				return post;
			} else throw new UserInputError('Post not found');
		},
	},

	Subscription: {
		newPost: {
			subscribe: (parent, args, context, info) => {
				const { pubSub } = args;

				return pubSub.asyncIterator('NEW_POST');
			},
		},
	},
};
