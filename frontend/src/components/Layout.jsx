import { Outlet, Link } from "react-router-dom";
import React from "react";
const Layout = ({ user }) => {
  return (
    <>
      <nav>
        <ul>
          
            <>
              <li><Link to="/Login">Login</Link></li>
              <li><Link to="/Register">Register</Link></li>
            </>
          
        </ul>
      </nav>
      <Outlet />
    </>
  );
};
 
 
 export default Layout;
 
