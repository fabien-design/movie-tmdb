const Footer = () => {
    return (
      <footer className="bg-gray-800 py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-400 text-sm">© 2025 MovieDB - Tous droits réservés</p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                À propos
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                Contact
              </a>  
              <a href="#" className="text-gray-400 hover:text-white transition">
                Politique de confidentialité
              </a>
            </div>
          </div>
        </div>
      </footer>
    );
  };
  
  export default Footer;