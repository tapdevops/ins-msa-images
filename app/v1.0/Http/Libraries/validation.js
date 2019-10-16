module.exports.image = function ( req, res, next ) { 
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