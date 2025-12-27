"use client";

export default function Contact() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-700 mb-6">Contact Us</h1>
      <p className="text-gray-600 text-lg mb-6">
        Have questions or need help? Feel free to reach out to us via the following channels:
      </p>
      <p className="text-gray-600 mb-4">
        <strong>Email:</strong> <a href="mailto:support@example.com" className="text-blue-600 underline">support@example.com</a>
      </p>
      <p className="text-gray-600 mb-4">
        <strong>Phone:</strong> +1 (123) 456-7890
      </p>
      <p className="text-gray-600 mb-4">
        <strong>Address:</strong> 123 Main Street, Suite 400, City, State, ZIP Code
      </p>
      <p className="text-gray-600">
        You can also follow us on social media to stay updated:
        <ul className="list-disc pl-6 mt-2 text-gray-600">
          <li>
            <a href="https://twitter.com/example" target="_blank" className="text-blue-600 underline">Twitter</a>
          </li>
          <li>
            <a href="https://facebook.com/example" target="_blank" className="text-blue-600 underline">Facebook</a>
          </li>
        </ul>
      </p>
    </div>
  );
}