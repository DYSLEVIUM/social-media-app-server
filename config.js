require('dotenv').config();

module.exports = {
	mongoSrv: process.env.MONGO_SRV,
	jwtSecret: process.env.JWT_SECRET,
};
