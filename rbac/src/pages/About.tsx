"use client";

export default function About() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-700 mb-6">About Us</h1>
      <p className="text-gray-600 text-lg mb-6">
        Welcome to our platform! We are committed to providing exceptional services to help you
        achieve your goals.
      </p>
      <h2 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Our Mission</h2>
      <p className="text-gray-600 mb-6">
        Our mission is to empower individuals and businesses with innovative tools and solutions.
      </p>
      <h2 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Our Values</h2>
      <p className="text-gray-600 mb-6">
        We believe in transparency, innovation, and customer satisfaction.
      </p>
      <h2 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Contact Us</h2>
      <p className="text-gray-600 mb-6">
        For more information, reach out to us via <a href="mailto:info@example.com" className="text-blue-600 underline">info@example.com</a>.
      </p>
    </div>
  );
}