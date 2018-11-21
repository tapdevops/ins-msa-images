const imageUploadModel = require( '../models/uploadImage.js' );

// Create and Save new Data
exports.create = ( req, res ) => {

	if( !req.files ) {
		return res.status( 400 ).send({
			status: false,
			message: 'Invalid file input',
			data:  {}
		} );
	}

	if ( !req.body.IMAGE_CODE || !req.body.TR_CODE  ) {
		return res.status( 400 ).send( {
			status: false,
			message: "Invalid input image description",
			data: {}
		} );
	}

	if ( req.files ) {
		var file = req.files.filename;
		var filename = file.name;
		file.mv( './assets/file-upload/' + filename, function( err ) {
			
			if ( err ) {
				console.log( err );
				res.json( {
					message: err
				} );
			}
			else {
				const set = new imageUploadModel( {
					IMAGE_CODE: req.body.IMAGE_CODE || "",
					TR_CODE: req.body.TR_CODE || "",
					IMAGE_NAME: filename || "",
					IMAGE_PATH: 'assets/file-upload/' + filename || "",
					STATUS_IMAGE: req.body.STATUS_IMAGE || "",
					STATUS_SYNC: req.body.STATUS_SYNC || "",
					SYNC_TIME: new Date(),
					INSERT_USER: req.body.INSERT_USER || "",
					INSERT_TIME: new Date() || "",
					UPDATE_USER: req.body.INSERT_USER || "",
					UPDATE_TIME: new Date() || "",
					DELETE_USER: ""
				} );

				set.save()
				.then( data => {
					res.send( {
						status: true,
						message: 'Success',
						data: {}
					} );
				} ).catch( err => {
					res.status( 500 ).send( {
						status: false,
						message: 'Some error occurred while creating data',
						data: {}
					} );
				} );
	
			}
		} );
	}
	else {
		res.status(500).send({
			message: "Upload file gagal."
		});
	}
	
};
