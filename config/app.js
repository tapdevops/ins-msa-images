/*
|--------------------------------------------------------------------------
| Module Exports
|--------------------------------------------------------------------------
*/
	module.exports = {

		/*
		|--------------------------------------------------------------------------
		| App Config
		|--------------------------------------------------------------------------
		*/
			name: 'Microservice Images',
			env: 'dev', // prod, qa, dev,
			port: {
				dev: process.env.PORT || 4012,
				qa: process.env.PORT || 5012,
				prod: process.env.PORT || 3012,
			},
		/*
		|--------------------------------------------------------------------------
		| Path
		|--------------------------------------------------------------------------
		| Config tambahan untuk mengatur jika ada path yang tidak sesuai dengan
		| parameter URL.
		*/
			path_production: 'mobileinspection/ins-msa-images',
			path_development: '',
			path_images: {
				production: 'images',
				qa: 'images',
				development: 'images-dev'
			},

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
		| Error Message
		|--------------------------------------------------------------------------
		*/
			error_message: {
				invalid_token: 'Token expired! ',
				invalid_request: 'Invalid Request! ',
				create_200: 'Success! ',
				create_403: 'Forbidden ',
				create_404: 'Error! Data gagal diproses. ',
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
			}
	}
