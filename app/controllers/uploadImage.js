const config = require( '../../config/config.js' ); 	
const uuid = require( 'uuid' );
const nJwt = require( 'njwt' );
const dateAndTimes = require( 'date-and-time' );
const jwtDecode = require( 'jwt-decode' );
const randomTextLib = require( '../libraries/randomText' );
const imageUploadModel = require( '../models/uploadImage.js' );
const fs = require( 'file-system' );
const SSHClient = require( 'scp2' );

// Create and Save new Data
exports.createDesc = ( req, res ) => {

	nJwt.verify( req.token, config.secret_key, config.token_algorithm, ( err, authData ) => {
		if ( err ) {
			console.log(err)
			return res.send( {
				status: false,
				message: 'Invalid Token',
				data: {}
			} );
		}

		if ( !req.body.TR_CODE  ) {
			return res.send( {
				status: false,
				message: "Invalid input image description",
				data: {}
			} );
		}

		var trcode = req.body.TR_CODE;
		var split = trcode.split("-");
		var auth = jwtDecode( req.token );
		var randomText = randomTextLib.generate( 5 );
		var CODE = auth.EMPLOYEE_NIK + 
			'-' + 
			dateAndTimes.format( new Date(), 'YYYYMMDD' ) + 
			'-' + 
			split[3] + 
			'-' +
			split[4] + 
			'-' + 
			split[5] + 
			'-I-' + 
			randomText;
		//var folder_target = dateAndTimes.format( new Date(), 'YYYYMMDD' );
		var imgcode = req.body.IMAGE_CODE;
		var folder_target = imgcode.split( '-' );
		var dir = folder_target[1];
		
		const set = new imageUploadModel( {
			IMAGE_CODE: req.body.IMAGE_CODE,
			TR_CODE: req.body.TR_CODE || "",
			IMAGE_NAME: req.body.IMAGE_NAME || "",
			IMAGE_PATH: folder_target[1],
			STATUS_IMAGE: req.body.STATUS_IMAGE || "",
			STATUS_SYNC: req.body.STATUS_SYNC || "",
			SYNC_TIME: new Date(),
			INSERT_USER: auth.USER_AUTH_CODE,
			INSERT_TIME: new Date() || "",
			UPDATE_USER: auth.USER_AUTH_CODE,
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
			res.send( {
				status: false,
				message: 'Some error occurred while creating data',
				data: {}
			} );
		} );

	} );
};

// Create and Save new Data
exports.createFile = ( req, res ) => {

	nJwt.verify( req.token, config.secret_key, config.token_algorithm, ( err, authData ) => {
		if ( err ) {
			console.log(err)
			return res.send( {
				status: false,
				message: 'Invalid Token',
				data: {}
			} );
		}

		if( !req.files ) {
			return res.send({
				status: false,
				message: 'Invalid file input',
				data:  {}
			} );
		}

		if ( req.files ) {

			var file = req.files.filename;
			var filename = file.name;
			
			imageUploadModel.findOne( { 
				IMAGE_NAME : filename,
				DELETE_USER: "",
				DELETE_TIME: ""
			} ).then( data => {
				if( !data ) {
					return res.send({
						status: false,
						message: "Gambar tidak ditemukan",
						data: data,
					});
				}

				file.mv( './assets/temp-images/' + filename, function( err ) {

					if ( err ) {
						return res.send({
							status: false,
							message: "Some error occurred while creating data",
							data: {},
						});
					}

					SSHClient.defaults({
						port: 22,
						host: '149.129.242.205',
						username: 'root',
						password: 'anfieldSG08'
					});


					SSHClient.mkdir( 'development/upload-images/' + data.IMAGE_PATH, function( err ) {
						if ( err ) {
							return res.send({
								status: false,
								message: "MKDIR Error",
								data: {},
							});
						}

						SSHClient.scp( './assets/temp-images/' + filename, {
							host: '149.129.242.205',
							username: 'root',
							password: 'anfieldSG08',
							path: '/root/development/upload-images/' + data.IMAGE_PATH + '/'
						}, function( err ) {
							if ( err ) {
								return res.send({
									status: false,
									message: "SSH Error",
									data: {},
								});
							}

							fs.unlink( 'assets/temp-images/' + filename, ( err ) => {
								if ( err ) throw err;
								console.log( 'assets/temp-images/' + filename );
							} );

							res.send( {
								status: true,
								message: 'Success',
								data: {}
							} );
							
						});
					} );
				} );
				
			} ).catch( err => {
				if( err.kind === 'ObjectId' ) {
					return res.send({
						status: false,
						message: "Error",
						data: {}
					});
				}
				return res.send({
					status: false,
					message: "Error retrieving Data",
					data: {}
				} );
			} );
			
		}
		else {
			res.send({
				status: false,
				message: 'Gagal upload file',
				data: {}
			});
		}

	} );
};
