import React from 'react';
import './TermsAndConditions.css'; // Optional: for custom styling

const TermsAndConditions = () => {
  return (
    <div className="terms-container">
      <div className="terms-header">
        <h1>Terms and Conditions</h1>
        <p className="last-updated">Last Updated: March 12, 2026</p>
      </div>

      <div className="terms-content">
        <section className="terms-section">
          <h2>1. Acceptance of Terms</h2>
          <p>Welcome to Rewrite ("Company," "we," "our," "us"). By accessing or using our social platform, website, and related services (collectively, the "Platform"), you agree to be bound by these Terms and Conditions ("Terms"). If you disagree with any part of these Terms, you may not access or use our Platform.</p>
        </section>

        <section className="terms-section">
          <h2>2. Eligibility</h2>
          <p>By using our Platform, you represent and warrant that:</p>
          <ul>
            <li>You are at least 13 years of age (or the minimum age in your country to use social platforms)</li>
            <li>You have the full power and authority to enter into these Terms</li>
            <li>You are not located in a country that is subject to U.S. government embargo</li>
            <li>You have not been previously suspended or removed from our Platform</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>3. Account Registration</h2>
          <h3>3.1 Account Creation</h3>
          <p>To access certain features, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.</p>
          
          <h3>3.2 Account Security</h3>
          <p>You are responsible for safeguarding your password and for all activities under your account. Notify us immediately of any unauthorized use. We are not liable for any loss or damage from your failure to comply with this security obligation.</p>
          
          <h3>3.3 Email Verification</h3>
          <p>You agree to verify your email address upon registration. We may send verification, notification, and promotional emails to your registered email address. You can opt out of promotional emails at any time.</p>
        </section>

        <section className="terms-section">
          <h2>4. User Content</h2>
          <h3>4.1 Ownership</h3>
          <p>You retain all ownership rights to content you post ("User Content"). By posting, you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, adapt, publish, and display such content to operate and improve our Platform.</p>
          
          <h3>4.2 Content Standards</h3>
          <p>You agree not to post content that:</p>
          <ul>
            <li>Is illegal, harmful, threatening, abusive, harassing, defamatory, or discriminatory</li>
            <li>Contains nudity, violence, or sexually explicit material</li>
            <li>Infringes on intellectual property rights</li>
            <li>Contains malware, viruses, or harmful code</li>
            <li>Impersonates any person or entity</li>
            <li>Constitutes unauthorized advertising or spam</li>
          </ul>
          
          <h3>4.3 Content Monitoring</h3>
          <p>We reserve the right, but have no obligation, to monitor, review, or remove User Content for violations of these Terms. We are not responsible for any User Content nor do we endorse any opinions expressed via the Platform.</p>
        </section>

        <section className="terms-section">
          <h2>5. Prohibited Conduct</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Harass, abuse, or harm another person</li>
            <li>Impersonate others or provide false information</li>
            <li>Post others' private information without consent</li>
            <li>Use the Platform for any illegal purpose</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Use automated means (bots, scrapers) to access the Platform</li>
            <li>Interfere with or disrupt the Platform or servers</li>
            <li>Create multiple accounts to avoid restrictions</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>6. Intellectual Property</h2>
          <h3>6.1 Our Content</h3>
          <p>The Platform, including its design, features, and original content, is owned by us and protected by copyright, trademark, and other laws. You may not copy, modify, or create derivative works without our express permission.</p>
          
          <h3>6.2 Feedback</h3>
          <p>If you provide feedback or suggestions, we may use them without obligation or compensation to you.</p>
        </section>

        <section className="terms-section">
          <h2>7. Privacy</h2>
          <p>Your use of the Platform is also governed by our Privacy Policy, which explains how we collect, use, and share your information. By using the Platform, you consent to our data practices described in the Privacy Policy.</p>
        </section>

        <section className="terms-section">
          <h2>8. Third-Party Links</h2>
          <p>The Platform may contain links to third-party websites. We are not responsible for the content or practices of these websites. Your interactions with third parties are solely between you and them.</p>
        </section>

        <section className="terms-section">
          <h2>9. Termination</h2>
          <p>We may suspend or terminate your account and access to the Platform at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason. Upon termination, your right to use the Platform will immediately cease.</p>
        </section>

        <section className="terms-section">
          <h2>10. Disclaimer of Warranties</h2>
          <p>THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.</p>
        </section>

        <section className="terms-section">
          <h2>11. Limitation of Liability</h2>
          <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE PLATFORM.</p>
        </section>

        <section className="terms-section">
          <h2>12. Indemnification</h2>
          <p>You agree to indemnify and hold us harmless from any claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising out of or related to your User Content, your use of the Platform, your violation of these Terms, or your violation of any rights of another.</p>
        </section>

        <section className="terms-section">
          <h2>13. Governing Law</h2>
          <p>These Terms shall be governed by the laws of [Your State/Country] without regard to its conflict of law provisions. Any legal action shall be brought exclusively in the courts of [Your City/County].</p>
        </section>

        <section className="terms-section">
          <h2>14. Changes to Terms</h2>
          <p>We may modify these Terms at any time. We will provide notice of significant changes by posting the updated Terms on the Platform and updating the "Last Updated" date. Your continued use after such modifications constitutes acceptance of the updated Terms.</p>
        </section>

        <section className="terms-section">
          <h2>15. Contact Information</h2>
          <p>For questions about these Terms, please contact us at:</p>
          <address>
            Rewrite Support<br />
            Email: support@rewrite.com<br />
            Address: [Your Physical Address, optional]
          </address>
        </section>
      </div>

      <div className="terms-footer">
        <p>By checking the box and clicking "Sign Up" or "Register," you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.</p>
      </div>
    </div>
  );
};

export default TermsAndConditions;