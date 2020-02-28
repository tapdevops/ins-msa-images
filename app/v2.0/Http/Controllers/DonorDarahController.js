/*
 |--------------------------------------------------------------------------
 | App Setup
 |--------------------------------------------------------------------------
 |
 | Untuk menghandle models, libraries, helper, node modules, dan lain-lain
 |
 */
    // Models
    const DonorDarah = require( _directory_base + '/app/v2.0/Http/Models/DonorDarahModel.js' );

    // Node Modules
	const FileServer = require( 'fs' );
	const FileSystem = require( 'file-system' );

	// Libraries
	const HelperLib = require( _directory_base + '/app/v2.0/Http/Libraries/HelperLib.js' );
    
    exports.createFile = ( req, res ) => {
        // Return FALSE jika tidak ada File yang di upload.
        if( !req.files ) {
            return res.send( {
                status: false,
                message: 'File not found!',
                data: {}
            } );
        }
        try {
            var auth = req.auth;
            let files = [] 
            
            if (!req.files.FILENAME.length) {
                files.push(req.files.FILENAME)
            } else if (req.files.FILENAME.length > 0 ) {
                files = req.files.FILENAME
            }
            
            // Check MIME Type
            // Allowed MIME Type : ➤ IMAGE/JPEG
            // 					   ➤ IMAGE/JPG
            files.forEach(function (file) {
                let filename = String( file.name );
                if ( file.mimetype == 'image/jpeg' || file.mimetype == 'image/jpg' ) {
                        
                    var newFilename = filename;
                    var newFileNameRep = '';
                    if ( file.mimetype == 'image/jpeg' ) {
                        newFileNameRep = newFilename.replace( '.jpeg', '' );
                    } else if ( file.mimetype == 'image/jpg' ) {
                        newFileNameRep = newFilename.replace( '.jpg', '' );
                    }
                    DonorDarah.findOne({ 
                        IMAGE_CODE: req.body.IMAGE_CODE
                    })
                    .then(data => {
                        if (!data) {
                            const set = new DonorDarah( {
                                IMAGE_CODE: req.body.IMAGE_CODE,
                                IMAGE_NAME: newFileNameRep,
                                IMAGE_PATH: "",
                                MIME_TYPE: "",
                                INSERT_USER: req.body.INSERT_USER || "",
                                INSERT_TIME: HelperLib.date_format( 'now', 'YYYYMMDDhhmmss' ),
                            } )
                            .save()
                            .then( data => {
                                let uploadFolder = 'image-donor-darah';
        
                                var dirDate = HelperLib.date_format( 'now', 'YYYYMMDDhhmmss' ).substr( 0, 8 );
                                var directoryLocal = __basedir + '/assets/images/' + uploadFolder + '/' + dirDate;
                                var directoryTargetLocal = directoryLocal;
                                var directoryProject = uploadFolder + '/' + dirDate;
                                
                                console.log(directoryLocal);
                                console.log(directoryTargetLocal)
                                console.log(directoryProject)
                                FileServer.existsSync( directoryLocal ) || FileServer.mkdirSync( directoryLocal );
                                FileServer.existsSync( directoryTargetLocal ) || FileServer.mkdirSync( directoryTargetLocal );
                                
                                file.mv( directoryTargetLocal + '/' + filename, function( err ) {
                                    
                                    if ( err ) {
                                        return res.send( {
                                            status: false,
                                            message: config.error_message.upload_404,
                                            data: {}
                                        } );
                                    }

                                    if ( directoryProject == '' ) {
                                        return res.send( {
                                            status: false,
                                            message: 'Direktori Project kosong.',
                                            data: {}
                                        } );
                                    }
                                
                                    FileSystem.rename( directoryTargetLocal + '/' + filename, directoryTargetLocal + '/' + newFilename, function(err) {
                                        if ( err ) {
                                            return res.send( {
                                                status: false,
                                                message: config.error_message.create_500 + ' - 2',
                                                data: {}
                                            } );
                                        }
                                    })
                                })
                            })
                        }
                    })
                }
            })
            return res.send({
                status: true,
                message: "success",
                data: []
            })       
        } catch (err) {
            return res.send({
                status: false,
                message: err.message,
                data: []
            })     
        }
   };