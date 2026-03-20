require('dotenv').config({path : 'src/.env'});
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const fs = require('fs');
const https = require('https');
const {createVerify} = require('crypto');
const cors = require('cors');
const server = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
server.use(cookieParser());

const {
    getPublicKey,
    getNonce,
    updateNonce,
    updatePublicKey,
    createUser,
    userExists, 
    deleteNonce,
    updateRefreshToken,
    checkRefreshToken,
    deleteRefreshToken,
} = require('./userQueries.js');
// import from groupQueries.js
const {
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
    getAllMessagesFromGroup,
    storeMessage,
    userInGroup,
    getGroupEncryptionKey,
} = require('./groupQueries.js');
const {
    createAccessToken,
    createRefreshToken,
    sendAccessToken,
    sendRefreshToken,
    formatPublicKey,
    verifyRefreshToken,
    verifySignedNonce,
} = require('./token.js');
const port = process.env.PORT || 3000;
const path = require('path');
const { get } = require('http');
server.use(express.static('frontend\src\App.js'));
// support json encoded bodies
server.use(express.json());
// support url encoded bodies
server.use(express.urlencoded({extended:true}));

server.use(
    cors({
        origin: `https://localhost:3001`,
        credentials: true,
    })
);

// read the ssl files
const serverPrivateKey = fs.readFileSync('./src/certs/server-key.pem', 'utf8');
const serverCertificate = fs.readFileSync('./src/certs/server-cert.pem', 'utf8');
const caCertificate = fs.readFileSync('./src/certs/ca.pem', 'utf8');

// set up the ssl credentials
const credentials = {
    key: serverPrivateKey,
    cert: serverCertificate,
    ca: caCertificate
};

// create the https server
const httpsServer = https.createServer(credentials, server);



function genNonce(){
    return crypto.randomBytes(16).toString('hex');
}

// create a user object
const users = {};
// register the user
server.post('/registerUser', async(req,res)=>{
    try{
        console.log('start the register page server');
        const{userId,publicKey} = req.body
        // Check if the user already exists
        const exists = await userExists(userId);
        if (exists) {
            return res.status(409).send('User already exist');
        }
        // Create a new user
        await createUser(userId, publicKey);
        res.status(200).send('Registration successful');
        
    }catch(err){
        console.error(err);
        res.status(500).send('Registeration failure');
}
});

server.post('/getUserNonce', async(req,res)=>{
    const{userId} = req.body;
    console.log('start the get nonce server');
    console.log(userId);
    // Check if user exists
    const userValid = await userExists(userId);
    if (!userValid) {
        return res.status(401).send('User does not exist');
    }

    const nonce = genNonce();
    // Update the nonce for the user
    await updateNonce(userId, nonce);
    res.status(200).send({ nonce: nonce });
}
);


server.post('/login', async(req,res)=>{
    // get the user id and user's signed nonce 
    const{userId, signedNonce} = req.body;
    // Check if the user exists
    const exists = await userExists(userId);
    if (!exists) {
        return res.status(404).send('User does not exist');
    }
    const publicKeyArmored = await getPublicKey(userId);
    const nonce = await getNonce(userId);
    if(publicKeyArmored == null || nonce == null){
        return res.status(401).send('No public key or no nonce stored for this user');
    }

    const formattedPublicKey = formatPublicKey(publicKeyArmored);
    
    
    
    try{
        // verify the nonce signed by user's private key with the user's public key
        // the user's public key is stored on the server
        const verifer = createVerify('RSA-SHA256');
        verifer.update(nonce);
        verifer.end();
        const isVerified = verifer.verify(formattedPublicKey, signedNonce, 'base64');
        
        if(isVerified){
            // generate the sign in token for the user once their nonce is verified
            const accessToken = createAccessToken(userId);
            const refreshToken = createRefreshToken(userId);
            
            // delete the nonce after the verification is accepted
            await deleteNonce(userId);
            console.log("deleted the nonce");
            // send back the access token
            
            await updateRefreshToken(userId, refreshToken);
                // Send back both the access token and set the refresh token in a cookie
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                path: '/',
            });

            res.send({
                accessToken: accessToken,
                userId: userId,
            });
            console.log("sent the refresh token");            
        }else{
            res.status(401).send('Verification failed');
        }
    }catch(err){
        console.error(err);
        res.status(401).send('Authentiation process failed');
    }

    
});

server.post('/logout', (req,res)=>{
    const userId = req.body.userId;
    // delete the refresh token
    try{
        deleteRefreshToken(userId);
    }catch(err){
        console.error(err);
        res.status(401).send('Logout failed');
    }
    res.clearCookie('refreshToken', {path: '/'});
    res.clearCookie('refreshToken', {path: '/Groups'});

    return res.send({accessToken:''});
})


server.post('/refreshToken', async (req,res)=>{

    // get the current refresh token from the cookies
    const ref_token = req.cookies.refreshToken;

    // check if the token exists
    if(!ref_token) return res.send({accessToken: ''});
    // verify the token
    let payload = null;
    console.log("check the refresh token")
    try{
        payload = jwt.verify(ref_token, process.env.REFRESH_TOKEN_SECRET);

    }catch (err) {
        console.error('Error in token verification:', err);

        // Check if the error is due to token expiration
        if (err.name === 'TokenExpiredError') {
            return res.status(401).send({ message: 'Token expired' });
        } else {
            return res.status(401).send({ message: 'Invalid token' });
        }
    }
    // check if the user exist for the refresh token
    const userId = payload.userId;
    const exists = await userExists(userId);

    if(!exists){
        console.log("user does not exist for this refresh token")
        return res.status(404).send({accessToken: ''});
    }else{
        // check if the user has the refresh token
        const tokenExistForUser = await checkRefreshToken(userId, ref_token);
        if(!tokenExistForUser){
            console.log("user does not have a refresh token");
            return res.status(404).send({accessToken: ''});
        }
    }
    
    // create new refresh and access token
    const accessToken = createAccessToken(userId);
    const refreshToken = createRefreshToken(userId);
    // update the refresh token
    await updateRefreshToken(userId, refreshToken);
    sendRefreshToken(res,refreshToken);
    res.send({
        userId: userId,
        loggedIn : true,
        accessToken : accessToken
    })
    
    

})
// create a group 
server.post('/createGroup', async(req,res)=>{
    try{
        console.log('start creating the group');
        const{groupId,groupPublicKey, encryptionPubKey} = req.body
        // Check if the group already exists
        const exists = await groupExists(groupId);
        if (exists) {
            return res.status(409).send('Group already exist');
        }
        // Create a new group
        await createGroup(groupId, groupPublicKey, encryptionPubKey);
        console.log("encryption key:" + encryptionPubKey);
        res.status(200).send('Group creation successful');
        
    }catch(err){
        console.error(err);
        res.status(500).send('Group creation failure');
}
});

// add a user to a group but check if the user has the refresh token first
server.post('/addUserToGroup',async(req,res)=>{
    try{

        console.log('start adding user to the group');
        const userId = req.body.userId;
        const groupId = req.body.groupId;   
        const signedNonce = req.body.signedNonce;
        console.log("userid : " + userId);
        // Check if the user exists
        try{
            const existUser = await userExists(userId);
            if (!existUser) {
                console.log("user does not exist");
                return res.status(404).send('User does not exist');
            }
        }catch(err){
            console.log(err);
            return res.status(404).send('failure in checking user existence');
        }

        console.log("groupid : " + groupId);

        const publicKeyArmored = await getGroupPublicKey(groupId);
        // check if the public key is undefined
        if(publicKeyArmored == null){
            return res.status(404).send('Group does not exist');
        }
        // verify the nonce signed by the group private key with the group's public key
        const formattedPublicKey = formatPublicKey(publicKeyArmored);
        const verifer = createVerify('RSA-SHA256');
        const nonce = await getGroupNonce(groupId);
        console.log("nonce : " + nonce);
        verifer.update(nonce);
        verifer.end();
        const isVerified = verifer.verify(formattedPublicKey, signedNonce, 'base64');
        console.log(isVerified);
        if(!isVerified){
            console.log("verification failed")
            return res.status(401).send('Verification failed');
        }else{
            console.log("verification successful");
            await deleteGroupNonce(groupId);

            // check if the user is already in the designated group
            const aleadyBelong = await userInGroup(userId, groupId);
            if(aleadyBelong){
                return res.status(200).send('User already in the group');
            }
            // add the user to the group
            await addUserToGroup(userId, groupId);
            res.status(200).send('User added to group');
        }
        
        
        
    }catch(err){
        console.error(err);
        res.status(500).send('add user to the group failure');
}
});



// get the group's nonce if it does not exist, generate one
server.post('/generateGroupNonce', async(req,res)=>{
    const{groupId} = req.body;
    console.log('start the get nonce server');
    console.log(groupId);
    // Check if group exists
    const groupValid = await groupExists(groupId);
    if (!groupValid) {
        return res.status(401).send('Group does not exist');
    }

    const nonce = genNonce();
    // Update the nonce for the group
    await updateGroupNonce(groupId, nonce);
    res.status(200).send({ nonce: nonce });
});
// remove a user from a group
server.post('/removeGroupUser', async(req,res)=>{
    try{
        console.log('start removing user from this group');
        const userId = req.body.userId;
        const groupId = req.body.groupId;
        // Check if the group already exists
        const exists = await groupExists(groupId);
        if (!exists) {
            return res.status(409).send('Group does not exist');
        }
        // remove the user from the group
        await removeUserFromGroup(userId, groupId);
        res.status(200).send('User removed from group');
        
    }catch(err){
        console.error(err);
        res.status(500).send('remove user from group failure');
}
});


server.post('/storeEncryptedMessage', async(req,res)=>{
    try{
        console.log('start storing the encrypted message');
        const groupId = req.body.groupId;
        const encryptedMessage = req.body.encryptedMessage;
        if(encryptedMessage == null){
            return res.status(409).send('No encrypted message');
        }
        // Check if the group exists
        const exists = await groupExists(groupId);
        if (!exists) {
            return res.status(409).send('Group does not exist');
        }
        // store the encrypted message
        await storeMessage(groupId, encryptedMessage);
        res.status(200).send('Encrypted message stored');
        
    }catch(err){
        console.error(err);
        res.status(500).send('Encrypted message storage failure');
}
    
});

server.get('/getEncryptedMessage/:groupId', async(req,res)=>{
    try{
        console.log('start getting the encrypted message');
        const {groupId} = req.params;
        // Check if the group exists
        const exists = await groupExists(groupId);
        if (!exists) {
            return res.status(409).send('Group does not exist');
        }
        // get the encrypted message
        const encryptedMessage = await getAllMessagesFromGroup(groupId);
        res.status(200).json({messages: encryptedMessage});
    }catch(err){
        console.error(err);
        res.status(500).send('Encrypted message retrieval failure');
}
    
});

server.post('/getGroupPublicKey', async(req,res)=>{
    try{

        console.log('start getting the group public key');
        const groupId = req.body.groupId;
        // Check if the group exists
        const exists = await groupExists(groupId);
        if (!exists) {
            return res.status(409).send('Group does not exist');
        }
        // get the group public key
        const groupPublicKey = await getGroupPublicKey(groupId);
        console.log("group public key : " + groupPublicKey);
        res.status(200).send({groupPublicKey: groupPublicKey});
        
    }catch(err){
        console.error(err);
        res.status(500).send('Group public key retrieval failure');
}
    
});

server.post('/getGroupEncryptionKey', async(req,res)=>{
    try{

        console.log('start getting the group encryption key');
        const groupId = req.body.groupId;
        // Check if the group exists
        const exists = await groupExists(groupId);
        if (!exists) {
            return res.status(409).send('Group does not exist');
        }
        // get the group encryption key
        const groupEncryptionKey = await getGroupEncryptionKey(groupId);
        console.log("group encryption key : " + groupEncryptionKey);
        res.status(200).send({groupEncryptionKey: groupEncryptionKey});
        
    }catch(err){
        console.error(err);
        res.status(500).send('Group encryption key retrieval failure');
}
    
});

// Start the Express server
httpsServer.listen(port, () => {
    console.log(`HTTPS Server listening at https://localhost:${port}`);
});