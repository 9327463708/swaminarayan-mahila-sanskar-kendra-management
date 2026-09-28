import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Header = ({ onLogout, isAuthenticated }) => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-orange-600 via-orange-500 to-red-500 text-white py-2 px-4 shadow-md">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center space-x-3 mb-3 md:mb-0">
          <img src="/logo.jpg" alt="Logo" className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-white shadow-sm" />
          
          <Link to="/" className="hover:opacity-90 transition-opacity">
            <h1 className="text-base md:text-xl font-bold tracking-wide text-center drop-shadow-md">
              {t('swaminarayan_mahila_sanskar_kendra')}
            </h1>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex space-x-2 bg-white/20 p-1 rounded-lg backdrop-blur-sm border border-white/30 shadow-inner">
            <button onClick={() => changeLanguage('en')} className={`px-3 py-1 rounded-md font-semibold text-xs transition-all duration-300 ${i18n.language === 'en' ? 'bg-white text-orange-600 shadow' : 'text-white hover:bg-white/30'}`}>EN</button>
            <button onClick={() => changeLanguage('gu')} className={`px-3 py-1 rounded-md font-semibold text-xs transition-all duration-300 ${i18n.language === 'gu' ? 'bg-white text-orange-600 shadow' : 'text-white hover:bg-white/30'}`}>GU</button>
          </div>
          
          {isAuthenticated ? (
            <button 
              onClick={onLogout}
              className="flex items-center space-x-1 bg-red-700 hover:bg-red-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
              title="Logout"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          ) : (
            <Link 
              to="/login"
              className="flex items-center space-x-1 bg-orange-700 hover:bg-orange-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
              title="Admin Login"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
              <span className="hidden sm:inline">Admin Login</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
