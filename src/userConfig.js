let fs = require('fs')

class UserConfig {
    static setLogin(uid) {
        fs.writeFile('conf.txt', uid, 'utf8', (err) => {
            if (err) throw err;
        });
    }

    static checkLogin(callback) {
        fs.readFile('conf.txt','utf8', (err, data) => {
            if (err) throw err;
            callback(data)
        });
    }
    static logout(callback) {
        fs.writeFile('conf.txt','','utf8', (err, data) => {
            if (err) throw err;
            callback(data)
        });
    }
}

module.exports = UserConfig