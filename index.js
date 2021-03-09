const { ApolloServer } = require('apollo-server');
const mongoose = require('mongoose');

const { mongoSrv } = require('./config');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

const PORT = process.env.PORT || 5000;

const server = new ApolloServer({
	typeDefs,
	resolvers,
	context: ({ req }) => ({ req }), //	forwarding req from express to apollo
});

mongoose
	.connect(mongoSrv, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => {
		console.log('Connected to Database');
		return server.listen({ port: PORT });
	})
	.then((res) => console.log(`Server running at ${res.url}`));
