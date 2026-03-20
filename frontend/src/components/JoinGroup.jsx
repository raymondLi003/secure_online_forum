import {
    arrayToBase64,
    signNonce,
    validPrivateKey,
} from "./keygens";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
const serverUrl = 'https://localhost:3000';

const JoinGroupPage = () => {
    console.log("initialize the JoinGroupPage");
    const [groupId, setGroupId] = useState("");
    const [joinStatus, setJoinStatus] = useState("");
    const [privateKey, setPrivateKey] = useState("");
    const [error, setError] = useState("");
    const [userId, setUserId] = useState("");
    const  navigate  = useNavigate();
    async function handleGroupJoin(e) {
        e.preventDefault();

        try {

            // clean up the groupId to avoid xxs attacks
            const cleanGroupId = groupId.replace(/[^a-zA-Z0-9]/g, '');
            const cleanedUserId = userId.replace(/[^a-zA-Z0-9]/g, '');
            console.log("start the join group process");
            // get the generated nonce from the server side
            const response = await fetch(`${serverUrl}/generateGroupNonce`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ groupId: cleanGroupId })
            });
            if (!response.ok) {
                alert('Failed to get nonce');
                return;
            }
            const nonceResponse = await response.json()
            const nonce = nonceResponse.nonce;

            if (!validPrivateKey(privateKey)) {
                alert('Invalid format!');
                return;
            }
            // sign the nonce with the group's private key
            const signedNonce = await signNonce(privateKey, nonce);
            
            const joinCheck = await fetch(`${serverUrl}/addUserToGroup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: cleanedUserId,
                    groupId: cleanGroupId,
                    signedNonce: arrayToBase64(signedNonce)
                })
            });

            // check if the JoinGroup function was successful
            if (joinCheck.ok) {
                console.log('join group successful');
                alert('Join group successful');
                setJoinStatus('Join group successful');
                navigate(`/Groups/Group/${cleanGroupId}`);
            } else {
                console.error(err);
                alert('Join group failed');
                setJoinStatus('Join group failed');
                alert('Join group failed');
                setError('Join group failed');
            }
        } catch (err) {
            console.error(err);
        }



    }
    return (
        <div>
            <form onSubmit={handleGroupJoin}>
                <input
                    type="text"
                    id="userId"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="User ID: "
                />
                <input
                    type="text"
                    id="groupId"
                    value={groupId}
                    onChange={(e) => setGroupId(e.target.value)}
                    placeholder="Group ID: "
                />
                <textarea
                    value={privateKey}
                    onChange={e => setPrivateKey(e.target.value)}
                    placeholder="Private Key: "
                />
                <button type="submit">Join Group</button>

            </form>


            {error && <p>{error}</p>}
        </div>
    );
}

export default JoinGroupPage;