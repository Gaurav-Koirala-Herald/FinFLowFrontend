"use client";

export function PrivacyPolicy() {
  return (
    <div className="p-6 min-h-screen bg-white dark:bg-gray-950">
      <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-100 mb-6">
        Privacy Policy
      </h1>
      <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">
        Your privacy is important to us. This Privacy Policy explains how we collect, use, and
        protect your information when you use our services.
      </p>

      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mt-4 mb-2">
        Information We Collect
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        We collect personal information you provide to us, such as your name, email address, and
        payment information.
      </p>

      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mt-4 mb-2">
        How We Use Your Information
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        We use your information to provide our services, process transactions, and improve your
        experience.
      </p>

      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mt-4 mb-2">
        Security Measures
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        We implement security measures to safeguard your information, such as encryption and
        secure servers.
      </p>

      <p className="text-gray-600 dark:text-gray-300 mb-6">
        For further questions or concerns, please contact us at{" "}
        <a
          href="mailto:support@example.com"
          className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
        >
          support@example.com
        </a>
        .
      </p>
    </div>
  );
}