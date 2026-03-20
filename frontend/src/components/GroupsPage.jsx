// this is the group page the holds the createGroup adn joinGroup pages
import React from 'react';
import GroupLayout from './GroupLayout';
import { Outlet } from 'react-router-dom';
const GroupsPage = () => {
  
  return (
    <div>
      <GroupLayout />

      <Outlet />
      
    </div>
  );
};

export default GroupsPage;
