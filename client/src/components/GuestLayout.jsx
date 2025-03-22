import React from 'react';
import { Outlet } from 'react-router-dom';

const GuestLayout = () => {
  return (
    <div className="guest-layout">
      <body>
          <Outlet />
      </body>
    </div>
  );
};

export default GuestLayout;
