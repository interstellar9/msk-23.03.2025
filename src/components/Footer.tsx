import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Building2 className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-bold">Miejska Sieć Kontaktów</span>
            </div>
            <p className="text-gray-600">
              Łączymy lokalnych przedsiębiorców z mieszkańcami Twojego miasta.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Szybkie linki</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-blue-600">
                  Strona główna
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-blue-600">
                  O nas
                </Link>
              </li>
              <li>
                <Link to="/token" className="text-gray-600 hover:text-blue-600">
                  MSK Token
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-600 hover:text-blue-600">
                  Usługi
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-blue-600">
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Informacje prawne</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-blue-600">
                  Polityka prywatności
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-blue-600">
                  Regulamin
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-gray-600 hover:text-blue-600">
                  Polityka cookies
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Kontakt</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-gray-600">
                <Mail className="h-5 w-5" />
                <span>kontakt@miejska-siec.pl</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-600">
                <Phone className="h-5 w-5" />
                <span>+48 123 456 789</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-gray-600">
          <p>© {new Date().getFullYear()} Miejska Sieć Kontaktów. Wszelkie prawa zastrzeżone.</p>
        </div>
      </div>
    </footer>
  );
}