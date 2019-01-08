exports.downloadFinding = async ( req, res ) => {
	console.log(req.auth);
	
	var auth = req.auth;
	
	mobileSyncModel.find( {
		INSERT_USER: auth.USER_AUTH_CODE,
		//IMEI: auth.IMEI,
		TABEL_UPDATE: 'finding'
	} )
	.sort( { TGL_MOBILE_SYNC: -1 } )
	.limit( 1 )
	.then( data => {
		if ( !data ) {
			return res.send( {
				status: false,
				message: 'Data not found 2',
				data: {}
			} );
		}

		if ( data.length > 0 ) {
			// Terdapat data di T_MOBILE_SYNC dengan USER_AUTH_CODE dan IMEI
			var dt = data[0];
			var start_date = date.convert( String( dt.TGL_MOBILE_SYNC ), 'YYYYMMDDhhmmss' );
		}
		else {
			var start_date = 0;
		}
		
		var end_date = date.convert( 'now', 'YYYYMMDDhhmmss' );
			
		// Jika tanggal terakhir sync dan hari ini berbeda, maka akan dilakukan pengecekan ke database
		var client = new Client();
		var args = {
			headers: { "Content-Type": "application/json", "Authorization": req.headers.authorization }
		};
		var parent_ms = 'finding';
		var target_ms = '';
		var url = config.url.microservices.finding + '/sync-mobile/finding-images/';
		var url_final = url + start_date + '/' + end_date;
		
		console.log(url_final);

		client.get( url_final, args, function ( data, response ) {

			if ( data.data.length == 0 ) {
				res.json({
					"status": true,
					"message": 'Tidak ada data',
					"data": {
						hapus: [],
						simpan: [],
						ubah: []
					}
				});
			}
			else {
				var results = [];
				var data_response = data.data;
				data_response.forEach( function( result ) {
					results.push( result );
					console.log(result);
				} );

				var finding_images = new Client();
				var finding_images_url = config.url.microservices.images + '/sync-mobile/images';
				var finding_images_args = {
					data: {
						"TR_CODE": results
					},
					headers: { 
						"Content-Type": "application/json", 
						"Authorization": req.headers.authorization
					},
					requestConfig: {
						timeout: 500, //request timeout in milliseconds
						noDelay: true, //Enable/disable the Nagle algorithm
						keepAlive: true, //Enable/disable keep-alive functionalityidle socket
					},
					responseConfig: {
						timeout: 500
					}
				};

				finding_images.post( finding_images_url, finding_images_args, function( data, response ) {
					res.json( {
						"status": data.status,
						"message": data.message,
						"data": {
							hapus: [],
							simpan: data.data,
							ubah: []
						}
					} );
				} )
				.on( 'requestTimeout', function ( req ) {
					//req.abort();
					res.send( {
						status: false,
						message: 'Request Timeout',
						data: {}
					} );
				} )
				.on( 'responseTimeout', function ( res ) {
					res.send( {
						status: false,
						message: 'Response Timeout',
						data: {}
					} );
				} )
				.on( 'error', function ( err ) {
					res.send( {
						status: false,
						message: 'Error Login!',
						data: {}
					} );
				} );
			}

		});
		
	} ).catch( err => {
		if( err.kind === 'ObjectId' ) {
			return res.send( {
				status: false,
				message: 'ObjectId Error',
				data: {}
			} );
		}
		return res.send( {
			status: false,
			message: 'Error retrieving data',
			data: {}
		} );
	} );
	
};