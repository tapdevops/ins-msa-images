/*
|--------------------------------------------------------------------------
| Module Exports
|--------------------------------------------------------------------------
*/
	module.exports = {
		production: {
			url: 'mongodb://dbapp:dbapp123@dbapp.tap-agri.com:27017/s_images?authSource=admin',
			ssl: false
		},
		development: {
			url: 'mongodb://s_images:s_images@dbappdev.tap-agri.com:4848/s_images?authSource=s_images',
			ssl: false
		}
	}


	