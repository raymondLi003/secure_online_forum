//create a function that remove user from the group

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
const serverUrl = 'https://localhost:3000';

const RemoveUserFromGroupPage = () => {
    console.log('in the remove user from group page');
    const  navigate  = useNavigate();
    const [userId, setUserId] = useState('');
    const [groupId, setGroupId] = useState('');
    async function handleRemoveGroupUser(e) {
        e.preventDefault();
        try {

            console.log('start the remove user from group process');
            //clean up the userId and groupId to avoid xxs attacks
            const cleanedUserId = userId.replace(/[^a-zA-Z0-9]/g, '');
            const cleanedGroupId = groupId.replace(/[^a-zA-Z0-9]/g, '');
            console.log('cleanedUserId: ' + cleanedUserId);
            console.log('cleanedGroupId: ' + cleanedGroupId);

            const response = await fetch(`${serverUrl}/removeGroupUser`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: cleanedUserId,
                    groupId: cleanedGroupId,
                })
            });

            console.log(response);
            if (!response.ok) {
                throw new Error('process to remove user from group failed');
            }
            navigate('/Groups'); // navigate to home page after successful removal of user from group
        } catch (err) {
            console.error(err);
            alert('Failed to remove user from group');
        }
        console.log("remove user" + userId + " from group" + groupId);
    };

    return (
        <div>
            <form onSubmit={handleRemoveGroupUser} acceptCharset='UTF-8'>
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
                <button type="submit" disabled={!userId || !groupId}>Leave Group</button>

            </form>
        </div>
    );
}
export default RemoveUserFromGroupPage;
