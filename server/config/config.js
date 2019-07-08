//==============================
// Puerto
//==============================

process.env.PORT = process.env.PORT || 3000;

//==============================
// Entorno desarrollo o produccion
//==============================

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//==============================
// Vencimiento del token
//==============================
// 60 segundos
// 60 minutos
// 24 horas
// 30 dias
//60 * 60 * 24 * 30
process.env.CADUCIDAD_TOKEN = '48h';



//==============================
// Seed se autenticacion
//==============================
//heroku config
process.env.SEED = process.env.SEED || 'este-es-el-seed-de-desarrollo';

//==============================
// Base de datos
//==============================

//mi variable de entorno en heroku
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    //variable declarada antes en heroku
    //heroku config:set MONGO_URI="
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;

//==============================
// Google client ID
//==============================
process.env.CLIENT_ID = process.env.CLIENT_ID || '557040852021-68124chdkijh704n7tmkdfc0l0b64miq.apps.googleusercontent.com';