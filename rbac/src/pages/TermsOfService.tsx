"use client";

export default function TermsOfService() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-700 mb-6">Terms of Service</h1>
      <p className="text-gray-600 text-lg mb-6">
        By accessing and using our services, you agree to comply with these Terms of Service.
      </p>
      <h2 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Use of Services</h2>
      <p className="text-gray-600 mb-6">
        Our services are provided for lawful purposes only. You agree not to misuse our platform or
        violate any applicable laws.
      </p>
      <h2 className="text-xl font-semibold text-gray-700 mt-4 mb-2">User Responsibilities</h2>
      <p className="text-gray-600 mb-6">
        You are responsible for maintaining the security of your account and any actions under your
        account.
      </p>
      <h2 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Termination</h2>
      <p className="text-gray-600 mb-6">
        We reserve the right to terminate your access to our services if you violate these Terms of
        Service.
      </p>
      <p className="text-gray-600 mb-6">
        For further questions, feel free to contact us at <a href="mailto:legal@example.com" className="text-blue-600 underline">legal@example.com</a>.
      </p>
    </div>
  );
}