const imageUploadModel = require( '../models/uploadImage.js' );

// Create and Save new Data
exports.create = ( req, res ) => {

	/*
	if( !req.body.AFD_CODE ) {
		return res.status( 400 ).send({
			status: false,
			message: 'Invalid input',
			data: {}
		});
	}
	*/
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
					DELETE_USER: "",
					DELETE_TIME: "",


					//REGION_CODE: req.body.REGION_CODE || "",
					//COMP_CODE: req.body.COMP_CODE || "",
					//EST_CODE: req.body.EST_CODE || "",
					//WERKS: req.body.WERKS || "",
					//AFD_CODE: req.body.AFD_CODE || "",
					//AFD_NAME: req.body.AFD_NAME || "",
					//WERKS_AFD_CODE: req.body.WERKS_AFD_CODE || "",
					//START_VALID: ( req.body.START_VALID != '' ) ? date.parse( req.body.START_VALID, 'YYYY-MM-DD' ) : "",
					//END_VALID: ( req.body.END_VALID != '' ) ? date.parse( req.body.END_VALID, 'YYYY-MM-DD' ) : "",
					//INSERT_USER: req.body.INSERT_USER || "",
					//INSERT_TIME: ( req.body.INSERT_TIME != '' ) ? date.parse( req.body.INSERT_TIME, 'YYYY-MM-DD HH:mm:ss' ) : "",
					//UPDATE_USER: req.body.UPDATE_USER || "",
					//UPDATE_TIME: ( req.body.UPDATE_TIME != '' ) ? date.parse( req.body.UPDATE_TIME, 'YYYY-MM-DD HH:mm:ss' ) : ""
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