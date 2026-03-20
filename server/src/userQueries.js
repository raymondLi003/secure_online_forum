const {pool} = require("./get_connection");


// get the user's public key
const getPublicKey = (userId)=>{
    return new Promise((resolve, reject)=>{
        pool.query(
            'SELECT publicKey FROM users WHERE userId = ?',
            [userId],
            (err, result)=>{
                if(err){
                    return reject(err);
                }
                return resolve(result[0].publicKey);
            }
        );
    });
};

// get the user's nonce 
const getNonce = (userId)=>{
    return new Promise((resolve, reject)=>{
        pool.query(
            'SELECT nonce FROM users WHERE userId = ?',
            [userId],
            (err, result)=>{
                if(err){
                    return reject(err);
                }
                return resolve(result[0].nonce);
            }
        );
    });
};

// update the user's nonce
const updateNonce = (userId, nonce)=>{
    // clean up the user id to avoid injections
    userId = userId.replace(/[^a-zA-Z0-9]/g, '');
    return new Promise((resolve, reject)=>{
        pool.query(
            'UPDATE users SET nonce = ? WHERE userId = ?',
            [nonce, userId],
            (err, result)=>{
                if(err){
                    return reject(err);
                }
                return resolve(result);
            }
        );
    });
};

// delete the user's nonce
const deleteNonce = (userId)=>{
    return new Promise((resolve, reject)=>{
        pool.query(
            'UPDATE users SET nonce = NULL WHERE userId = ?',
            [userId],
            (err, result)=>{
                if(err){
                    return reject(err);
                }
                return resolve(result);
            }
        );
    });
};
// update the user's public key
const updatePublicKey = (userId, publicKey)=>{
    return new Promise((resolve, reject)=>{
        pool.query(
            'UPDATE users SET publicKey = ? WHERE userId = ?',
            [publicKey, userId],
            (err, result)=>{
                if(err){
                    return reject(err);
                }
                return resolve(result);
            }
        );
    });
};
// update the refresh token
const updateRefreshToken = (userId, refreshToken)=>{
    return new Promise((resolve, reject)=>{
        pool.query(
            'UPDATE users SET refreshToken = ? WHERE userId = ?',
            [refreshToken, userId],
            (err, result)=>{
                if(err){
                    return reject(err);
                }
                return resolve(result);
            }
        );
    });
};
// create a new user
const createUser = (userId,publicKey)=>{
    return new Promise((resolve, reject)=>{
        pool.query(
            'INSERT INTO users (userId, publicKey) VALUES (?, ?)',
            [userId, publicKey],
            (err, result)=>{
                if(err){
                    return reject(err);
                }
                return resolve(result);
            }
        );
    });
};

// check if user exists
const userExists = (userId)=>{
    return new Promise((resolve, reject)=>{
        pool.query(
            'SELECT userId FROM users WHERE userId = ?',
            [userId],
            (err, result)=>{
                if(err){
                    return reject(err);
                }
                return resolve(result.length > 0);
            }
        );
    });
};
// check if the user has the selected refresh token
const checkRefreshToken = (userId, refreshToken)=>{
    return new Promise((resolve, reject)=>{
        pool.query(
            'SELECT refreshToken FROM users WHERE userId = ?',
            [userId],
            (err, result)=>{
                if(err){
                    return reject(err);
                }
                return resolve(result[0].refreshToken === refreshToken);
            }
        );
    });
};

const deleteRefreshToken = (userId)=>{
    return new Promise((resolve, reject)=>{
        pool.query(
            'UPDATE users SET refreshToken = NULL WHERE userId = ?',
            [userId],
            (err, result)=>{
                if(err){
                    return reject(err);
                }
                return resolve(result);
            }
        );
    });

}




module.exports = {getPublicKey, getNonce, updateNonce, updatePublicKey, createUser, userExists, deleteNonce, updateRefreshToken, checkRefreshToken,deleteRefreshToken};