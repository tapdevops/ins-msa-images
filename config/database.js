/*
|--------------------------------------------------------------------------
| Module Exports
|--------------------------------------------------------------------------
*/
	// module.exports = {
	// 	production: {
	// 		url: 'mongodb://dbapp:dbapp123@dbapp.tap-agri.com:27017/s_images?authSource=admin',
	// 		ssl: false
	// 	},
	// 	development: {
/*
 |--------------------------------------------------------------------------
 | Database Connections
 |--------------------------------------------------------------------------
 |
 | Here are each of the database connections setup for your application.
 | Of course, examples of configuring each database platform that is
 | supported by NodeJS is shown below to make development simple.
 |
 */
	module.exports = {
		dev: {
			url: 'mongodb://s_images:s_images@dbappdev.tap-agri.com:4848/s_images?authSource=s_images',
			ssl: false
		},
		qa: {
			url: 'mongodb://s_images:1m4g3s2019@dbappqa.tap-agri.com:4848/s_images?authSource=s_images',
			ssl: false
		},
		prod: {
			url: 'mongodb://s_images:1m4g3s2019@dbapp.tap-agri.com:4848/s_images?authSource=s_images',
			ssl: false
		}
	}
