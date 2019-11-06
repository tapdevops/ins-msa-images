const mongoose = require( 'mongoose' );

const UploadImageSchema = mongoose.Schema( {
	
	IMAGE_CODE: String,
	TR_CODE: String,
	IMAGE_NAME: String,
	IMAGE_PATH: String,
	IMAGE_PATH_LOCAL: String,
	STATUS_IMAGE: String,
	MIME_TYPE: String,
	STATUS_SYNC: String,
	SYNC_TIME: {
		type: Number,
		get: v => Math.floor( v ),
		set: v => Math.floor( v ),
		alias: 'i',
		default: function() {
			return 0;
		}
	},
	INSERT_USER: String,
	INSERT_TIME: {
		type: Number,
		get: v => Math.floor( v ),
		set: v => Math.floor( v ),
		alias: 'i',
		default: function() {
			return 0;
		}
	},
	UPDATE_USER: String,
	UPDATE_TIME: {
		type: Number,
		get: v => Math.floor( v ),
		set: v => Math.floor( v ),
		alias: 'i',
		default: function() {
			return 0;
		}
	},
	DELETE_USER: String,
	DELETE_TIME: {
		type: Number,
		get: v => Math.floor( v ),
		set: v => Math.floor( v ),
		alias: 'i',
		default: function() {
			return 0;
		}
	}

});

module.exports = mongoose.model( 'UploadImage_v_1_2', UploadImageSchema, 'TR_IMAGE' );