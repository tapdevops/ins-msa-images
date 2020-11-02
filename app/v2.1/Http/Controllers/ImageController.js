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
 	const UploadFotoProfileModel = require( _directory_base + '/app/v2.0/Http/Models/UploadFotoProfileModel.js' );

	// Node Modules
	const FileServer = require( 'fs' );
	const FileSystem = require( 'file-system' );
	
	// Libraries
	const HelperLib = require( _directory_base + '/app/v2.0/Http/Libraries/HelperLib.js' );
	const KafkaServer = require( _directory_base + '/app/v2.0/Http/Libraries/KafkaServer.js' ); 

/**
 * Find image transaksi
 * Untuk mengambil data image berdasarkan TR_CODE dan STATUS_IMAGE.
 * --------------------------------------------------------------------------
 */

 exports.find_image = async ( req, res ) => {
	 
	 const env = config.env;
	 let image_url = req.protocol + '://' + req.get( 'host' ) + '/files';
	//  if( !req.body.TR_CODE || !req.body.STATUS_IMAGE ) {
	if( !req.params.tr_code ){
		res.send( {
			status: false,
			message: "Isi TR_CODE",
			data: []
		} )
	 }
	 else {
		try{
			let condition = {};
			condition.TR_CODE = req.params.tr_code;
			if( req.query.status_image ) {
				condition.STATUS_IMAGE = req.query.status_image;
			}
			
			console.log(condition)
			let query = await UploadImageModel.aggregate( [
			   {
				   $match: condition
			   }
				
				
		    ] );
		   
		    if( query.length > 0 ) {
				let http = [];
				query.forEach( function( data ) {
					http.push( image_url + '/' + data.IMAGE_PATH + '/' + data.IMAGE_NAME );
				} );
				res.send( {
					status: true,
					message: "sukses",
					data: {
						http: http
					}
				} );
		   }
		   else {
			   res.send( {
				   status: true, 
				   message: "sukses",
				   data: []
			   } )
		   }   
	   }
	   catch( error ) {
		   res.send( {
			   status: false,
			   message: error.message,
			   data: []
		   } );
	   }
	 }
	 
 }

/**
 * Find File Foto Profile
 * Untuk mengambil data foto profile berdasarkan USER_AUTH_CODE pada TOKEN.
 * --------------------------------------------------------------------------
 */
 	exports.find_one_file_foto_profile = async ( req, res ) => {
		if ( !req.body.USER_AUTH_CODE ) {
			return res.send( {
				status: false,
				message: config.error_message.find_404,
				data: {}
			} );
		}
		UploadFotoProfileModel.findOne( { 
			INSERT_USER: req.body.USER_AUTH_CODE,
			DELETE_USER: "",
			DELETE_TIME: 0
		} )
		.select( {
			_id: 0,
			IMAGE_NAME: 1,
			IMAGE_PATH: 1,
			INSERT_TIME: 1
		} )
		.then( data => {
			if( !data ) {
				return res.send( {
					status: false,
					message: config.error_message.find_404,
					data: {}
				} );
			}
			return res.send( {
				status: true,
				message: config.error_message.find_200,
				data: {
					URL: req.protocol + '://' + req.get( 'host' ) + '/files' + data.IMAGE_PATH + '/' + data.IMAGE_NAME,
					IMAGE_NAME: data.IMAGE_NAME,
					INSERT_TIME: HelperLib.date_format( String( data.INSERT_TIME ), 'YYYY-MM-DD hh-mm-ss' )
				}
			} );
		} ).catch( err => {
			return res.send( {
				status: false,
				message: config.error_message.find_500,
				data: {}
			} );
		} );
	}

/**
 * Create File Foto Profile
 * Untuk menyimpan data yang diupload dengan multipart/form-data
 * --------------------------------------------------------------------------
 */
 	exports.create_file_foto_profile = async ( req, res ) => {

 		// Return FALSE jika tidak ada File yang di upload.
 		if( !req.files ) {
			return res.send( {
				status: false,
				message: config.error_message.invalid_input + ' REQUEST FILES.',
				data: {}
			} );
		}

		var auth = req.auth;
		var file = req.files.FILENAME;
		var filename = String( file.name );
		console.log(file)
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

			var upload_folder = 'images-profile';
			var dir_date = req.auth.USER_AUTH_CODE;
			var directory_local = __basedir + '/assets/images/' + upload_folder + '/' + dir_date;
			var directory_target_local = directory_local;
			var directory_project = upload_folder + '/' + dir_date;

			FileServer.existsSync( directory_local ) || FileServer.mkdirSync( directory_local );
			FileServer.existsSync( directory_target_local ) || FileServer.mkdirSync( directory_target_local );
				
			file.mv( directory_target_local + '/' + filename, async function( err ) {
					
				if ( err ) {
					return res.send( {
						status: false,
						message: config.error_message.upload_404,
						data: {}
					} );
				}

				if ( directory_project == '' ) {
					return res.send( {
						status: false,
						message: 'Error!',
						data: {}
					} );
				}

				FileSystem.rename( directory_target_local + '/' + filename, directory_target_local + '/' + new_filename, function(err) {
					if ( err ) console.log( 'ERROR: ' + err );
				});

				console.log( '.-`-.-`-.-`-.-`-.-`-.-`-.-`-.-`-.-`-.' );
				console.log( 'New Filename : ' + new_filename_rep );
				console.log( 'Directory Project : ' + directory_project );
				console.log( '.-`-.-`-.-`-.-`-.-`-.-`-.-`-.-`-.-`-.' );

				await UploadFotoProfileModel.updateMany( 
					{
						INSERT_USER: req.auth.USER_AUTH_CODE
					},
					{
						"$set": {
							"DELETE_USER": req.auth.USER_AUTH_CODE,
							"DELETE_TIME": parseInt( HelperLib.date_format( 'now', 'YYYYMMDDhhmmss' ) )
						}
					}
				);

				const set = new UploadFotoProfileModel( {
					IMAGE_NAME: new_filename_rep,
					IMAGE_PATH: "/images-profile/" + req.auth.USER_AUTH_CODE,
					INSERT_USER: req.auth.USER_AUTH_CODE,
					INSERT_TIME: parseInt( HelperLib.date_format( 'now', 'YYYYMMDDhhmmss' ) ),
					UPDATE_USER: "",
					UPDATE_TIME: 0,
					DELETE_USER: "",
					DELETE_TIME: 0
				} );

				set.save();

			} );

			return res.send( {
				status: true,
				message: 'OK',
				data: {}
			} );
		}

		return res.send( {
			status: false,
			message: 'Upload Gagal. Harap mengupload foto dengan ekstensi file JPG/JPEG.',
			data: {}
		} );

 	}

/**
 * importRealm
 * Untuk menyimpan data yang diupload dari auth upload realm
 * --------------------------------------------------------------------------
 */

	exports.create = ( req, res ) => {
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
					IMAGE_NAME: req.body.IMAGE_NAME,
					IMAGE_PATH: req.body.IMAGE_PATH,
					IMAGE_PATH_LOCAL: req.body.IMAGE_PATH_LOCAL || "",
					STATUS_IMAGE: req.body.STATUS_IMAGE || "",
					MIME_TYPE: req.body.MIME_TYPE,
					STATUS_SYNC: req.body.STATUS_SYNC || "",
					SYNC_TIME: HelperLib.date_format( req.body.SYNC_TIME, 'YYYYMMDDhhmmss' ),
					INSERT_USER: req.body.INSERT_USER || "",
					INSERT_TIME: HelperLib.date_format( req.body.INSERT_TIME, 'YYYYMMDDhhmmss' ),
					UPDATE_USER: "",
					UPDATE_TIME: 0,
					DELETE_USER: "",
					DELETE_TIME: 0
				} ).save().then( () => {
					console.log( 'Sukses simpan' );
					res.send( {
						status: true,
						message: 'Success!',
						data: []
					} );
				} ).catch( err => {
					console.log( err.message );
					res.send( {
						status: false,
						message: config.error_message.put_500,
						data: []
					} );
				} ); 
			} else {
				res.send( {
					status: true,
					message: 'Skip save!',
					data: []
				} );
			}
		} );
	}

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
				message: config.error_message.invalid_input + ' REQUEST FILES.',
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
									message: config.error_message.upload_404,
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
							if(upload_folder == 'images-ebcc') {
								let kafkaBody = {
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
										message: config.error_message.create_500 + ' - 2',
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
												message: config.error_message.put_404,
												data: {}
											} );
										}
										
										return res.send( {
											status: true,
											message: 'OK',
											data: {}
										} );
										
									}).catch( err => {
										return res.send( {
											status: false,
											message: config.error_message.put_500,
											data: {}
										} );
									});
								}
								if ( err ) console.log( 'ERROR: ' + err );
							});

						} );
						return res.json( {
							status: true,
							message: 'Success!',
							data: []
						} );
					} ).catch( err => {
						return res.send( {
							status: false,
							message: config.error_message.create_500,
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
				message: config.error_message.upload_406,
				data: {}
			} );
		}

	};

/**
 * find
 * Untuk menyimpan data yang diupload
 * --------------------------------------------------------------------------
 */
	exports.find = ( req, res ) => {

		if( !req.params.id ) {
			return res.send( {
				status: false,
				message: config.error_message.invalid_input + 'TR_CODE.',
				data: {}
			} );
		}

	 	UploadImageModel.find( { 
			TR_CODE : req.params.id,
			DELETE_USER: ""
		} )
		.select({
			_id: 0,
			IMAGE_CODE: 1,
			IMAGE_NAME: 1,
			IMAGE_PATH: 1,
			IMAGE_PATH_LOCAL: 1,
			TR_CODE: 1,
			STATUS_IMAGE: 1,
			STATUS_SYNC: 1,
			SYNC_TIME: 1,
			INSERT_USER: 1,
			INSERT_TIME: 1,
			UPDATE_USER: 1,
			UPDATE_TIME: 1,
			DELETE_USER: 1,
			DELETE_TIME: 1
		})
		.then( data => {
			if( !data ) {
				return res.send( {
					status: false,
					message: config.error_message.find_404,
					data: {}
				} );
			}

			var results = [];
			data.forEach( function( result ) {
				results.push( {
					TR_CODE: result.TR_CODE,
					IMAGE_CODE: result.IMAGE_CODE,
					IMAGE_NAME: result.IMAGE_NAME,
					IMAGE_PATH_LOCAL: result.IMAGE_PATH_LOCAL,
					IMAGE_URL: req.protocol + '://' + req.get( 'host' ) + '/files/' + result.IMAGE_PATH + '/' + result.IMAGE_NAME,
					STATUS_IMAGE: result.STATUS_IMAGE,
					STATUS_SYNC: result.STATUS_SYNC, // Tambahan
					INSERT_USER: result.INSERT_USER,
					INSERT_TIME: HelperLib.date_format( String( result.INSERT_TIME ), 'YYYY-MM-DD hh:mm:ss' )
				} );
			} );
			return res.send( {
				status: true,
				message: config.error_message.find_200,
				data: results
			} );
		} ).catch( err => {
			return res.send( {
				status: false,
				message: config.error_message.find_500,
				data: {}
			} );
		} );
	};

/**
 * Sync Mobile
 * Untuk menyediakan data images dari array TR_CODE yang dikirimkan
 * --------------------------------------------------------------------------
 */
	exports.sync_mobile = ( req, res ) => {

		if( !req.body.TR_CODE ) {
			return res.send( {
				status: false,
				message: config.error_message.find_404,
				data: {}
			} );
		}

		UploadImageModel.find( { 
			TR_CODE : req.body.TR_CODE,
			DELETE_USER: ""
		} )
		.select( {
			_id: 0,
			IMAGE_CODE: 1,
			IMAGE_NAME: 1,
			IMAGE_PATH: 1,
			IMAGE_PATH_LOCAL: 1,
			TR_CODE: 1,
			STATUS_IMAGE: 1,
			STATUS_SYNC: 1,
			SYNC_TIME: 1,
			INSERT_USER: 1,
			INSERT_TIME: 1,
			UPDATE_USER: 1,
			UPDATE_TIME: 1,
			DELETE_USER: 1,
			DELETE_TIME: 1
		} )
		.limit( 20 )
		.sort( {
			//TR_CODE: -1,
			INSERT_TIME: -1
		} )
		.then( data => {
			if( !data ) {
				return res.send( {
					status: false,
					message: config.error_message.find_404,
					data: {}
				} );
			}

			var results = [];
			data.forEach( function( result ) {
				var type_tr = 'F';
				var path_tr = 'finding';
				if ( result.TR_CODE.substr( 0, 1 ) == 'I' ) {
					type_tr = 'I';
					path_tr = 'inspeksi';
				}
				else if ( result.TR_CODE.substr( 0, 1 ) == 'V' ) {
					type_tr = 'V';
					path_tr = 'ebcc';
				}
				else if ( result.TR_CODE.substr( 0, 1 ) == 'M' ) {
					type_tr = 'M';
					path_tr = 'ebcc';
				}

				results.push( {
					TR_CODE: result.TR_CODE,
					IMAGE_CODE: result.IMAGE_CODE,
					IMAGE_NAME: result.IMAGE_NAME,
					IMAGE_PATH_LOCAL: result.IMAGE_PATH_LOCAL,
					IMAGE_URL: req.protocol + '://' + req.get( 'host' ) + '/files/' + result.IMAGE_PATH + '/' + result.IMAGE_NAME,
					STATUS_IMAGE: result.STATUS_IMAGE,
					STATUS_SYNC: result.STATUS_SYNC,
					INSERT_USER: result.INSERT_USER,
					INSERT_TIME: HelperLib.date_format( String( result.INSERT_TIME ), 'YYYY-MM-DD hh-mm-ss' )
				} );

			} );

			return res.send( {
				status: true,
				message: config.error_message.find_200,
				data: results
			} );
		} ).catch( err => {
			return res.send( {
				status: false,
				message: config.error_message.find_500,
				data: {}
			} );
		} );
	}

	// exports.find_random = async ( req, res ) => {
	// 	res.json( req.body );
	// }
	exports.find_random = async ( req, res ) => {
		let image_url = req.protocol + '://' + req.get( 'host' ) + '/files';
		const body = req.body;
		console.log(body);
		const codes =  Object.keys( req.body );
		let resultObject = {  };
		for ( let i = 0; i < codes.length; i++ ) {
			let key = codes[i];
			try {
				let images = await UploadImageModel.aggregate( [
					{
						$match: {
							TR_CODE: {
								$in: body[ codes[i] ]
							}
						}
					},
					{
						$project: {
							_id: 0,
							__v: 0
						}
					},
					{
						$limit: 1
					}
				] );
				if ( images.length > 0 ) {
					resultObject[ key ] = image_url + '/' + images[0].IMAGE_PATH + '/' + images[0].IMAGE_NAME;
				} else {
					resultObject[key] =  image_url + '/default-suggestion.jpg'
				}
			} catch ( err ) {
				return res.send( {
					status: false,
					message: err.message,
					data: []
				} );
			}
		}
		res.send( {
			status: true,
			message: "Success!",
			data: resultObject
		} );
	}

