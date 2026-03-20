import React from 'react';
import { useNavigate } from 'react-router-dom';
const serverUrl = 'https://localhost:3000';



function LogoutPage({ setUser }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await fetch(`${serverUrl}/logout`, {
            method: 'POST',
            credentials: 'include',
        });
        setUser({});
        
        navigate('/');
    };

    return (
        <div>
            <h1>Logout</h1>
            <button onClick={handleLogout}>Log Out</button>
        </div>
    );
}

export default LogoutPage;
