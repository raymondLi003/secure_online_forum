import React, { useState, useEffect } from 'react';
import {
    validPrivateKey,
    encryptMessage,
    decryptMessage,
} from './keygens';
import { useParams } from 'react-router-dom';
const serverUrl = 'https://localhost:3000';

const GroupChatPage = () => {
    const { groupId } = useParams();
    const [messages, setMessages] = useState([]);
    const [privateKey, setPrivateKey] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const [decryptedMessages, setDecryptedMessages] = useState([]);
    const [publicKey, setPublicKey] = useState('');

    // helper function to update the messages after a new message is posted


    useEffect(() => {
        if (validPrivateKey(privateKey)) {
            // get encrypted messages from the server
            const fetchMessages = async () => {
                try {
                    const response = await fetch(`${serverUrl}/getEncryptedMessage/${groupId}`);
                    if (!response.ok) {
                        throw new Error('request for encrytped messages was not ok');
                    }
                    const data = await response.json();
                    
                    setMessages(data.messages);
                } catch (error) {
                    console.error('Error fetching messages:', error);
                }
            };
            if (groupId) {
                fetchMessages();
            }
        }



    }, [groupId, privateKey]); // Include privateKey in the dependency array

    useEffect(() => {
        // check if the private key is valid or inputted
        if (validPrivateKey(privateKey)) {
            // decrypt all messages
            const decryptAllMessages = async () => {
                try {

                    
                    if (messages == "" || messages == undefined || messages == null) {
                        console.log("no message to decrypt");
                        return;
                    }

                    try {
                        // decrypt all messages stored in the array of messages
                        const decrypted = await Promise.all(
                            messages.map(async message => {
                                try {
                                    return message.encryptedMessage ? await decryptMessage(privateKey, message.encryptedMessage) : null;
                                } catch (e) {
                                    console.error('Error decrypting individual message:', e);
                                    return null;
                                }
                            })
                        );
                        setDecryptedMessages(decrypted);
                    }
                    catch (e) {
                        console.error('cannot decrypt the message' + e);
                    }
                    
                } catch (error) {
                    console.error('Error decrypting messages:', error);
                }
            };
            decryptAllMessages();
        }



    }, [messages, privateKey]); // Decrypt messages when they or privateKey change

    const handlePrivateKeyChange = (event) => {
        setPrivateKey(event.target.value);
    };

    const handleNewMessageChange = (event) => {
        setNewMessage(event.target.value);
    };

    const postMessage = async () => {
        const getEncryptionPublicKey = async () => {
            try {
                // get the group's public encryption key
                const encryptionKeyRequest = await fetch(`${serverUrl}/getGroupEncryptionKey`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ groupId: groupId }),
                });

                if (!encryptionKeyRequest.ok) {

                    throw new Error('request for group encryption key was not ok');
                } else {
                    // get the group's public encryption key
                    const publicKeyResponse = await encryptionKeyRequest.json();

                    setPublicKey(publicKeyResponse.groupEncryptionKey);
                    return publicKeyResponse.groupEncryptionKey;
                }

            } catch (error) {
                console.error('Error fetching group public key:', error);
            }
        }
        try {
            // get the group's encryption key from the server
            const publicKey = await getEncryptionPublicKey();
            if (publicKey == "" || publicKey == undefined || publicKey == null) {
                console.log("no public key stored for this group");
                return;
            }
            // encrypt the message with the group's public encryption key
            let encryptedMessage = await encryptMessage(publicKey, newMessage);
            const response = await fetch(`${serverUrl}/storeEncryptedMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ groupId, encryptedMessage }),
            });

            if (!response.ok) {
                throw new Error('the fetch request for the encrypted message was not ok');
            }
            setNewMessage('');
        } catch (error) {
            console.error('Error posting message:', error);
        }
    };

    return (
        <div>
            <h2>Message Board for {groupId}</h2>
            <div>
                {decryptedMessages.map((message, index) => (
                    <p key={index}>{message}</p>
                ))}
            </div>
            <textarea
                placeholder="Enter your private decryption key here"
                value={privateKey}
                onChange={handlePrivateKeyChange}
            />
            <div>
                <textarea
                    placeholder="Type your message here"
                    value={newMessage}
                    onChange={handleNewMessageChange}
                />
                <button onClick={postMessage}>Send Message</button>
            </div>
        </div>
    );
};

export default GroupChatPage;
