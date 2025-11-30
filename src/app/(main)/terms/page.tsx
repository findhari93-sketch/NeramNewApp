import React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Link from "@mui/material/Link";
import Divider from "@mui/material/Divider";
import Footer from "../../components/shared/Footer/footer";
import HeroWaves from "../homepage/sections/Hero/HeroWaves";

export const metadata = {
  title: "Terms and Conditions - Neram Classes",
  description: "Terms and Conditions for Neram Classes educational platform",
};

export default function TermsPage() {
  return (
    <>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Paper elevation={2} sx={{ p: { xs: 3, md: 5 } }}>
          <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
            Terms and Conditions
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Last Updated: November 25, 2024
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ "& > *": { mb: 3 } }}>
            {/* Introduction */}
            <section>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                fontWeight={600}
              >
                1. Introduction
              </Typography>
              <Typography variant="body1" paragraph>
                Welcome to Neram Classes (&quot;we,&quot; &quot;our,&quot; or
                &quot;us&quot;). These Terms and Conditions (&quot;Terms&quot;)
                govern your access to and use of our educational platform,
                website, mobile applications, and related services
                (collectively, the &quot;Services&quot;).
              </Typography>
              <Typography variant="body1" paragraph>
                By accessing or using our Services, you agree to be bound by
                these Terms. If you do not agree to these Terms, please do not
                use our Services.
              </Typography>
            </section>

            {/* Account Registration */}
            <section>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                fontWeight={600}
              >
                2. Account Registration
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>2.1 Eligibility:</strong> You must be at least 13 years
                old to create an account. If you are under 18, you represent
                that you have your parent or guardian&apos;s permission to use
                the Services.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>2.2 Account Information:</strong> You agree to provide
                accurate, current, and complete information during registration
                and to update such information to keep it accurate, current, and
                complete.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>2.3 Account Security:</strong> You are responsible for
                maintaining the confidentiality of your account credentials and
                for all activities that occur under your account.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>2.4 Authentication Methods:</strong> We support multiple
                authentication methods including email/password and Google
                Sign-In. Phone verification may be required for certain
                features.
              </Typography>
            </section>

            {/* Use of Services */}
            <section>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                fontWeight={600}
              >
                3. Use of Services
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>3.1 License:</strong> Subject to these Terms, we grant
                you a limited, non-exclusive, non-transferable, revocable
                license to access and use our Services for personal,
                non-commercial educational purposes.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>3.2 Acceptable Use:</strong> You agree not to:
              </Typography>
              <Box component="ul" sx={{ pl: 4, mb: 2 }}>
                <li>
                  <Typography variant="body1">
                    Use the Services for any illegal purpose or in violation of
                    any laws
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    Share your account credentials with others
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    Reproduce, distribute, or commercially exploit our content
                    without permission
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    Attempt to gain unauthorized access to our systems or
                    networks
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    Interfere with or disrupt the Services or servers
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    Use automated systems (bots, scrapers) without permission
                  </Typography>
                </li>
              </Box>
            </section>

            {/* Course Content and Materials */}
            <section>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                fontWeight={600}
              >
                4. Course Content and Materials
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>4.1 Ownership:</strong> All course materials, including
                but not limited to videos, PDFs, Q&A documents, tests, and other
                content, are owned by Neram Classes or our licensors and are
                protected by copyright and other intellectual property laws.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>4.2 Limited Use:</strong> Course materials are provided
                for your personal, educational use only. You may not copy,
                distribute, transmit, display, perform, reproduce, publish,
                license, create derivative works from, or sell any content
                without our prior written consent.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>4.3 Free Access:</strong> Some materials may be provided
                free of charge. Free access does not grant any ownership rights
                to the content.
              </Typography>
            </section>

            {/* Payments and Refunds */}
            <section>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                fontWeight={600}
              >
                5. Payments and Refunds
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>5.1 Pricing:</strong> Prices for paid courses and
                services are displayed in Indian Rupees (INR) and are subject to
                change without notice.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>5.2 Payment Methods:</strong> We accept payments through
                various methods as displayed on our platform. All payments are
                processed securely through our payment partners.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>5.3 Refund Policy:</strong> Refunds are considered on a
                case-by-case basis. Please contact our support team at
                support@neramclasses.com within 7 days of purchase to request a
                refund.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>5.4 No Refunds:</strong> Digital content that has been
                accessed or downloaded is generally not eligible for refunds
                unless required by law.
              </Typography>
            </section>

            {/* User Conduct */}
            <section>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                fontWeight={600}
              >
                6. User Conduct and Community Guidelines
              </Typography>
              <Typography variant="body1" paragraph>
                You agree to interact respectfully with other users and
                instructors. We reserve the right to remove content or suspend
                accounts that violate our community guidelines, including but
                not limited to:
              </Typography>
              <Box component="ul" sx={{ pl: 4, mb: 2 }}>
                <li>
                  <Typography variant="body1">
                    Harassment, bullying, or threatening behavior
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    Posting offensive, discriminatory, or hateful content
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    Sharing inappropriate or explicit material
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    Spamming or posting unsolicited advertisements
                  </Typography>
                </li>
              </Box>
            </section>

            {/* Intellectual Property */}
            <section>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                fontWeight={600}
              >
                7. Intellectual Property Rights
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>7.1 Our Rights:</strong> All rights, title, and interest
                in and to the Services, including all intellectual property
                rights, are and will remain the exclusive property of Neram
                Classes and our licensors.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>7.2 Trademarks:</strong> Neram Classes and our logos are
                trademarks of Neram Classes. You may not use our trademarks
                without our prior written permission.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>7.3 Feedback:</strong> If you provide feedback or
                suggestions about our Services, we may use such feedback without
                any obligation to you.
              </Typography>
            </section>

            {/* Privacy and Data Protection */}
            <section>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                fontWeight={600}
              >
                8. Privacy and Data Protection
              </Typography>
              <Typography variant="body1" paragraph>
                Your privacy is important to us. Please review our{" "}
                <Link href="/privacy" color="primary" underline="hover">
                  Privacy Policy
                </Link>{" "}
                to understand how we collect, use, and protect your personal
                information.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>8.1 Data Collection:</strong> We collect information you
                provide directly, information collected automatically, and
                information from third-party sources as described in our Privacy
                Policy.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>8.2 Communications:</strong> By creating an account, you
                agree to receive communications from us via email, SMS, or
                WhatsApp related to your courses, account, and our Services.
              </Typography>
            </section>

            {/* reCAPTCHA Disclosure */}
            <section>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                fontWeight={600}
              >
                9. Security and reCAPTCHA
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>9.1 Account Security:</strong> We implement various
                security measures to protect your account and personal
                information.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>9.2 reCAPTCHA Protection:</strong> This site is
                protected by reCAPTCHA and the Google{" "}
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
                apply. We use reCAPTCHA to protect our Services from spam and
                abuse, particularly during phone verification and authentication
                processes.
              </Typography>
            </section>

            {/* Disclaimers */}
            <section>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                fontWeight={600}
              >
                10. Disclaimers and Limitations of Liability
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>10.1 &quot;AS IS&quot; Basis:</strong> THE SERVICES ARE
                PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot;
                BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>10.2 No Guarantee of Results:</strong> While we strive
                to provide high-quality educational content, we do not guarantee
                any specific results, exam scores, or outcomes from using our
                Services.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>10.3 Limitation of Liability:</strong> TO THE MAXIMUM
                EXTENT PERMITTED BY LAW, NERAM CLASSES SHALL NOT BE LIABLE FOR
                ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
                DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>10.4 Third-Party Content:</strong> We are not
                responsible for any third-party content, websites, or services
                linked from our platform.
              </Typography>
            </section>

            {/* Service Availability */}
            <section>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                fontWeight={600}
              >
                11. Service Availability and Modifications
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>11.1 Availability:</strong> We strive to maintain 24/7
                availability but do not guarantee uninterrupted access to our
                Services. We may experience downtime for maintenance or
                technical issues.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>11.2 Modifications:</strong> We reserve the right to
                modify, suspend, or discontinue any part of our Services at any
                time without notice.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>11.3 Updates:</strong> We may update course content,
                features, and functionality to improve your experience.
              </Typography>
            </section>

            {/* Termination */}
            <section>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                fontWeight={600}
              >
                12. Termination
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>12.1 By You:</strong> You may terminate your account at
                any time by contacting our support team or using the account
                deletion feature if available.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>12.2 By Us:</strong> We reserve the right to suspend or
                terminate your account if you violate these Terms or engage in
                fraudulent, abusive, or illegal activity.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>12.3 Effect of Termination:</strong> Upon termination,
                your right to access the Services will immediately cease. We may
                delete your account data subject to our data retention policies.
              </Typography>
            </section>

            {/* Indemnification */}
            <section>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                fontWeight={600}
              >
                13. Indemnification
              </Typography>
              <Typography variant="body1" paragraph>
                You agree to indemnify, defend, and hold harmless Neram Classes,
                its officers, directors, employees, and agents from any claims,
                liabilities, damages, losses, and expenses arising out of or in
                any way connected with your access to or use of the Services or
                your violation of these Terms.
              </Typography>
            </section>

            {/* Governing Law */}
            <section>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                fontWeight={600}
              >
                14. Governing Law and Dispute Resolution
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>14.1 Governing Law:</strong> These Terms shall be
                governed by and construed in accordance with the laws of India,
                without regard to its conflict of law provisions.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>14.2 Jurisdiction:</strong> Any disputes arising out of
                or relating to these Terms or the Services shall be subject to
                the exclusive jurisdiction of the courts located in [Your City,
                State], India.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>14.3 Dispute Resolution:</strong> Before filing any
                formal legal action, you agree to attempt to resolve any dispute
                informally by contacting us at legal@neramclasses.com.
              </Typography>
            </section>

            {/* Changes to Terms */}
            <section>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                fontWeight={600}
              >
                15. Changes to These Terms
              </Typography>
              <Typography variant="body1" paragraph>
                We reserve the right to modify these Terms at any time. We will
                notify you of any material changes by posting the updated Terms
                on our website and updating the &quot;Last Updated&quot; date.
                Your continued use of the Services after such changes
                constitutes your acceptance of the new Terms.
              </Typography>
            </section>

            {/* Contact Information */}
            <section>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                fontWeight={600}
              >
                16. Contact Information
              </Typography>
              <Typography variant="body1" paragraph>
                If you have any questions about these Terms, please contact us
                at:
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body1" paragraph>
                  <strong>Neram Classes</strong>
                </Typography>
                <Typography variant="body1">
                  Email: support@neramclasses.com
                </Typography>
                <Typography variant="body1">
                  Legal: legal@neramclasses.com
                </Typography>
                <Typography variant="body1" paragraph>
                  Address: [Your Business Address]
                </Typography>
              </Box>
            </section>

            {/* Additional Provisions */}
            <section>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                fontWeight={600}
              >
                17. General Provisions
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>17.1 Entire Agreement:</strong> These Terms constitute
                the entire agreement between you and Neram Classes regarding
                your use of the Services.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>17.2 Severability:</strong> If any provision of these
                Terms is found to be invalid or unenforceable, the remaining
                provisions will remain in full force and effect.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>17.3 Waiver:</strong> Our failure to enforce any right
                or provision of these Terms will not be deemed a waiver of such
                right or provision.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>17.4 Assignment:</strong> You may not assign or transfer
                these Terms without our prior written consent. We may assign our
                rights and obligations without restriction.
              </Typography>
            </section>

            {/* Acknowledgment */}
            <section>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                fontWeight={600}
              >
                18. Acknowledgment
              </Typography>
              <Typography variant="body1" paragraph>
                BY USING OUR SERVICES, YOU ACKNOWLEDGE THAT YOU HAVE READ,
                UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS AND CONDITIONS.
              </Typography>
            </section>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} Neram Classes. All rights reserved.
            </Typography>
          </Box>
        </Paper>
      </Container>

      {/* Footer Section */}
      <Box sx={{ position: "relative", mt: 8 }}>
        <HeroWaves position="top" bgcolor="#fff" />
        <Footer />
      </Box>
    </>
  );
}
