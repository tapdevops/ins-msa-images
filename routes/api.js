/*
 |--------------------------------------------------------------------------
 | Setup
 |--------------------------------------------------------------------------
 */
// Node Modules
const RoutesVersioning = require('express-routes-versioning')();

// Controllers

const Controllers = {
	v_2_1: {
		Image: require(_directory_base + '/app/v2.1/Http/Controllers/ImageController.js'),
	},
	v_2_0: {
		UploadWeb: require(_directory_base + '/app/v2.0/Http/Controllers/UploadWebController.js'),
		Image: require(_directory_base + '/app/v2.0/Http/Controllers/ImageController.js'),
		ImageProfile: require(_directory_base + '/app/v2.0/Http/Controllers/ImageProfileController.js'),
	},
	v_1_2: {
		Image: require(_directory_base + '/app/v1.2/Http/Controllers/ImageController.js'),
	},
	v_1_1: {
		Image: require(_directory_base + '/app/v1.1/Http/Controllers/ImageController.js'),
	},
	v_1_0: {
		Image: require(_directory_base + '/app/v1.0/Http/Controllers/ImageController.js'),
	}
}

// Middleware
const Middleware = {
	v_2_0: {
		VerifyToken: require(_directory_base + '/app/v2.0/Http/Middleware/VerifyToken.js')
	},
	v_1_2: {
		VerifyToken: require(_directory_base + '/app/v1.2/Http/Middleware/VerifyToken.js')
	},
	v_1_1: {
		VerifyToken: require(_directory_base + '/app/v1.1/Http/Middleware/VerifyToken.js')
	},
	v_1_0: {
		VerifyToken: require(_directory_base + '/app/v1.0/Http/Middleware/VerifyToken.js')
	}
}

/*
 |--------------------------------------------------------------------------
 | Routing
 |--------------------------------------------------------------------------
 */
module.exports = (app) => {

	/*
	 |--------------------------------------------------------------------------
	 | Welcome Message
	 |--------------------------------------------------------------------------
	 */
	app.get('/', (req, res) => {
		res.json({
			application: {
				name: config.app.name,
				env: config.app.env,
				port: config.app.port[config.app.env]

			}
		})
	});


	/*
	 |--------------------------------------------------------------------------
	 | API Versi 2.1
	 |--------------------------------------------------------------------------
	 */
	// Upload Image Transaksi dengan kafka
	app.post('/api/v2.1/upload/image/foto-transaksi', Middleware.v_2_0.VerifyToken, Controllers.v_2_1.Image.create_file);
	/*
	 |--------------------------------------------------------------------------
	 | API Versi 2.0
	 |--------------------------------------------------------------------------
	 */
	//Upload image transaksi via WEB
	app.post('/api/v2.0/web/upload/foto-transaksi', /*Middleware.v_2_0.VerifyToken,*/ Controllers.v_2_0.UploadWeb.uploadImage);

	// Upload Image Transaksi dari node rest client msa auth
	app.post('/api/v2.0/auth/upload/image/foto-transaksi', Middleware.v_2_0.VerifyToken, Controllers.v_2_0.Image.create);

	// Upload Image Transaksi
	app.post('/api/v2.0/upload/image/foto-transaksi', Middleware.v_2_0.VerifyToken, Controllers.v_2_0.Image.create_file);

	// Get Foto Profile
	app.post('/api/v2.0/foto-profile', Middleware.v_2_0.VerifyToken, Controllers.v_2_0.ImageProfile.find_one_file_foto_profile);
	
	// Get Foto Profile untuk MSA-INTERNAL-TAP
	// app.post('/api/v2.0/internal/foto-profile/users', Middleware.v_2_0.VerifyToken, Controllers.v_2_0.ImageProfile.findListFotoProfile);

	//Get Image
	app.get('/api/v2.0/foto-transaksi/:tr_code', Controllers.v_2_0.Image.find_image);

	// Upload Image Foto Profile
	app.post('/api/v2.0/upload/image/foto-profile', Middleware.v_2_0.VerifyToken, Controllers.v_2_0.ImageProfile.create_file_foto_profile);

	// Sync Mobile Images
	app.post('/api/v2.0/sync-mobile/images', Middleware.v_2_0.VerifyToken, Controllers.v_2_0.Image.sync_mobile);

	// Get Images By TR_CODE
	app.get('/api/v2.0/images/:id', Middleware.v_2_0.VerifyToken, Controllers.v_2_0.Image.find);

	//Get Random Image
	app.post('/api/v2.0/inspection/suggestion', Controllers.v_2_0.Image.find_random);

	/*
	 |--------------------------------------------------------------------------
	 | API Versi 1.2
	 |--------------------------------------------------------------------------
	 */
	// Upload Image Transaksi dari node rest client msa auth
	app.post('/api/v1.2/auth/upload/image/foto-transaksi', Middleware.v_1_2.VerifyToken, Controllers.v_1_2.Image.create);

	// Upload Image Transaksi
	app.post('/api/v1.2/upload/image/foto-transaksi', Middleware.v_1_2.VerifyToken, Controllers.v_1_2.Image.create_file);

	// Get Foto Profile
	app.post('/api/v1.2/foto-profile', Middleware.v_1_2.VerifyToken, Controllers.v_1_2.Image.find_one_file_foto_profile);

	//Get Image
	app.get('/api/v1.2/foto-transaksi/:tr_code', Controllers.v_1_2.Image.find_image);

	// Upload Image Foto Profile
	app.post('/api/v1.2/upload/image/foto-profile', Middleware.v_1_2.VerifyToken, Controllers.v_1_2.Image.create_file_foto_profile);

	// Sync Mobile Images
	app.post('/api/v1.2/sync-mobile/images', Middleware.v_1_2.VerifyToken, Controllers.v_1_2.Image.sync_mobile);

	// Get Images By TR_CODE
	app.get('/api/v1.2/images/:id', Middleware.v_1_2.VerifyToken, Controllers.v_1_2.Image.find);

	//Get Random Image
	app.post('/api/v1.2/inspection/suggestion', Controllers.v_1_2.Image.find_random);
	/*
	

	/*
	 |--------------------------------------------------------------------------
	 | API Versi 1.1
	 |--------------------------------------------------------------------------
	 */
	// Upload Image Transaksi dari node rest client msa auth
	app.post('/api/v1.1/auth/upload/image/foto-transaksi', Middleware.v_1_1.VerifyToken, Controllers.v_1_1.Image.create);

	// Upload Image Transaksi
	app.post('/api/v1.1/upload/image/foto-transaksi', Middleware.v_1_1.VerifyToken, Controllers.v_1_1.Image.create_file);

	// Get Foto Profile
	app.post('/api/v1.1/foto-profile', Middleware.v_1_1.VerifyToken, Controllers.v_1_1.Image.find_one_file_foto_profile);

	//Get Image
	app.get('/api/v1.1/foto-transaksi/:tr_code', Controllers.v_1_1.Image.find_image);

	// Upload Image Foto Profile
	app.post('/api/v1.1/upload/image/foto-profile', Middleware.v_1_1.VerifyToken, Controllers.v_1_1.Image.create_file_foto_profile);

	// Sync Mobile Images
	app.post('/api/v1.1/sync-mobile/images', Middleware.v_1_1.VerifyToken, Controllers.v_1_1.Image.sync_mobile);

	// Get Images By TR_CODE
	app.get('/api/v1.1/images/:id', Middleware.v_1_1.VerifyToken, Controllers.v_1_1.Image.find);

	//Get Random Image
	app.post('/api/v1.1/inspection/suggestion', Controllers.v_1_1.Image.find_random);
	/*
	 |--------------------------------------------------------------------------
	 | API Versi 1.0
	 |--------------------------------------------------------------------------
	 */
	// Upload Image Transaksi
	app.post('/api/v1.0/upload/image/foto-transaksi', Middleware.v_1_0.VerifyToken, Controllers.v_1_0.Image.create_file);

	// Get Foto Profile
	app.get('/api/v1.0/foto-profile', Middleware.v_1_0.VerifyToken, Controllers.v_1_0.Image.find_one_file_foto_profile);

	// Upload Image Foto Profile
	app.get('/api/v1.0/upload/image/foto-profile', Middleware.v_1_0.VerifyToken, Controllers.v_1_0.Image.find_one_file_foto_profile);
	app.post('/api/v1.0/upload/image/foto-profile', Middleware.v_1_0.VerifyToken, Controllers.v_1_0.Image.create_file_foto_profile);

	// Sync Mobile Images
	app.post('/api/v1.0/sync-mobile/images', Middleware.v_1_0.VerifyToken, Controllers.v_1_0.Image.sync_mobile);

	// Get Images By TR_CODE
	app.get('/api/v1.0/images/:id', Middleware.v_1_0.VerifyToken, Controllers.v_1_0.Image.find);
	/*
	 |--------------------------------------------------------------------------
	 | Old API
	 |--------------------------------------------------------------------------
	 */
	app.post('/sync-mobile/images/', Middleware.v_1_0.VerifyToken, Controllers.v_1_0.Image.sync_mobile);
	app.get('/images/:id', Middleware.v_1_0.VerifyToken, Controllers.v_1_0.Image.find);
	app.post('/image/upload-file', Middleware.v_1_0.VerifyToken, Controllers.v_1_0.Image.create_file);
}
