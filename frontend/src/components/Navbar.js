import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-blue-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="bg-white rounded-full p-2 mr-3">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <span className="text-white text-xl font-bold">SecureBank</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {!user ? (
              <>
                <Link to="/" className="text-white hover:text-blue-200 transition duration-200">
                  Home
                </Link>
                <Link to="/#about" className="text-white hover:text-blue-200 transition duration-200">
                  About
                </Link>
                <Link to="/#services" className="text-white hover:text-blue-200 transition duration-200">
                  Services
                </Link>
                <Link to="/login" className="text-white hover:text-blue-200 transition duration-200">
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-50 transition duration-200"
                >
                  Open Account
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to={user.role === 'admin' ? '/admin' : '/dashboard'} 
                  className="text-white hover:text-blue-200 transition duration-200"
                >
                  {user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
                </Link>
                <div className="text-white">
                  Welcome, {user.name}
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-md font-medium hover:bg-red-600 transition duration-200"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-blue-200 focus:outline-none focus:text-blue-200"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {!user ? (
                <>
                  <Link 
                    to="/" 
                    className="text-white block px-3 py-2 rounded-md text-base font-medium hover:text-blue-200 hover:bg-blue-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link 
                    to="/login" 
                    className="text-white block px-3 py-2 rounded-md text-base font-medium hover:text-blue-200 hover:bg-blue-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="text-white block px-3 py-2 rounded-md text-base font-medium hover:text-blue-200 hover:bg-blue-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Open Account
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to={user.role === 'admin' ? '/admin' : '/dashboard'} 
                    className="text-white block px-3 py-2 rounded-md text-base font-medium hover:text-blue-200 hover:bg-blue-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
                  </Link>
                  <div className="text-white px-3 py-2 text-base font-medium">
                    Welcome, {user.name}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-white block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:text-blue-200 hover:bg-blue-700"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;