import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const branches = [
  { id: 'amreli', nameKey: 'Amreli', image: '/amreli.jpg' },
  { id: 'ahmedabad', nameKey: 'Ahmedabad', image: '/ahmedabad.jpg' },
  { id: 'surat', nameKey: 'Surat', image: '/surat.jpg' },
  { id: 'botad', nameKey: 'Botad', image: '/botad.jpg' },
  { id: 'rajkot', nameKey: 'Rajkot', image: null },
  { id: 'vadodara', nameKey: 'Vadodara', image: null },
  { id: 'common', nameKey: 'Common', image: null },
  { id: 'darshan', nameKey: 'Darshan', image: null },
];

const Home = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50 pt-8">
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex items-center justify-center mb-10">
          <div className="h-px bg-gray-300 w-16 md:w-32"></div>
          <h2 className="text-2xl md:text-3xl font-bold text-center mx-4 text-gray-800 tracking-wide uppercase">{t('select_branch')}</h2>
          <div className="h-px bg-gray-300 w-16 md:w-32"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {branches.map((branch) => (
            <Link 
              key={branch.id} 
              to={`/branch/${branch.id}`}
              className="group relative flex flex-col bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100"
            >
              {branch.image ? (
                <div className="h-56 w-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
                  <img 
                    src={branch.image} 
                    alt={branch.nameKey} 
                    className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-700 ease-in-out" 
                  />
                </div>
              ) : (
                <div className="h-56 w-full flex flex-col items-center justify-center bg-gradient-to-br from-orange-200 to-orange-100 group-hover:scale-105 transition-transform duration-700 ease-in-out">
                  <span className="text-orange-900 font-bold text-2xl drop-shadow-sm px-4 text-center tracking-wide">
                    {t('jay_swaminarayan_plain', 'Jay Swaminarayan')}
                  </span>
                  {(branch.id === 'rajkot' || branch.id === 'vadodara') && (
                    <span className="text-orange-700 font-semibold mt-2 px-3 py-1 bg-white/40 rounded-full text-sm backdrop-blur-sm border border-orange-200 shadow-sm animate-pulse">
                      {t('coming_soon', 'Coming Soon...')}
                    </span>
                  )}
                </div>
              )}
              
              <div className="p-5 text-center bg-white relative z-10 border-t border-orange-50">
                <h3 className="text-xl font-bold text-gray-800 group-hover:text-orange-600 transition-colors duration-300">
                  {t(branch.nameKey)}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
