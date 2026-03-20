const jwt = require('jsonwebtoken');
require('dotenv').config({path : 'src/.env'});
const {createVerify} = require('crypto');
const { deleteGroupNonce } = require('./groupQueries');
const createAccessToken = userId =>{
    return jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET,{
        expiresIn: '1h',
        
    });
};

const createRefreshToken = userId => {
    return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: '2h',
      
      
    });
};

const sendAccessToken = (res,req,accessToken) => {
    res.send(
        {
            accessToken: accessToken,
            userId: req.body.userId,
        }
    )
};

const sendRefreshToken = (res, refreshToken) =>{
    res.cookie('refreshToken', refreshToken,
        {
            httpOnly: true,
            path: '/refreshToken',
            sameSite: 'lax',
        }
    );
};

const verifyRefreshToken = (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) return res.status(401).send('No token provided');

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).send('Invalid token');

        req.user = user;
        next();
    });
};

// format the public key to be in the correct format for the openpgp.readkey function
function formatPublicKey(publicKey) {
    const header = "-----BEGIN PUBLIC KEY-----\n";
    const footer = "\n-----END PUBLIC KEY-----";
    let base64KeyBody = publicKey.replace(header, '').replace(footer, '').replace(/(\r\n|\n|\r)/gm, ""); // Remove existing line breaks and headers

    let formattedKey = header;
    while (base64KeyBody.length > 0) {
        // Add a newline character after every 64 characters, but not at the end of the key
        let line = base64KeyBody.substring(0, 64);
        base64KeyBody = base64KeyBody.substring(64);
        formattedKey += line;
        if (base64KeyBody.length > 0) {
            formattedKey += "\n";
        }
    }
    formattedKey += footer;

    return formattedKey;
}

const verifySignedNonce = ( nonce, signedNonce, publicKey) => {
    //console.log(signedNonce);
    //console.log(publicKey);
    const formattedPublicKey = formatPublicKey(publicKey);
    let isVerified = false;
    //console.log(formattedPublicKey);
    const verifer = createVerify('RSA-SHA256');
        verifer.update(nonce);
        verifer.end();
        try{
            isVerified= verifer.verify(formattedPublicKey, signedNonce, 'base64');
            
            console.log(isVerified);
        }catch(err){
            console.error(err);
            return false;
        }
        return isVerified;
}


module.exports = {
    createAccessToken,
    createRefreshToken,
    sendAccessToken,
    sendRefreshToken,
    formatPublicKey,
    verifyRefreshToken,
    verifySignedNonce,
};