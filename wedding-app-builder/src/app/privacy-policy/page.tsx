// app/privacy-policy.tsx
import React from 'react';

const PrivacyPolicy = () => {
    return (
        <div className="max-w-3xl mx-auto p-6 text-white-500">
            <h1 className="text-3xl font-bold mb-4 text-white-500">Privacy Policy</h1>

            <p className="mb-4">
                This Privacy Policy outlines how the RSVP app for Neeraj & Jinal’s wedding ("App") handles user information. We are committed to protecting your privacy and ensuring transparency regarding any data usage.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2">Information Collection and Use</h2>
            <p className="mb-4">
                The App may collect limited information for RSVP functionality and user experience improvement. Specifically, user name and phone number are used temporarily to match your invitation. This data is not stored beyond the duration of your session.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2">App Tracking Transparency</h2>
            <p className="mb-4">
                In compliance with Apple’s App Tracking Transparency (ATT) framework, this app includes a request for tracking authorization. While we currently do not use advertising identifiers or track user behavior for analytics, this permission is requested to maintain compatibility with certain system-level APIs or future features.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2">Third-Party Services</h2>
            <p className="mb-4">
                This app does not use third-party advertising networks or analytics platforms. No personal data is shared with third parties for marketing or tracking purposes.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2">Data Security</h2>
            <p className="mb-4">
                We implement appropriate security measures to protect any temporary or session-based data. No personal data is permanently stored on your device or transmitted to external servers beyond RSVP confirmation.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2">Your Choices</h2>
            <p className="mb-4">
                You may choose to deny tracking permission when prompted. The app will continue to function without limitation regardless of your choice.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2">Changes to This Privacy Policy</h2>
            <p className="mb-4">
                We may update this Privacy Policy to reflect changes in functionality or legal requirements. Updates will be reflected on this page with a revised date.
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
