// app/privacy-policy.tsx
import React from 'react';

const PrivacyPolicy = () => {
    return (
        <div className="max-w-3xl mx-auto p-6 text-white-500">
            <h1 className="text-3xl font-bold mb-4 text-white-500">Privacy Policy</h1>

            <p className="mb-4">
                This Privacy Policy outlines how the RSVP app for Neeraj & Jinal’s wedding ("App") treats user information.
                We are committed to maintaining your privacy and ensuring a safe experience.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2">Information Collection and Use</h2>
            <p className="mb-4">
                This app does <strong>not</strong> collect, store, or share any personally identifiable information.
                Guest details (such as name and phone number) are used only for looking up RSVP information from a secure, preloaded guest list and are never stored by the app or transmitted beyond what is necessary for RSVP confirmation.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2">Data Security</h2>
            <p className="mb-4">
                Since we do not collect or retain any personal information, there is no risk of your data being compromised through the app. All interactions are designed to be read-only or ephemeral for RSVP purposes only.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2">Third-Party Services</h2>
            <p className="mb-4">
                This app does not integrate with any third-party analytics, advertising, or tracking services.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2">Changes to This Privacy Policy</h2>
            <p className="mb-4">
                We may update this Privacy Policy if necessary (for example, to reflect new functionality). Updates will be reflected on this page with a revised date.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2">Your Acceptance of These Terms</h2>
            <p className="mb-4">
                By using this App, you agree to this policy. If you do not agree, please refrain from using the App.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2">Contact Us</h2>
            <p className="mb-4">
                If you have any questions about this Privacy Policy, you may contact us at:
                <br />
                <a href="mailto:satya.vinjamuri@lambdatechservices.com" className="text-blue-600 underline">
                    satya.vinjamuri@lambdatechservices.com
                </a>
            </p>

            <p className="text-sm text-gray-500">This document was last updated on June 25, 2025.</p>
        </div>
    );
};

export default PrivacyPolicy;
