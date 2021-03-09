const { AuthenticationError } = require('apollo-server-errors');
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

			const newPost = new Post({
				body,
				user: user.id,
				username: user.username,
				createdAt: new Date().toISOString(),
			});

			const post = await newPost.save();

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
	},
};
