module.exports = {

	/*
	|--------------------------------------------------------------------------
	| App Config
	|--------------------------------------------------------------------------
	*/
	app_port: process.env.PORT || 3012,
	app_name: 'Microservice Image (03-01-2019 17:14)s',

	/*
	|--------------------------------------------------------------------------
	| Token
	|--------------------------------------------------------------------------
	*/
	secret_key: 'T4pagri123#',
	token_expiration: 7, // Days
	token_algorithm: 'HS256',

	/*
	|--------------------------------------------------------------------------
	| URL
	|--------------------------------------------------------------------------
	*/
	url: {},
	
	/*
	|--------------------------------------------------------------------------
	| Error Message
	|--------------------------------------------------------------------------
	*/
	error_message: {
		invalid_token: 'Token expired! ',
		invalid_input: 'Invalid input! ',
		create_200: 'Success! ',
		create_403: 'Forbidden ',
		create_404: 'Error! Data gagal diproses ',
		create_500: 'Error! Terjadi kesalahan dalam pembuatan data ',
		find_200: 'Success! ',
		find_403: 'Forbidden ',
		find_404: 'Error! Tidak ada data yang ditemukan ',
		find_500: 'Error! Terjadi kesalahan dalam penampilan data ',
		put_200: 'Success! ',
		put_403: 'Forbidden ',
		put_404: 'Error! Data gagal diupdate ',
		put_500: 'Error! Terjadi kesalahan dalam perubahan data ',
		delete_200: 'Success! ',
		delete_403: 'Forbidden ',
		delete_404: 'Error! Data gagal dihapus ',
		delete_500: 'Error! Terjadi kesalahan dalam penghapusan data ',
		upload_200: 'Success! ',
		upload_403: 'Forbidden ',
		upload_404: 'Error! Data gagal diupload ',
		upload_406: 'Error! Data yang diupload harus IMAGE/JPG atau IMAGE/JPEG ',
		upload_500: 'Error! Terjadi kesalahan dalam upload data ',

	}

}