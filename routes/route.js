function verifyToken( req, res, next ) {
	// Get auth header value
	const bearerHeader = req.headers['authorization'];

	if ( typeof bearerHeader !== 'undefined' ) {
		const bearer = bearerHeader.split( ' ' );
		const bearerToken = bearer[1];

		req.token = bearerToken;
		next();
	}
	else {
		// Forbidden
		res.sendStatus( 403 );
	}
}

module.exports = ( app ) => {
	// Declare Controllers
	const uploadImage = require( '../app/controllers/uploadImage.js' );

	// ROUTE - UPLOAD
	app.post( '/image/description', verifyToken, uploadImage.createDesc );
	app.post( '/image/upload-file', verifyToken, uploadImage.createFile );
}