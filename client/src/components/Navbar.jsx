import { Link } from 'react-router-dom';
import { Menu, X, ChefHat } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  return (
    <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <ChefHat className="h-10 w-10 text-primary" />
              <span className="text-2xl font-bold font-heading text-dark">
                Gourmet Catering
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection('home')} className="text-gray-700 hover:text-primary transition-colors font-medium">
              Home
            </button>
            <button onClick={() => scrollToSection('menu')} className="text-gray-700 hover:text-primary transition-colors font-medium">
              Menu
            </button>
            <button onClick={() => scrollToSection('packages')} className="text-gray-700 hover:text-primary transition-colors font-medium">
              Packages
            </button>
            <button onClick={() => scrollToSection('gallery')} className="text-gray-700 hover:text-primary transition-colors font-medium">
              Gallery
            </button>
            <button onClick={() => scrollToSection('reviews')} className="text-gray-700 hover:text-primary transition-colors font-medium">
              Reviews
            </button>
            <button onClick={() => scrollToSection('contact')} className="text-gray-700 hover:text-primary transition-colors font-medium">
              Contact
            </button>
            <Link to="/order" className="btn-primary">
              Order Now
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <button onClick={() => scrollToSection('home')} className="block px-3 py-2 text-gray-700 hover:text-primary w-full text-left">
              Home
            </button>
            <button onClick={() => scrollToSection('menu')} className="block px-3 py-2 text-gray-700 hover:text-primary w-full text-left">
              Menu
            </button>
            <button onClick={() => scrollToSection('packages')} className="block px-3 py-2 text-gray-700 hover:text-primary w-full text-left">
              Packages
            </button>
            <button onClick={() => scrollToSection('gallery')} className="block px-3 py-2 text-gray-700 hover:text-primary w-full text-left">
              Gallery
            </button>
            <button onClick={() => scrollToSection('reviews')} className="block px-3 py-2 text-gray-700 hover:text-primary w-full text-left">
              Reviews
            </button>
            <button onClick={() => scrollToSection('contact')} className="block px-3 py-2 text-gray-700 hover:text-primary w-full text-left">
              Contact
            </button>
            <Link to="/order" className="block px-3 py-2 bg-primary text-white rounded-lg text-center mx-3 mt-4">
              Order Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
