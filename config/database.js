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
			url: 'mongodb://dbapp:dbapp123@dbappdev.tap-agri.com:27017/s_images?authSource=admin',
			ssl: false
		}
	}