const moment = require( 'moment-timezone' );
module.exports.convert = function ( value, format ) { 
	var result = '';

	value = value.replace( /-/g, "" );
	value = value.replace( /:/g, "" );
	value = value.replace( / /g, "" );

	if ( value == 'now' ) {
		value = moment( new Date() ).format( "YYYYMMDDhhmmss" );
	}

	switch ( format ) {
		case 'YYYYMMDD':
			result = value.substr( 0, 4 ) + value.substr( 4, 2 ) + value.substr( 6, 2 );
			result = value;
		break;
		case 'YYYY-MM-DD':
			result = value.substr( 0, 4 ) + '-' + value.substr( 4, 2 ) + '-' + value.substr( 6, 2 );
		break;
		case 'YYYYMMDDhhmmss':
			result = value.substr( 0, 4 ) + value.substr( 4, 2 ) + value.substr( 6, 2 ) + value.substr( 8, 2 ) + value.substr( 10, 2 ) + value.substr( 12, 2 );
		break;
		case 'YYYY-MM-DD hh-mm-ss':
			result = value.substr( 0, 4 ) + '-' + value.substr( 4, 2 ) + '-' + value.substr( 6, 2 ) + ' ' + value.substr( 8, 2 ) + ':' + value.substr( 10, 2 ) + ':' + value.substr( 12, 2 );
		break;
	}

	return result;
};