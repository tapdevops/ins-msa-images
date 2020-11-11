/*
 |--------------------------------------------------------------------------
 | App Setup
 |--------------------------------------------------------------------------
 |
 | Untuk menghandle models, libraries, helper, node modules, dan lain-lain
 |
 */
 	// Models

 	const UploadImageModel = require( _directory_base + '/app/v2.0/Http/Models/UploadImageModel.js' );

	// Node Modules
	const FileServer = require( 'fs' );
	const FileSystem = require( 'file-system' );
	const fs = require('fs-extra');
	
	// Libraries
	const HelperLib = require( _directory_base + '/app/v2.0/Http/Libraries/HelperLib.js' );
	const KafkaServer = require( _directory_base + '/app/v2.0/Http/Libraries/KafkaServer.js' ); 



/**
 * createFile
 * Untuk menyimpan data yang diupload dengan multipart/form-data
 * --------------------------------------------------------------------------
 */
 	exports.create_file = ( req, res ) => {
 		// Return FALSE jika tidak ada File yang di upload.
		if( !req.files ) {
			return res.send( {
				status: false,
				message: config.app.error_message.invalid_input + ' REQUEST FILES.',
				data: {}
			} );
		}

		// Return FALSE jika tidak terdapat variabel TR_CODE
		if ( !req.body.TR_CODE || !req.body.IMAGE_CODE  ) {
			return res.send( {
				status: false,
				message: 'Body input tidak valid, periksa TR_CODE atau IMAGE_CODE.',
				data: {}
			} );
		}

		var auth = req.auth;
		var file = req.files.FILENAME;
		var filename = String( file.name );
		// Check MIME Type
		// Allowed MIME Type : ➤ IMAGE/JPEG
		// 					   ➤ IMAGE/JPG
		
		if ( file.mimetype == 'image/jpeg' || file.mimetype == 'image/jpg' ) {
			
			var new_filename = filename;
			var new_filename_rep = '';
			if ( file.mimetype == 'image/jpeg' ) {
				new_filename_rep = new_filename.replace( '.jpeg', '' );
			}
			else if ( file.mimetype == 'image/jpg' ) {
				new_filename_rep = new_filename.replace( '.jpg', '' );
			}

			// Cari TR_CODE dan IMAGE_CODE gambar, apakah sudah ada di Database atau belum
			// Jika sudah, maka akan di return false
			UploadImageModel.findOne( {
				IMAGE_CODE: req.body.IMAGE_CODE,
				TR_CODE: req.body.TR_CODE,
			} ).then( img => {
				if ( !img ) {
					const set = new UploadImageModel( {
						IMAGE_CODE: req.body.IMAGE_CODE,
						TR_CODE: req.body.TR_CODE || "",
						IMAGE_NAME: new_filename_rep,
						IMAGE_PATH: "",
						IMAGE_PATH_LOCAL: req.body.IMAGE_PATH_LOCAL || "",
						STATUS_IMAGE: req.body.STATUS_IMAGE || "",
						MIME_TYPE: "",
						STATUS_SYNC: req.body.STATUS_SYNC || "",
						SYNC_TIME: HelperLib.date_format( req.body.SYNC_TIME, 'YYYYMMDDhhmmss' ),
						INSERT_USER: req.body.INSERT_USER || "",
						INSERT_TIME: HelperLib.date_format( req.body.INSERT_TIME, 'YYYYMMDDhhmmss' ),
						UPDATE_USER: "",
						UPDATE_TIME: 0,
						DELETE_USER: "",
						DELETE_TIME: 0
					} ).save().then( data => {

			// 			// Set Upload folder
						var upload_folder = '';
						switch ( String( req.body.TR_CODE.substr( 0, 1 ) ) ) {
							// Finding
							case 'F':
								upload_folder = 'images-finding';
							break;
							// Inspection
							case 'I':
								upload_folder = 'images-inspeksi';
							break;
							// EBCC Validation - Estate
							case 'V':
								upload_folder = 'images-ebcc';
							break;
							// EBCC Validation - Mill
							case 'M':
								upload_folder = 'images-ebcc';
							break;
						}

						var dir_date = HelperLib.date_format( req.body.INSERT_TIME, 'YYYYMMDDhhmmss' ).substr( 0, 8 );
						var directory_local = __basedir + '/assets/images/' + upload_folder + '/' + dir_date;
						var directory_target_local = directory_local;
						var directory_project = upload_folder + '/' + dir_date;

						FileServer.existsSync( directory_local ) || FileServer.mkdirSync( directory_local );
						FileServer.existsSync( directory_target_local ) || FileServer.mkdirSync( directory_target_local );
						
						file.mv( directory_target_local + '/' + filename, function( err ) {
							
							if ( err ) {
								return res.send( {
									status: false,
									message: config.app.error_message.upload_404,
									data: {}
								} );
							}

							if ( directory_project == '' ) {
								return res.send( {
									status: false,
									message: 'Direktori Project kosong.',
									data: {}
								} );
							}
							if(upload_folder == 'images-ebcc' && dir_date !== '') {
								let kafkaBody = {
									EBCC_CODE: req.body.TR_CODE,
									IMG_URL: config.app.url[config.app.env].microservice_images + '/files/' + upload_folder + '/' + dir_date + '/' + new_filename_rep,
									IMG_NAME: new_filename_rep,
									SOURCE: 'MOBILE_INSPECTION',
									INSERT_TIME: HelperLib.date_format( req.body.INSERT_TIME, 'YYYYMMDDhhmmss' ),
									INSERT_USER: req.auth.USER_AUTH_CODE
								}
								// console.log(kafka)
								KafkaServer.producer('INS_MSA_IMAGE_TR_IMAGE', JSON.stringify(kafkaBody));
							}

							FileSystem.rename( directory_target_local + '/' + filename, directory_target_local + '/' + new_filename, function(err) {
								if ( err ) {
									return res.send( {
										status: false,
										message: config.app.error_message.create_500 + ' - 2',
										data: {}
									} );
								}
								else {
									UploadImageModel.findOneAndUpdate( { 
										IMAGE_CODE : req.body.IMAGE_CODE,
										IMAGE_NAME : new_filename,
										TR_CODE : req.body.TR_CODE
									}, {
										IMAGE_NAME : new_filename_rep,
										MIME_TYPE: file.mimetype,
										IMAGE_PATH : directory_project,
										UPDATE_USER: req.body.INSERT_USER || "",
										UPDATE_TIME: HelperLib.date_format( req.body.SYNC_TIME, 'YYYYMMDDhhmmss' )
									}, { new: true } )
									.then( img_update => {
										if( !img_update ) {
											return res.send( {
												status: false,
												message: config.app.error_message.put_404,
												data: {}
											} );
										}
										
										return res.send( {
											status: true,
											message: 'OK',
											data: {}
										} );
										
									}).catch( err => {
										console.log(err);
									});
								}
								if ( err ) console.log( 'ERROR: ' + err );
							});

						} );
					} ).catch( err => {
						return res.send( {
							status: false,
							message: config.app.error_message.create_500,
							data: {}
						} );
					} );
				}
				else {
					return res.json( {
						status: true,
						message: 'Skip save',
						data: []
					} );
				}
			} ).catch( err => {
				return res.send( {
					status: false,
					message: 'Catch Error',
					data: {}
				} );
			} );
		}
		else {
			return res.send( {
				status: false,
				message: config.app.error_message.upload_406,
				data: {}
			} );
		}

	};

	exports.copyImage = async ( req, res ) => {
		let urlFrom = req.body.IMAGE_URL_FROM; // http://image.tap-agri.com:3012/files/images-ebcc/20201103/VP042220201103103040.jpg
		let urlTo = req.body.IMAGE_URL_TO; // http://image.tap-agri.com:3012/files/images-ai/type/category/VP042220201103103040.jpg

		let pathFrom = './assets/images' + urlFrom.substring(urlFrom.indexOf('/files') + 6); 
		let pathTo = './assets/images' + urlTo.substring(urlTo.indexOf('/files') + 6); // /files/images-ai/type/category/VP042220201103103040.jpg

		// To copy a folder or file
		// Async with promises:
		fs.copy(pathFrom, pathTo)
		.then(() => {
			console.log('file copied!');
			return res.status(200).send({
				status: true,
				message: 'success',
				data: []
			})
		})
		.catch(err => {
			console.error(err);
			if(err.code == 'ENOENT') {
				return res.status(404).send({
					status: false,
					message: 'File not found!',
					data: []
				})
			}
 			return res.status(500).send({
				status: false,
				message: 'Internal Server Error',
				data: []
			})
		})
	}



	

