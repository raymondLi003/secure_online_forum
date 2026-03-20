import {
    arrayToBase64,
    signNonce,
    validPrivateKey,
    generateKeyPair,
    exportPrivateKey,
    exportPublicKey,
    generateAndExportEncryptionKeys,
} from "./keygens";


import React, { useState } from "react";

const serverUrl = 'https://localhost:3000';

const CreateGroupPage = () => {
    console.log("initialize the CreateGroupPage");
    const [groupId, setGroupId] = useState("");
    const [creationStatus, setCreationStatus] = useState("");
    const [privateKey, setPrivateKey] = useState("");
    const [encryptionPrivateKey, setEncryptionPrivateKey] = useState("");

    const handleGroupCreation = async (e) => {
        e.preventDefault();
        // clean up the groupId to avoid xxs attacks
        const cleanGroupId = groupId.replace(/[^a-zA-Z0-9]/g, '');
        try {
            // generate the signing key pair
            const groupKeyPair = await generateKeyPair();
            const groupPublicKey = await exportPublicKey(groupKeyPair.publicKey);
            const groupPrivateKey = await exportPrivateKey(groupKeyPair.privateKey);
            // generate the encryption key pair
            const encryptionKeyPair= await generateAndExportEncryptionKeys();
            const encryptionPubKey = encryptionKeyPair.encryptionPubKey;
            const encryptionPrivKey = encryptionKeyPair.encryptionPrivKey;
    
            // call the createGroup API
            const response = await fetch(`${serverUrl}/createGroup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ groupId: cleanGroupId, groupPublicKey: groupPublicKey, encryptionPubKey: encryptionPubKey })
            });
            if(response.ok){
                setCreationStatus("Group creation successful");
                // store the private key only when the group creation is successful
                setPrivateKey(groupPrivateKey);
                setEncryptionPrivateKey(encryptionPrivKey);
            }else{
                setCreationStatus("Group creation failure");
                alert("Group creation failed!");
            }
        } catch (err) {
            console.error(err);
        }
    };
    return (
        <div>
            <h1>Create Group</h1>
            <form onSubmit={handleGroupCreation}>
                <label>
                    Group Id:
                    <input type="text" name="groupId" value={groupId} onChange={e => setGroupId(e.target.value)} />
                </label>
                <input type="submit" value="Create Group" />
            </form>
            <p>{creationStatus}</p>
            {creationStatus === "Group creation successful" && privateKey && encryptionPrivateKey && (
            <div>
                <label>
                    Your Group Private Login Key (copy this):
                    <textarea value={privateKey} readOnly rows={10} cols={50} />
                </label>
                <label>
                    Your Group Private decrytion Key (copy this), you will need this to read the messages in the group:
                    <textarea value={encryptionPrivateKey} readOnly rows={10} cols={50} />
                </label>
            </div>
        )}
        </div>
    );
    
}



export default CreateGroupPage;