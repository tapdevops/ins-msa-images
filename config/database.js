/*
|--------------------------------------------------------------------------
| App Setup
|--------------------------------------------------------------------------
|
| Untuk menghandle models, libraries, helper, node modules, dan lain-lain
|
*/
	const fServer = require( 'fs' );
	var set_db_config = [];
	var connection_name = 'msa_ins_images';
	var connection = {
		host: '',
		db_host: '',
		username: '',
		password: '',
		port: '',
		database: '',
		auth_source: '',
		ssl: false,
	}

	if ( fServer.existsSync( '/dbapp-ins.json' ) ) {
		var rawdata = fServer.readFileSync( '/dbapp-ins.json' );
		set_db_config.push( JSON.parse( rawdata ) );
	}

	if ( set_db_config.length > 0 ) {

		var config = set_db_config[0];
		var setup = config['setup'][connection_name];
		var data = config['connections'][setup];

		connection.host = data.host;
		connection.username = data.username;
		connection.password = data.password;
		connection.port = data.port;
		connection.database = data.database;
		connection.auth_source = data.auth_source;
		connection.ssl = data.ssl;
	}

/*
|--------------------------------------------------------------------------
| Module Exports
|--------------------------------------------------------------------------
*/
	module.exports = {
		//url: 'mongodb://user-db:tap123456me@clustertest-shard-00-01-iwwfu.gcp.mongodb.net:27017/s_images?authSource=admin',
		url: 'mongodb://dbapp:dbapp123@dbapp.tap-agri.com:27017/s_images?authSource=admin',
		ssl: false

		//url: 'mongodb://' + connection.username + ':' + connection.password + '@' + connection.host + ':' + connection.port + '/' + connection.database + '?authSource=' + connection.auth_source,
		//ssl: connection.ssl,
	}