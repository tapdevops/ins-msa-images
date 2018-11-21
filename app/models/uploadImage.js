const mongoose = require( 'mongoose' );

const UploadImageSchema = mongoose.Schema( {
	IMAGE_CODE: String,
	TR_CODE: String,
	IMAGE_NAME: String,
	IMAGE_PATH: String,
	STATUS_IMAGE: String,
	STATUS_SYNC: String,
	SYNC_TIME: {
		type: Date,
		default: function() {
			return null;
		}
	},
	INSERT_USER: String,
	INSERT_TIME: {
		type: Date,
		default: function() {
			return null;
		}
	},
	UPDATE_USER: String,
	UPDATE_TIME: {
		type: Date,
		default: function() {
			return null;
		}
	},
	DELETE_USER: String,
	DELETE_TIME: {
		type: Date,
		default: function() {
			return null;
		}
	}
});

module.exports = mongoose.model( 'UploadImage', UploadImageSchema, 'TR_IMAGE' );