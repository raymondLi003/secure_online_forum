import { generateKeyPair, exportPrivateKey, exportPublicKey, promptForPrivateKey, arrayToBase64 } from "./keygens";

import React, {useState} from "react";
const serverUrl = 'https://localhost:3000';


const CreateRegisterPage = () =>{
    console.log('start the register page');
    const [userId, setUserId] = useState('');
    const [registrationStatus, setRegistrationStatus] = useState('');
    const [privateKey, setPrivateKey] = useState('');
    const handleRegistration = async (event) => {
        event.preventDefault();
        // clean up the userId to avoid xxs attacks
        const cleanUserId = userId.replace(/[^a-zA-Z0-9]/g, '');
        try{
            const keyPair = await generateKeyPair();
            const publicKeyArmored = await exportPublicKey(keyPair.publicKey);
            const privateKeyArmored = await exportPrivateKey(keyPair.privateKey);
            
            // send the public key and user id to the backend
            // if the user exists, it will error out
            // if the user does not exist, the back end will store the public key
            const response = await fetch(`${serverUrl}/registerUser`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: cleanUserId,
                    publickey: publicKeyArmored,
                })
            });
            console.log('frontend');
            if(response.ok){
                setRegistrationStatus('Registration successful');
                setPrivateKey(privateKeyArmored);
            }else{
                setRegistrationStatus('cannot register the user');
                alert("Registration failed");
            }
        }catch (err){
            console.error(err);
            setRegistrationStatus('there is an error in the registration process')
        }

    
    
    };
    return (
        <div>
            <form onSubmit={handleRegistration}>
                <label htmlFor="userId">UserID: </label>
                <input
                    type="text"
                    id = "userId"
                    value={userId}
                    onChange={(e)=>setUserId(e.target.value)}
                />
                <button type="submit">Register</button>
            </form>
            {registrationStatus && <p>{registrationStatus}</p>}
            {registrationStatus === "Registration successful" && privateKey && (
                <div>
                    <p>Private Key, store this in a secure location:</p>
                    <textarea value={privateKey} readOnly={true} />
                </div>
            )}
        </div>
    )
}

export default CreateRegisterPage;