const {v4: uuidv4} = require('uuid');
const {pool} = require("./get_connection");

// create a group
const createGroup = (groupId, groupPublicKey,encryptionPubKey)=>{
    return new Promise((resolve, reject)=>{
        pool.query(
            'INSERT INTO groups(groupId, groupPublicKey,encryptionKey) VALUES (?, ?, ?)',
            [groupId, groupPublicKey,encryptionPubKey],
            (err, result)=>{
                if(err){
                    return reject(err);
                }
                return resolve(result);
            }
        );
    });
};
// check if a group exists
const groupExists = (groupId)=>{
    return new Promise((resolve, reject)=>{
        pool.query(
            'SELECT groupId FROM groups WHERE groupId = ?',
            [groupId],
            (err, result)=>{
                if(err){
                    return reject(err);
                }
                return resolve(result.length > 0);
            }
        );
    });
};
// check if a user is already in this group
const userInGroup = (userId, groupId)=>{
    return new Promise((resolve, reject)=>{
        pool.query(
            'SELECT userId FROM user_groups WHERE userId = ? AND groupId = ?',
            [userId, groupId],
            (err, result)=>{
                if(err){
                    return reject(err);
                }
                return resolve(result.length > 0);
            }
        );
    });
}
// get the group's public key
const getGroupPublicKey = (groupId) => {
    return new Promise((resolve, reject) => {
        console.log("start to get the group public key from groupId" + groupId);
        pool.query(
            'SELECT groupPublicKey FROM groups WHERE groupId = ?',
            [groupId],
            (err, result) => {
                if (err) {
                    console.error('Error fetching group public key:', err);
                    return reject(err);
                }
                if (result.length === 0) {
                    console.log(`No group found with groupId: ${groupId}`);
                    return resolve(null); 
                }
                console.log("get the group public key from groupId" + groupId);
                
                return resolve(result[0].groupPublicKey);
            }
        );
    });
};

// get the group's encryption key
const getGroupEncryptionKey = (groupId) => {
    return new Promise((resolve, reject) => {
        console.log("start to get the group encryption key from groupId" + groupId);
        pool.query(
            'SELECT encryptionKey FROM groups WHERE groupId = ?',
            [groupId],
            (err, result) => {
                if (err) {
                    console.error('Error fetching group encryption public key:', err);
                    return reject(err);
                }
                if (result.length === 0) {
                    console.log(`No group found with groupId: ${groupId}`);
                    return resolve(null); 
                }
                console.log("get the group encryption key from groupId" + groupId);
                
                return resolve(result[0].encryptionKey);
            }
        );
    });
}

// update the group's public key
const updateGroupPublicKey = (groupId, groupPublicKey)=>{
    return new Promise((resolve, reject)=>{
        pool.query(
            'UPDATE groups SET groupPublicKey = ? WHERE groupId = ?',
            [groupPublicKey, groupId],
            (err, result)=>{
                if(err){
                    return reject(err);
                }
                return resolve(result);
            }
        );
    });
};

// update the group's nonce
const updateGroupNonce = (groupId, groupNonce)=>{
    return new Promise((resolve, reject)=>{
        pool.query(
            'UPDATE groups SET groupNonce = ? WHERE groupId = ?',
            [groupNonce, groupId],
            (err, result)=>{
                if(err){
                    return reject(err);
                }
                return resolve(result);
            }
        );
    });
};
// get the group's nonce
const getGroupNonce = (groupId)=>{
    return new Promise((resolve, reject)=>{
        pool.query(
            'SELECT groupNonce FROM groups WHERE groupId = ?',
            [groupId],
            (err, result)=>{
                if(err){
                    return reject(err);
                }
                console.log(result[0].groupNonce);
                return resolve(result[0].groupNonce);
            }
        );
    });
};

// delete the group's nonce
const deleteGroupNonce = (groupId)=>{
    return new Promise((resolve, reject)=>{
        pool.query(
            'UPDATE groups SET groupNonce = NULL WHERE groupId = ?',
            [groupId],
            (err, result)=>{
                if(err){
                    return reject(err);
                }
                return resolve(result);
            }
        );
    });
};

// remove a group
const removeGroup = (groupId)=>{
    return new Promise((resolve, reject)=>{
        pool.query(
            'DELETE FROM groups WHERE groupId = ?',
            [groupId],
            (err, result)=>{
                if(err){
                    return reject(err);
                }
                return resolve(result);
            }
        );
    });
};

// remove a user from a group
const removeUserFromGroup = (userId, groupId)=>{
    return new Promise((resolve, reject)=>{
        pool.query(
            'DELETE FROM user_groups WHERE userId = ? AND groupId = ?',
            [userId, groupId],
            (err, result)=>{
                if(err){
                    return reject(err);
                }
                return resolve(result);
            }
        );
    });
};

// add a user to a group
const addUserToGroup = (userId, groupId)=>{
    return new Promise((resolve, reject)=>{
        pool.query(
            'INSERT INTO user_groups(userId, groupId) VALUES (?, ?)',
            [userId, groupId],
            (err, result)=>{
                if(err){
                    return reject(err);
                }
                return resolve(result);
            }
        );
    });
};

const storeMessage = (groupId, encryptedMessage) => {
    return new Promise((resolve, reject) => {
        // Generate a new UUID for the message
        const messageId = uuidv4();

        pool.query(
            'INSERT INTO messages(messageId, groupId, encryptedMessage) VALUES (?, ?, ?)',
            [messageId, groupId, encryptedMessage],
            (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            }
        );
    });
}

const getAllMessagesFromGroup = (groupId) => {
    return new Promise((resolve, reject) => {
        pool.query(
            'SELECT encryptedMessage FROM messages WHERE groupId = ?',
            [groupId],
            (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            }
        );
    })
}    


// export all the functions
module.exports = {
    createGroup,
    groupExists,
    getGroupPublicKey,
    updateGroupPublicKey,
    updateGroupNonce,
    getGroupNonce,
    deleteGroupNonce,
    removeGroup,
    removeUserFromGroup,
    addUserToGroup,
    storeMessage,
    getAllMessagesFromGroup,
    userInGroup,
    getGroupEncryptionKey,
};