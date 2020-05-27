/*
 |--------------------------------------------------------------------------
 | Variable
 |--------------------------------------------------------------------------
 */
const Mongoose = require('mongoose');

/*
 |--------------------------------------------------------------------------
 | Schema
 |--------------------------------------------------------------------------
 */
const DonorDarahSchema = Mongoose.Schema({
	IMAGE_CODE: String,
	IMAGE_NAME: String,
	IMAGE_PATH: String,
	MIME_TYPE: String,
	INSERT_USER: String,
	INSERT_TIME: {
		type: Number,
		get: v => Math.floor(v),
		set: v => Math.floor(v),
		alias: 'i',
		default: function () {
			return 0;
		}
	}
});

/*
 |--------------------------------------------------------------------------
 | Module Exports
 |--------------------------------------------------------------------------
 */
module.exports = Mongoose.model('DonorDarah_v_2_0', DonorDarahSchema, 'TR_IMAGE_DONOR_DARAH');