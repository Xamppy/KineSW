import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4">
        <Outlet /> {/* El contenido de cada página se renderizará aquí */}
      </main>
      <footer className="bg-[#07421a] p-4 text-center text-sm text-white">
        © {new Date().getFullYear()} S.W. Kinesiología. Todos los derechos reservados.
      </footer>
    </div>
  );
};

export default Layout; 