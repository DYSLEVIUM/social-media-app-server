const { UserInputError, AuthenticationError } = require('apollo-server-errors');
const Post = require('../../models/Post');
const checkAuth = require('../../utils/check-auth');

module.exports = {
	Mutation: {
		createComment: async (parent, args, context, info) => {
			const { postId, body } = args;

			const user = checkAuth(context);

			if (body.trim() === '') {
				throw new UserInputError('Empty comment', {
					errors: {
						body: 'Comment body must not be empty',
					},
				});
			}

			const post = await Post.findById(postId);

			if (post) {
				post.comments.unshift({
					body,
					username: user.username,
					createdAt: new Date().toISOString(),
				});

				await post.save();
				return post;
			} else throw new UserInputError('Post not found');
		},

		deleteComment: async (parent, args, context, info) => {
			const { postId, commentId } = args;
			const { username } = checkAuth(context);

			const post = await Post.findById(postId);

			if (post) {
				const commentIndex = post.comments.findIndex((c) => c.id === commentId);

				if (post.comments[commentIndex].username === username) {
					post.comments.splice(commentIndex, 1);
					await post.save();
					return post;
				} else throw new AuthenticationError('Action not allowed');
			} else throw new UserInputError('Post not found');
		},
	},
};
