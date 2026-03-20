import { Outlet, Link } from "react-router-dom";
import React from "react";
const GroupLayout = () => {
  return (
    <>
      <nav>
        <ul>
          <li>
            <Link to="/Groups/CreateGroup">Create Group</Link>
          </li>
          <li>
            <Link to="/Groups/JoinGroup">Join Group</Link>
          </li>
          <li>
            <Link to="/Groups/Logout">Log out</Link>
          </li>
          <li>
            <Link to="/Groups/RemoveUserFromGroup">Remove User From Group</Link>
          </li>
        </ul>
      </nav>
 
 
      
    </>
  )
 };
 
 
 export default GroupLayout;
 
