"use client";

export default function PrivacyPolicy() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-700 mb-6">Privacy Policy</h1>
      <p className="text-gray-600 text-lg mb-6">
        Your privacy is important to us. This Privacy Policy explains how we collect, use, and
        protect your information when you use our services.
      </p>
      <h2 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Information We Collect</h2>
      <p className="text-gray-600 mb-6">
        We collect personal information you provide to us, such as your name, email address, and
        payment information.
      </p>
      <h2 className="text-xl font-semibold text-gray-700 mt-4 mb-2">How We Use Your Information</h2>
      <p className="text-gray-600 mb-6">
        We use your information to provide our services, process transactions, and improve your
        experience.
      </p>
      <h2 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Security Measures</h2>
      <p className="text-gray-600 mb-6">
        We implement security measures to safeguard your information, such as encryption and
        secure servers.
      </p>
      <p className="text-gray-600 mb-6">
        For further questions or concerns, please contact us at <a href="mailto:support@example.com" className="text-blue-600 underline">support@example.com</a>.
      </p>
    </div>
  );
}