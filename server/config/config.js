//==============================
// Puerto
//==============================

process.env.PORT = process.env.PORT || 3000;

//==============================
// Puerto
//==============================

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = 'mongodb+srv://Richiexjos:y6dsE0uTkOTs45Im@cluster0-kwldk.mongodb.net/cafe';
}

process.env.URLDB = urlDB;