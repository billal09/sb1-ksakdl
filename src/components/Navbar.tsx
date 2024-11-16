import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FileText } from 'lucide-react';
import ProfileMenu from './ProfileMenu';

export default function Navbar() {
  const { currentUser } = useAuth();

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-800">Bil-Development Facture Pro</span>
          </div>
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <ProfileMenu />
            ) : (
              <>
                <Link
                  to="/"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}