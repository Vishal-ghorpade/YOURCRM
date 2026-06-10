import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-base text-primary">
      {/* Sidebar fixed */}
      <Sidebar />

      {/* Main body wrapper */}
      <div className="flex-1 flex flex-col pl-[240px]">
        {/* Topbar fixed */}
        <Topbar />

        {/* Scrollable content container */}
        <main className="flex-1 p-[24px] mt-[60px] overflow-y-auto min-h-[calc(100vh-60px)]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
