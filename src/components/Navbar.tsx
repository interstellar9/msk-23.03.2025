import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Home, LogOut, MessageSquare, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Błąd wylogowania:', error);
    }
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold">Miejska Sieć Kontaktów</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-600 hover:text-blue-600" title="Strona główna">
              <Home className="h-5 w-5" />
            </Link>
            
            {user ? (
              <>
                <NotificationBell />
                <Link to="/messages" className="text-gray-600 hover:text-blue-600" title="Wiadomości">
                  <MessageSquare className="h-5 w-5" />
                </Link>
                <Link to="/dashboard" className="text-gray-600 hover:text-blue-600" title="Panel">
                  <User className="h-5 w-5" />
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-blue-600"
                  title="Wyloguj"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Zaloguj się
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}