import { 
    arrayToBase64,
    signNonce,
    validPrivateKey, } from "./keygens";
import React, { useState } from "react";
const serverUrl = 'https://localhost:3000';
import { useNavigate } from "react-router-dom";

const CreateLoginPage = ({onLoginSuccess})=>{
    
    console.log('start the login page');
    const navigate = useNavigate();
    const [userId, setUserId] = useState('');
    const [privateKey, setPrivateKey] = useState('');
    const [error, setError] = useState('');
    async function handleLogin(event){
        event.preventDefault();

        try{
        //clean up the userId to avoid xxs attacks
        const cleanedUserId = userId.replace(/[^a-zA-Z0-9]/g, '');
        setUserId(cleanedUserId);
        // get the generated nonce from the server side
        const response = await fetch(`${serverUrl}/getUserNonce`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: cleanedUserId })
        });
        
        if(!response.ok){
            alert('Failed to get nonce');
            return;
        }
        const nonceResponse = await response.json();
        const nonce = nonceResponse.nonce;
        // check if the private key is valid
        if(!validPrivateKey(privateKey)){
            alert('Invalid format!');
            return;
        }
        console.log('start to sign the nonce');
        // sign the nonce with the user's private key
        const signedNonce = await signNonce(privateKey, nonce);
        console.log('finish signing the nonce');
        const loginCheck = await fetch(`${serverUrl}/login`, {
            method: 'POST',
            credentials: 'include',
            headers:{
                'Content-Type' : 'application/json'
            },
            body: JSON.stringify({
                userId: cleanedUserId,
                signedNonce: arrayToBase64(signedNonce)
            })
        });
        // check if the log in is successful
        if (loginCheck.ok){
            console.log('login successful');
            onLoginSuccess(cleanedUserId);
            navigate('/Groups');

        }else{
            console.error(err);
            setError('error in the loginCheck');
        }
    } catch (err){
        console.error(err);
        setError('error in the log in function');
    }

    
    
    }
    return (
        <div>
            <form onSubmit={handleLogin}>
                <input 
                    type="text"
                    value = {userId}
                    onChange={(e)=> setUserId(e.target.value)}
                    placeholder="User ID:"
                />
                <textarea
                    value={privateKey}
                    onChange={(e)=>setPrivateKey(e.target.value)}
                    placeholder="Private Key: "
                />
                <button type="submit">login</button>
            </form>
            {error && <p>{error}</p>}

        </div>
    );
};

export default CreateLoginPage;

