import React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Link from "@mui/material/Link";
import Divider from "@mui/material/Divider";

export const metadata = {
  title: "Privacy Policy - Neram Classes",
  description: "Privacy Policy for Neram Classes educational platform",
};

export default function PrivacyPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Paper elevation={2} sx={{ p: { xs: 3, md: 5 } }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
          Privacy Policy
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Last Updated: November 25, 2024
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ "& > *": { mb: 3 } }}>
          {/* Introduction */}
          <section>
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
              1. Introduction
            </Typography>
            <Typography variant="body1" paragraph>
              Welcome to Neram Classes ("we," "our," or "us"). We are committed
              to protecting your privacy and personal information. This Privacy
              Policy explains how we collect, use, disclose, and safeguard your
              information when you use our educational platform, website, mobile
              applications, and related services (collectively, the "Services").
            </Typography>
            <Typography variant="body1" paragraph>
              Please read this Privacy Policy carefully. By using our Services,
              you consent to the data practices described in this policy. If you
              do not agree with this Privacy Policy, please do not use our
              Services.
            </Typography>
          </section>

          {/* Information We Collect */}
          <section>
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
              2. Information We Collect
            </Typography>
            <Typography variant="body1" paragraph>
              We collect various types of information in connection with the
              Services we provide, including:
            </Typography>

            <Typography variant="h6" component="h3" gutterBottom fontWeight={600}>
              2.1 Information You Provide Directly
            </Typography>
            <Box component="ul" sx={{ pl: 4, mb: 2 }}>
              <li>
                <Typography variant="body1">
                  <strong>Account Information:</strong> Name, email address,
                  phone number, username, password, date of birth, gender, and
                  profile picture
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>Profile Information:</strong> Father's name,
                  educational details (school/college name, board, year,
                  standard), city, state, country, zip code, interests, course
                  preferences, and bio
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>Payment Information:</strong> Payment method details,
                  billing address, and transaction history (processed securely
                  through our payment partners)
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>Communications:</strong> Messages, feedback, and
                  support requests you send to us
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>User Content:</strong> Any content you create, post,
                  or share on our platform
                </Typography>
              </li>
            </Box>

            <Typography variant="h6" component="h3" gutterBottom fontWeight={600}>
              2.2 Information Collected Automatically
            </Typography>
            <Box component="ul" sx={{ pl: 4, mb: 2 }}>
              <li>
                <Typography variant="body1">
                  <strong>Usage Data:</strong> Pages visited, courses accessed,
                  time spent, features used, and interaction patterns
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>Device Information:</strong> Device type, operating
                  system, browser type, IP address, device identifiers, and
                  mobile network information
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>Location Data:</strong> Approximate location based on
                  IP address
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>Cookies and Similar Technologies:</strong> We use
                  cookies, web beacons, and similar tracking technologies to
                  collect information about your browsing activities
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>Log Data:</strong> Server logs, error reports, and
                  performance data
                </Typography>
              </li>
            </Box>

            <Typography variant="h6" component="h3" gutterBottom fontWeight={600}>
              2.3 Information from Third-Party Sources
            </Typography>
            <Box component="ul" sx={{ pl: 4, mb: 2 }}>
              <li>
                <Typography variant="body1">
                  <strong>Social Media Authentication:</strong> When you sign in
                  using Google or other social media accounts, we receive basic
                  profile information such as your name, email address, and
                  profile picture
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>Firebase Authentication:</strong> We use Firebase for
                  authentication services, which may collect authentication
                  tokens and related security information
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>Payment Processors:</strong> Payment confirmation and
                  transaction details from our payment partners
                </Typography>
              </li>
            </Box>
          </section>

          {/* How We Use Your Information */}
          <section>
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
              3. How We Use Your Information
            </Typography>
            <Typography variant="body1" paragraph>
              We use the collected information for the following purposes:
            </Typography>
            <Box component="ul" sx={{ pl: 4, mb: 2 }}>
              <li>
                <Typography variant="body1">
                  <strong>Provide and Maintain Services:</strong> Create and
                  manage your account, deliver course content, process
                  payments, and provide customer support
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>Personalization:</strong> Customize your learning
                  experience, recommend relevant courses, and tailor content
                  to your interests
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>Communication:</strong> Send you course updates,
                  educational resources, notifications, newsletters, and
                  promotional materials (you can opt out at any time)
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>Analytics and Improvement:</strong> Analyze usage
                  patterns, monitor platform performance, identify issues,
                  and improve our Services
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>Security and Fraud Prevention:</strong> Protect
                  against unauthorized access, fraud, and other illegal
                  activities
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>Legal Compliance:</strong> Comply with legal
                  obligations, enforce our Terms and Conditions, and protect
                  our rights
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>WhatsApp Communications:</strong> Send course
                  materials, Q&A PDFs, notifications, and educational content
                  to your verified phone number via WhatsApp
                </Typography>
              </li>
            </Box>
          </section>

          {/* reCAPTCHA and Security */}
          <section>
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
              4. Security Measures and reCAPTCHA
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>4.1 Security Measures:</strong> We implement appropriate
              technical and organizational security measures to protect your
              personal information against unauthorized access, alteration,
              disclosure, or destruction.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>4.2 reCAPTCHA Protection:</strong> This site is protected
              by reCAPTCHA and the Google{" "}
              <Link
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                color="primary"
                underline="hover"
              >
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link
                href="https://policies.google.com/terms"
                target="_blank"
                rel="noopener noreferrer"
                color="primary"
                underline="hover"
              >
                Terms of Service
              </Link>{" "}
              apply.
            </Typography>
            <Typography variant="body1" paragraph>
              We use Google reCAPTCHA Enterprise to protect our Services from
              spam, abuse, and automated attacks. reCAPTCHA collects hardware
              and software information, such as device and application data,
              and sends it to Google for analysis. This information is used to
              protect our platform and improve reCAPTCHA's ability to
              distinguish humans from bots. The information collected by
              reCAPTCHA is subject to Google's Privacy Policy.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>4.3 Firebase Security:</strong> We use Firebase
              Authentication and Firestore, which are secured by Google's
              infrastructure. Firebase may collect authentication data and
              usage analytics as described in{" "}
              <Link
                href="https://firebase.google.com/support/privacy"
                target="_blank"
                rel="noopener noreferrer"
                color="primary"
                underline="hover"
              >
                Firebase's Privacy Policy
              </Link>
              .
            </Typography>
          </section>

          {/* Information Sharing */}
          <section>
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
              5. How We Share Your Information
            </Typography>
            <Typography variant="body1" paragraph>
              We do not sell your personal information. We may share your
              information in the following circumstances:
            </Typography>
            <Box component="ul" sx={{ pl: 4, mb: 2 }}>
              <li>
                <Typography variant="body1">
                  <strong>Service Providers:</strong> Third-party vendors who
                  help us operate our Services (hosting, payment processing,
                  email services, analytics, customer support)
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>Authentication Services:</strong> Firebase (Google),
                  Google Sign-In for authentication and user management
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>Payment Processors:</strong> Secure payment gateways
                  to process your transactions
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>Communication Platforms:</strong> WhatsApp Business
                  API or similar services to send you course materials and
                  notifications
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>Legal Requirements:</strong> When required by law,
                  court order, or government authority
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>Business Transfers:</strong> In connection with a
                  merger, acquisition, or sale of assets
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>Protection of Rights:</strong> To enforce our Terms,
                  protect our rights and property, or ensure the safety of our
                  users
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>With Your Consent:</strong> When you explicitly
                  authorize us to share your information
                </Typography>
              </li>
            </Box>
          </section>

          {/* Data Storage */}
          <section>
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
              6. Data Storage and Retention
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>6.1 Storage Location:</strong> Your data is stored
              securely on servers provided by our hosting and database partners,
              including Firebase (Google Cloud Platform) and Supabase.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>6.2 Retention Period:</strong> We retain your personal
              information for as long as necessary to provide our Services, comply
              with legal obligations, resolve disputes, and enforce our agreements.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>6.3 Account Deletion:</strong> If you delete your account,
              we will delete or anonymize your personal information within a
              reasonable timeframe, except where we are required to retain it by
              law or for legitimate business purposes.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>6.4 Backup and Recovery:</strong> We maintain backups of
              user data to ensure service continuity and disaster recovery.
              Backup data is subject to the same privacy protections as live data.
            </Typography>
          </section>

          {/* Cookies and Tracking */}
          <section>
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
              7. Cookies and Tracking Technologies
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>7.1 What Are Cookies:</strong> Cookies are small text
              files stored on your device that help us recognize you and remember
              your preferences.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>7.2 Types of Cookies We Use:</strong>
            </Typography>
            <Box component="ul" sx={{ pl: 4, mb: 2 }}>
              <li>
                <Typography variant="body1">
                  <strong>Essential Cookies:</strong> Required for the platform
                  to function (authentication, security)
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>Functional Cookies:</strong> Remember your
                  preferences and settings
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>Analytics Cookies:</strong> Help us understand how
                  you use our Services
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>Marketing Cookies:</strong> Used to deliver relevant
                  advertisements (if applicable)
                </Typography>
              </li>
            </Box>
            <Typography variant="body1" paragraph>
              <strong>7.3 Managing Cookies:</strong> You can control cookies
              through your browser settings. Note that disabling certain cookies
              may affect the functionality of our Services.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>7.4 Local Storage:</strong> We use browser local storage
              to cache user data and improve performance. This data is stored
              only on your device and can be cleared through your browser
              settings.
            </Typography>
          </section>

          {/* Your Rights */}
          <section>
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
              8. Your Privacy Rights
            </Typography>
            <Typography variant="body1" paragraph>
              Depending on your location, you may have the following rights:
            </Typography>
            <Box component="ul" sx={{ pl: 4, mb: 2 }}>
              <li>
                <Typography variant="body1">
                  <strong>Access:</strong> Request a copy of the personal
                  information we hold about you
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>Correction:</strong> Update or correct inaccurate
                  information
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>Deletion:</strong> Request deletion of your personal
                  information (subject to legal obligations)
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>Data Portability:</strong> Receive your data in a
                  structured, machine-readable format
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>Opt-Out:</strong> Unsubscribe from marketing
                  communications at any time
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>Object:</strong> Object to processing of your
                  personal information for certain purposes
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>Withdraw Consent:</strong> Withdraw consent for
                  processing based on consent
                </Typography>
              </li>
            </Box>
            <Typography variant="body1" paragraph>
              To exercise these rights, please contact us at
              privacy@neramclasses.com. We will respond to your request within a
              reasonable timeframe as required by applicable law.
            </Typography>
          </section>

          {/* Children's Privacy */}
          <section>
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
              9. Children's Privacy
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>9.1 Age Requirement:</strong> Our Services are intended
              for users aged 13 and above. We do not knowingly collect personal
              information from children under 13 without parental consent.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>9.2 Parental Consent:</strong> If you are under 18, you
              represent that you have obtained consent from your parent or legal
              guardian to use our Services.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>9.3 Notification:</strong> If we become aware that we have
              collected personal information from a child under 13 without
              parental consent, we will take steps to delete such information.
            </Typography>
          </section>

          {/* Third-Party Services */}
          <section>
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
              10. Third-Party Services and Links
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>10.1 Third-Party Links:</strong> Our Services may contain
              links to third-party websites, applications, or services. We are
              not responsible for the privacy practices of these third parties.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>10.2 Third-Party Services We Use:</strong>
            </Typography>
            <Box component="ul" sx={{ pl: 4, mb: 2 }}>
              <li>
                <Typography variant="body1">
                  Firebase Authentication and Firestore (Google)
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  Google reCAPTCHA Enterprise
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  Supabase (Database and Authentication)
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  Payment processors (as applicable)
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  Cloud storage providers for course materials
                </Typography>
              </li>
            </Box>
            <Typography variant="body1" paragraph>
              <strong>10.3 Review Third-Party Policies:</strong> We encourage
              you to review the privacy policies of any third-party services you
              access through our platform.
            </Typography>
          </section>

          {/* International Transfers */}
          <section>
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
              11. International Data Transfers
            </Typography>
            <Typography variant="body1" paragraph>
              Your information may be transferred to and maintained on servers
              located outside of your state, province, country, or other
              governmental jurisdiction where data protection laws may differ.
              By using our Services, you consent to the transfer of your
              information to countries outside your country of residence,
              including the United States, where our service providers may be
              located.
            </Typography>
          </section>

          {/* California Privacy Rights */}
          <section>
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
              12. California Privacy Rights (CCPA)
            </Typography>
            <Typography variant="body1" paragraph>
              If you are a California resident, you have additional rights under
              the California Consumer Privacy Act (CCPA):
            </Typography>
            <Box component="ul" sx={{ pl: 4, mb: 2 }}>
              <li>
                <Typography variant="body1">
                  Right to know what personal information we collect, use, and
                  disclose
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  Right to request deletion of your personal information
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  Right to opt-out of the sale of personal information (we do
                  not sell personal information)
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  Right to non-discrimination for exercising your privacy rights
                </Typography>
              </li>
            </Box>
          </section>

          {/* GDPR Rights */}
          <section>
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
              13. European Privacy Rights (GDPR)
            </Typography>
            <Typography variant="body1" paragraph>
              If you are located in the European Economic Area (EEA), you have
              rights under the General Data Protection Regulation (GDPR),
              including the right to access, rectification, erasure, restriction
              of processing, data portability, and objection to processing. You
              also have the right to lodge a complaint with a supervisory
              authority.
            </Typography>
          </section>

          {/* Changes to Privacy Policy */}
          <section>
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
              14. Changes to This Privacy Policy
            </Typography>
            <Typography variant="body1" paragraph>
              We may update this Privacy Policy from time to time to reflect
              changes in our practices, technology, legal requirements, or other
              factors. We will notify you of any material changes by:
            </Typography>
            <Box component="ul" sx={{ pl: 4, mb: 2 }}>
              <li>
                <Typography variant="body1">
                  Posting the updated Privacy Policy on our website
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  Updating the "Last Updated" date at the top of this policy
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  Sending you an email notification (for material changes)
                </Typography>
              </li>
            </Box>
            <Typography variant="body1" paragraph>
              Your continued use of our Services after such changes constitutes
              your acceptance of the updated Privacy Policy.
            </Typography>
          </section>

          {/* Contact Information */}
          <section>
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
              15. Contact Us
            </Typography>
            <Typography variant="body1" paragraph>
              If you have any questions, concerns, or requests regarding this
              Privacy Policy or our data practices, please contact us:
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Typography variant="body1" paragraph>
                <strong>Neram Classes - Privacy Team</strong>
              </Typography>
              <Typography variant="body1">
                Email: privacy@neramclasses.com
              </Typography>
              <Typography variant="body1">
                Support: support@neramclasses.com
              </Typography>
              <Typography variant="body1">
                Data Protection Officer: dpo@neramclasses.com
              </Typography>
              <Typography variant="body1" paragraph>
                Address: [Your Business Address]
              </Typography>
            </Box>
            <Typography variant="body1" paragraph>
              We will respond to your inquiry within 30 days or as required by
              applicable law.
            </Typography>
          </section>

          {/* Acknowledgment */}
          <section>
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
              16. Your Consent
            </Typography>
            <Typography variant="body1" paragraph>
              BY USING OUR SERVICES, YOU ACKNOWLEDGE THAT YOU HAVE READ AND
              UNDERSTOOD THIS PRIVACY POLICY AND CONSENT TO THE COLLECTION, USE,
              AND DISCLOSURE OF YOUR INFORMATION AS DESCRIBED HEREIN.
            </Typography>
          </section>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary" paragraph>
            For our Terms and Conditions, please visit:{" "}
            <Link href="/terms" color="primary" underline="hover">
              Terms and Conditions
            </Link>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Neram Classes. All rights reserved.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
