import React from 'react';
import { Outlet } from 'react-router-dom';

function Layout() {
  return (
    <div className="container">
      <div className="main-content">
          <Outlet />
      </div>
    </div>
  );
}

export default Layout;
