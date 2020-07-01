/*
 |--------------------------------------------------------------------------
 | App Setup
 |--------------------------------------------------------------------------
 |
 | Untuk menghandle models, libraries, helper, node modules, dan lain-lain
 |
 */
 	// Models

 	const UploadFotoProfileModel = require( _directory_base + '/app/v2.0/Http/Models/UploadFotoProfileModel.js' );

	// Node Modules
	const FileServer = require( 'fs' );
	const FileSystem = require( 'file-system' );

	// Libraries
	const HelperLib = require( _directory_base + '/app/v2.0/Http/Libraries/HelperLib.js' );

	//config
	const config = require( _directory_base + '/config/config.js' )



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
				});


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
					status: true,
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
 * Find List File Foto Profile
 * Untuk mendapatkan list url foto profile yang digunakan pada PetaPanenController di MSA-INTERNAL-TAP
 * --------------------------------------------------------------------------------------------------
 */
	 exports.findListFotoProfile = async (req, res) => {
		 const userAuthCodes = req.body.AUTH_CODES;
		 let response = [];
		 if (!userAuthCodes) {
			 return res.send({
				 status: false,
				 message: 'USER_AUTH_CODE kosong',
				 data: []
			});
		}
		await Promise.all(userAuthCodes.map(async function(authCode) {
			let imageURLs = {};
			let type = {};
			for(let key in authCode) {
				if (key != 'TYPE') {
					let imageURL = await getImageURL(authCode[key], req);
					imageURLs[authCode[key]] = imageURL;
				}
			}
			type[authCode['TYPE']] = imageURLs;
			response.push(type);
		}));
		// console.log(response);
		return res.send({
			status: true,
			message: 'Success!',
			data: response
		})
	 }

	async function getImageURL(userAuthCode, req) {
		 let result = await UploadFotoProfileModel.findOne( { 
						INSERT_USER: userAuthCode,
						DELETE_USER: "",
						DELETE_TIME: 0
					} )
					.select( {
						_id: 0,
						IMAGE_NAME: 1,
						IMAGE_PATH: 1,
						INSERT_TIME: 1
					} )
		if (!result) {
			return req.protocol + '://' + req.get( 'host' ) + '/files/images-profile/default.png';
		} else {
			return req.protocol + '://' + req.get( 'host' ) + '/files' + result.IMAGE_PATH + '/' + result.IMAGE_NAME;
		}
	 }

