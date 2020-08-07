/*
 |--------------------------------------------------------------------------
 | App Setup
 |--------------------------------------------------------------------------
 |
 | Untuk menghandle models, libraries, helper, node modules, dan lain-lain
 |
 */
    const StreamZip = require('node-stream-zip');
    const async = require('async');
    const fs = require('fs');
    const rimraf = require("rimraf");
    const mv = require('mv');
    const path = require('path');
    const glob = require('glob');

    // Libraries
    const Helper = require( _directory_base + '/app/v2.0/Http/Libraries/HelperLib.js' );
    
    const assetsDirectory = _directory_base + '/assets'
    const internalServerError = {
        errorCode: 500,
        message: 'Internal Server Error'
    } 
    exports.uploadImage = async ( req, res ) => {
        if(!req.files.IMAGES_ZIP) {
            return res.send({
                status: false,
                message: 'file not found!',
                data: []
            })
        }
        console.log(req.files.IMAGES_ZIP);
        if(req.files.IMAGES_ZIP.mimetype != 'application/zip') {
            return res.send({
                status: false,
                message: 'File harus zip!',
                data: []
            })
        }
        console.log(req.files);
        let zipFile = req.files.IMAGES_ZIP;
        let filename = zipFile.name;
        let filePath = assetsDirectory + '/' + filename;
        async.auto({
            moveZipToAssets: function(callback) {           
                zipFile.mv(filePath, async function( err ) {
                    if (err) {
                        console.log(err);
                        callback(internalServerError, null);
                        return;
                    }
                    callback(null, filePath);
                });
            },
            extractZip: ['moveZipToAssets', function(result, callback) {
                const zip = new StreamZip({
                    file: result.moveZipToAssets,
                    storeEntries: true
                });
                zip.on('ready', () => {
                    var dir = _directory_base + '/assets/temporary-image';
                    if (!fs.existsSync(dir)){
                        fs.mkdirSync(dir);
                    }
                    zip.extract(null, dir, (err, count) => {
                        if (err) {
                            console.log(err);
                            callback(internalServerError, null);
                            return;
                        }
                        console.log(`Extracted ${count} entries`);
                        zip.close();
                        callback(null, 'Success');
                    });
                });
                zip.on('error', err => {
                    console.log(err);
                    callback(internalServerError, null);
                    return;
                });
            }],
            readAllImagesTempFolder: ['extractZip', function(result, callback) {
                let dir = _directory_base + '/assets/temporary-image';
                glob(dir + '/**/*.jpg', (err, res) => {
                    if (err) {
                        console.log(err);
                        callback(internalServerError, null);
                        return;
                    }
                    callback(null, res);
                });
            }],
            moveAllImagesFromTempFolder: ['readAllImagesTempFolder', function(result, callback) {
                let listOfImages = result.readAllImagesTempFolder;
                let listOfFolderName = [new RegExp('/temporary-image/Photo/Ebcc/Janjang'), new RegExp('/temporary-image/Photo/Ebcc/Selfie'), new RegExp('/temporary-image/Photo/Inspeksi/Baris'), new RegExp('/temporary-image/Photo/Inspeksi/Selfie'), new RegExp('/temporary-image/Photo/Temuan')];

                let replaceName = ['/images/images-ebcc/', '/images/images-ebcc/', '/images/images-inspeksi/', '/images/images-inspeksi/', '/images/images-finding/']
                let dateNow = parseInt( Helper.date_format( 'now', 'YYYYMMDDhhmmss' ) );
                let dateSubstring = dateNow.toString().substring( 0, 8 );
                for(let i = 0; i < listOfImages.length; i++) {
                    for(let j = 0; j < listOfFolderName.length; j++) {
                        if(listOfImages[i].match(listOfFolderName[j])) {
                            let oldPath = listOfImages[i];
                            let newPath = oldPath.replace(listOfFolderName[j], replaceName[j] + dateSubstring);
                            mv(oldPath, newPath, {mkdirp: true, clobber: false }, function(err) {
                                // done. it first created all the necessary directories, and then
                                // tried fs.rename, then falls back to using ncp to copy the dir
                                // to dest and then rimraf to remove the source dir
                                if (err) {
                                    if(err.code === 'EEXIST') {
                                        console.log("File exists");
                                    }
                                    else {
                                        console.log(err);
                                        // callback(internalServerError, null);
                                        return;
                                    }
                                }
                                console.log('File moved');
                            });
                            break;
                        }
                    }
                }

                callback(null, 'Success');
            }],
        }, function(err, results) {
            if (err) {
                return res.status(err.errorCode).send({
                    status: false,
                    message: err.message,
                    data: []
                })
            }
            let dir = _directory_base + '/assets/temporary-image';
            rimraf(dir, function () { 
                console.log("temp folder deleted");
            });
            return res.status(200).send({
                status: true,
                message: 'success',
                data: []
            })
        })
        
    }