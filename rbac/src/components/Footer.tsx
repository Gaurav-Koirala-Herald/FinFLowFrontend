import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-100 p-4 mt-6">
      <div className="container mx-auto text-center">
        <nav className="flex flex-wrap justify-center space-x-4 mb-4">
          <Link
            to="/privacy-policy"
            className="text-gray-600 hover:text-blue-500 underline text-sm"
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms-of-service"
            className="text-gray-600 hover:text-blue-500 underline text-sm"
          >
            Terms of Service
          </Link>
          <Link to="/contact" className="text-gray-600 hover:text-blue-500 underline text-sm">
            Contact
          </Link>
          <Link to="/about" className="text-gray-600 hover:text-blue-500 underline text-sm">
            About
          </Link>
        </nav>
        <p className="text-gray-500 text-xs">
          © {new Date().getFullYear()} My Company. All rights reserved.
        </p>
      </div>
    </footer>
  );
}