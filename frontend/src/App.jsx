import { useEffect, useState } from 'react';
import React from 'react';
import CreateLoginPage from './components/Login';
import CreateRegisterPage from './components/Register';
import LogoutPage from './components/Logout';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import GroupLayout from './components/GroupLayout';
import { useNavigate } from 'react-router-dom';
import CreateGroupPage from './components/CreateGroup';
import JoinGroupPage from './components/JoinGroup';
import GroupsPage from './components/GroupsPage';
import RemoveUserFromGroupPage from './components/removeUserFromGroup';
import GroupChatPage from './components/GroupChat';
const url = "https://localhost:3000";

export const UserContext = React.createContext({});


function App() {
    const [user, setUser] = useState({ loggedIn: false });
    const [loading, setLoading] = useState(true);
    
    const handleLogin = (userId) => {
        setUser({
            userId: userId,
            loggedIn: true,
        });
    };
    // get the log in state for the web brower
    async function getLoginState() {
        console.log("start to get the login state");
        const response = await fetch(`${url}/refreshToken`,
            {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
        
        // check if the refresh token request is successful
        if (!response.ok) {
            console.error('Error from the server: ', response.status);

            console.log('logged out');
            setUser({ loggedIn: false });
        } else {
        

            const data = await response.json();
            // check if the user is logged in
            if(data.accessToken === ""){
                setUser({ loggedIn: false });
                setLoading(false);
                return;
            
            }
          
            // set the user state if the user is logged in
            setUser({
                userId: data.userId,
                accessToken: data.accessToken,
                loggedIn: true,
            });
        }
        setLoading(false);
    }


    useEffect(() => {
        getLoginState();
    }, []);








    if (loading) return <div>Loading the page</div>;

    return (
        <BrowserRouter>
            <Routes>

                {!user.loggedIn && (
                    <>
                        <Route path='/' element={<Layout user={user} />}>
                            <Route path='Login' element={<CreateLoginPage onLoginSuccess={handleLogin} />} />
                            <Route path='Register' element={<CreateRegisterPage />} />
                        </Route>
                    </>

                )}
                {user.loggedIn && (
                    <Route path='/Groups' element={<GroupsPage />}>
                        <Route index element={<CreateGroupPage />} />
                        <Route path='CreateGroup' element={<CreateGroupPage />} />
                        <Route path='JoinGroup' element={<JoinGroupPage />} />
                        <Route path='Logout' element={<LogoutPage setUser={setUser} />} />
                        <Route path='RemoveUserFromGroup' element={<RemoveUserFromGroupPage />} />
                        <Route path="/Groups/Group/:groupId" element={<GroupChatPage />} />

                    </Route>
                )}
                <Route path="*" element={<div>Page Not Found</div>} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;