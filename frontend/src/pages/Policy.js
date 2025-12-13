import React from "react";
import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 py-12 px-4 md:px-8 lg:px-16">
      <div className="max-w-4xl mx-auto bg-slate-800/50 border border-slate-700 p-8 md:p-12 rounded-2xl shadow-2xl">
        
        <div className="mb-10 border-b border-slate-700 pb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-400">
            Last Updated: <span className="text-blue-400">December 2025</span>
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 leading-relaxed">
          <section>
            <p>
              <strong>TinyCompression</strong> (“we”, “our”, or “us”) provides an
              online tool that allows users to compress videos and images
              instantly. We are committed to protecting your privacy and being
              transparent about how we handle information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              1. Information We Collect
            </h2>
            <div className="space-y-4 pl-2">
              <div>
                <h3 className="text-lg font-medium text-slate-200 mb-1">
                  a. Files You Upload
                </h3>
                <p>
                  You may upload videos or images solely for the purpose of
                  compression.
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
                  <li>We do <strong>NOT</strong> store, view, or retain your files.</li>
                  <li>
                    Files are processed temporarily in RAM or a temporary server
                    environment and are automatically deleted after the
                    compression task is completed.
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-slate-200 mb-1">
                  b. Usage Data (Basic Analytics)
                </h3>
                <p>
                  To improve our service, we may collect non-personal information
                  such as:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
                  <li>Pages visited</li>
                  <li>Compression attempts</li>
                  <li>Device type / browser type</li>
                  <li>Anonymous usage statistics</li>
                </ul>
                <p className="mt-2 text-sm italic">
                  This data cannot identify you personally.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-slate-200 mb-1">
                  c. Account Information (If/When Login Is Enabled)
                </h3>
                <p>If you sign up for a plan (Free or Pro), we may collect:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
                  <li>Email address</li>
                  <li>Password (hashed & encrypted)</li>
                  <li>Subscription details</li>
                </ul>
                <p className="mt-2 text-sm italic">
                  We never store plaintext passwords.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              2. How We Use Your Information
            </h2>
            <p>We may use non-personal and account-level information to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
              <li>Provide and maintain the compression service</li>
              <li>Enforce usage limits (e.g., daily MB caps)</li>
              <li>Improve performance and reliability</li>
              <li>Provide customer support</li>
              <li>Process payments if you upgrade to Pro</li>
            </ul>
            <p className="mt-3 text-blue-400 font-medium">
              We never sell or share your data with advertisers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              3. File Handling & Security
            </h2>
            <div className="space-y-4 pl-2">
              <div>
                <h3 className="text-lg font-medium text-slate-200">
                  Temporary Processing
                </h3>
                <p className="text-slate-400">
                  All uploaded files are processed only during compression. Files
                  are automatically deleted after the task completes or if you
                  close the session.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-200">
                  Security Measures
                </h3>
                <p className="mb-2">We implement:</p>
                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                  <li>HTTPS encryption</li>
                  <li>Secure file handling</li>
                  <li>Temporary storage deletion</li>
                  <li>Server-level access restrictions</li>
                </ul>
                <p className="mt-2 text-sm italic">
                  While no system is 100% secure, we take all reasonable steps
                  to protect your data.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              4. Cookies
            </h2>
            <p>We may use minimal cookies for:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
              <li>Session management</li>
              <li>Remembering your usage limits</li>
              <li>Improving site functionality</li>
            </ul>
            <p className="mt-2 text-sm">
              We do not use cookies for targeted advertising.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              5. Third-Party Services
            </h2>
            <p>
              If you purchase a subscription, payment processing may involve
              trusted third-party providers.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
              <li>
                These services handle your payment details securely—we do not
                store your card information.
              </li>
              <li>
                If we use analytics tools (e.g., privacy-focused analytics),
                they will collect only anonymized, non-personal data.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              6. Children's Privacy
            </h2>
            <p>
              TinyCompression is not intended for children under 13. We do not
              knowingly collect personal information from anyone under this age.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              7. Your Rights
            </h2>
            <p>Depending on your region, you may request:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
              <li>Access to the personal data we hold</li>
              <li>Correction or deletion</li>
              <li>Opt-out of non-essential data collection</li>
            </ul>
            <p className="mt-2">Contact us for any such requests.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              8. Changes to This Policy
            </h2>
            <p>
              We may update this privacy policy from time to time. Revisions
              will be posted on this page with a new “Last Updated” date.
            </p>
          </section>

          <section className="border-t border-slate-700 pt-6 mt-8">
            <h2 className="text-xl font-semibold text-white mb-3">
              9. Contact Us
            </h2>
            <p className="mb-4">
              If you have questions about this Privacy Policy, you can reach us
              at:
            </p>
            <a
              href="mailto:tinycompression.support@gmail.com"
              className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              📧 beproductivecontact@gmail.com
            </a>
          </section>

          {/* Navigation Button */}
          <div className="mt-12 pt-6 border-t border-slate-700 flex justify-center">
            <Link
              to="/"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}