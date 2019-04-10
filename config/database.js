/*
|--------------------------------------------------------------------------
| Module Exports
|--------------------------------------------------------------------------
*/
	module.exports = {
		production: {
			url: 'mongodb://s_images:1m4g3s2019@dbapp.tap-agri.com:4848/s_images?authSource=s_images',
			ssl: false
		},
		development: {
			url: 'mongodb://s_images:s_images@dbappdev.tap-agri.com:4848/s_images?authSource=s_images',
			ssl: false
		}
	}