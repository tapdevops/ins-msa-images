module.exports = ( app ) => {
	// Declare Controllers
	const uploadImage = require( '../app/controllers/uploadImage.js' );

	// ROUTE - UPLOAD
	app.post( '/upload/image', uploadImage.create );
}
/*
function imageValidation( req, res, next ) { 
	// Get auth header value
	const file = req.files.filename;
	const filename = file.name;
	const mimetype = file.mimetype;
	const allowedExtensions = [
		'image/jpeg',
		'image/png'
	];

	if ( allowedExtensions.indexOf( mimetype ) >= 0 ) {
		next();
	}
	else {
		// Forbidden
		res.sendStatus( 403 );
	}
};
*/