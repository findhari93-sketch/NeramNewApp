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
  title: "Refund & Cancellation Policy - Neram Classes",
  description:
    "Refund and Cancellation Policy for Neram Classes educational platform. Learn about our refund process, eligibility, and timelines.",
};

export default function RefundPolicyPage() {
  return (
    <>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Paper elevation={2} sx={{ p: { xs: 3, md: 5 } }}>
          <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
            Refund & Cancellation Policy
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Last Updated: December 8, 2025
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
                At Neram Classes (&quot;we,&quot; &quot;our,&quot; or
                &quot;us&quot;), we strive to provide high-quality educational
                services and ensure customer satisfaction. This Refund &
                Cancellation Policy outlines the terms and conditions for
                refunds and cancellations of our courses, subscriptions, and
                other educational services.
              </Typography>
              <Typography variant="body1" paragraph>
                By purchasing any of our services, you agree to the terms
                outlined in this policy. Please read this policy carefully
                before making any purchase.
              </Typography>
            </section>

            {/* Eligibility for Refunds */}
            <section>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                fontWeight={600}
              >
                2. Eligibility for Refunds
              </Typography>
              <Typography variant="body1" paragraph>
                Refunds may be considered under the following circumstances:
              </Typography>
              <Box component="ul" sx={{ pl: 4, mb: 2 }}>
                <li>
                  <Typography variant="body1">
                    <strong>Course Not Started:</strong> Full refund is
                    available if you request cancellation before the course
                    batch begins or within 7 days of enrollment, whichever is
                    earlier.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    <strong>Technical Issues:</strong> If you are unable to
                    access course content due to technical issues on our end
                    that cannot be resolved within a reasonable timeframe.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    <strong>Duplicate Payment:</strong> If you have been charged
                    multiple times for the same course or service due to a
                    payment processing error.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    <strong>Course Cancellation by Us:</strong> If we cancel a
                    course or batch due to insufficient enrollment or other
                    operational reasons.
                  </Typography>
                </li>
              </Box>
            </section>

            {/* Non-Refundable Items */}
            <section>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                fontWeight={600}
              >
                3. Non-Refundable Items
              </Typography>
              <Typography variant="body1" paragraph>
                The following are not eligible for refunds:
              </Typography>
              <Box component="ul" sx={{ pl: 4, mb: 2 }}>
                <li>
                  <Typography variant="body1">
                    <strong>Courses Already Started:</strong> Once a course
                    batch has started and you have accessed more than 20% of the
                    course content or attended more than 2 classes.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    <strong>Downloadable Materials:</strong> Digital study
                    materials, PDFs, e-books, or any downloadable content that
                    has been accessed or downloaded.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    <strong>Mock Tests & Assessments:</strong> Test series,
                    practice exams, or assessment packages once they have been
                    activated or attempted.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    <strong>Registration & Processing Fees:</strong> Any
                    one-time registration fees or processing charges are
                    non-refundable.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    <strong>Promotional/Discounted Courses:</strong> Courses
                    purchased during special promotions, flash sales, or with
                    discount coupons may have different or no refund eligibility
                    as mentioned at the time of purchase.
                  </Typography>
                </li>
              </Box>
            </section>

            {/* Refund Process */}
            <section>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                fontWeight={600}
              >
                4. Refund Process
              </Typography>
              <Typography variant="body1" paragraph>
                To request a refund, please follow these steps:
              </Typography>
              <Box component="ol" sx={{ pl: 4, mb: 2 }}>
                <li>
                  <Typography variant="body1" paragraph>
                    <strong>Submit a Request:</strong> Email us at{" "}
                    <Link
                      href="mailto:support@neramclasses.com"
                      color="primary"
                      underline="hover"
                    >
                      support@neramclasses.com
                    </Link>{" "}
                    with the subject line &quot;Refund Request - [Your Order
                    ID]&quot;.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1" paragraph>
                    <strong>Provide Details:</strong> Include your full name,
                    registered email/phone number, order ID, course name, reason
                    for refund, and any supporting documents.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1" paragraph>
                    <strong>Review Process:</strong> Our team will review your
                    request within 3-5 business days and may contact you for
                    additional information if needed.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1" paragraph>
                    <strong>Decision Communication:</strong> You will receive an
                    email notification about the approval or rejection of your
                    refund request with detailed reasoning.
                  </Typography>
                </li>
              </Box>
            </section>

            {/* Refund Timeline */}
            <section>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                fontWeight={600}
              >
                5. Refund Timeline
              </Typography>
              <Typography variant="body1" paragraph>
                Once your refund is approved:
              </Typography>
              <Box component="ul" sx={{ pl: 4, mb: 2 }}>
                <li>
                  <Typography variant="body1">
                    <strong>Processing Time:</strong> Refunds will be initiated
                    within 5-7 business days of approval.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    <strong>Credit/Debit Card:</strong> Refunds to credit/debit
                    cards may take 5-10 business days to reflect in your account
                    depending on your bank.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    <strong>UPI/Net Banking:</strong> Refunds via UPI or net
                    banking typically reflect within 3-5 business days.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    <strong>Wallet Payments:</strong> Refunds to digital wallets
                    may take 1-3 business days.
                  </Typography>
                </li>
              </Box>
              <Typography variant="body1" paragraph>
                Please note that refunds will be credited to the same payment
                method used for the original transaction unless otherwise
                specified.
              </Typography>
            </section>

            {/* Cancellation Policy */}
            <section>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                fontWeight={600}
              >
                6. Cancellation Policy
              </Typography>
              <Typography
                variant="h6"
                component="h3"
                gutterBottom
                fontWeight={600}
              >
                6.1 Cancellation by Students
              </Typography>
              <Box component="ul" sx={{ pl: 4, mb: 2 }}>
                <li>
                  <Typography variant="body1">
                    <strong>Before Course Start:</strong> You may cancel your
                    enrollment before the course begins for a full refund (minus
                    any applicable processing fees).
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    <strong>Within 7 Days of Enrollment:</strong> If you cancel
                    within 7 days of enrollment and before accessing more than
                    20% of the content, you are eligible for a refund.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    <strong>After 7 Days:</strong> Cancellation requests after 7
                    days of enrollment or after significant course access will
                    be reviewed on a case-by-case basis.
                  </Typography>
                </li>
              </Box>

              <Typography
                variant="h6"
                component="h3"
                gutterBottom
                fontWeight={600}
              >
                6.2 Cancellation by Neram Classes
              </Typography>
              <Typography variant="body1" paragraph>
                We reserve the right to cancel your enrollment or access to
                services under the following circumstances:
              </Typography>
              <Box component="ul" sx={{ pl: 4, mb: 2 }}>
                <li>
                  <Typography variant="body1">
                    Violation of our Terms and Conditions
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    Sharing login credentials or course materials with
                    unauthorized users
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    Engaging in fraudulent or illegal activities
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    Disruptive behavior affecting other students or instructors
                  </Typography>
                </li>
              </Box>
              <Typography variant="body1" paragraph>
                In case of cancellation due to policy violations, no refund will
                be provided.
              </Typography>
            </section>

            {/* Course Transfer */}
            <section>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                fontWeight={600}
              >
                7. Course Transfer & Rescheduling
              </Typography>
              <Typography variant="body1" paragraph>
                As an alternative to refunds, we offer:
              </Typography>
              <Box component="ul" sx={{ pl: 4, mb: 2 }}>
                <li>
                  <Typography variant="body1">
                    <strong>Batch Transfer:</strong> Transfer to a different
                    batch of the same course (subject to availability).
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    <strong>Course Credit:</strong> Convert your payment into
                    credit for future courses (valid for 12 months from the date
                    of issue).
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    <strong>Course Exchange:</strong> Switch to a different
                    course of equal or lesser value (difference is
                    non-refundable).
                  </Typography>
                </li>
              </Box>
              <Typography variant="body1" paragraph>
                Transfer requests must be made at least 48 hours before the
                course start date.
              </Typography>
            </section>

            {/* Partial Refunds */}
            <section>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                fontWeight={600}
              >
                8. Partial Refunds
              </Typography>
              <Typography variant="body1" paragraph>
                In certain situations, partial refunds may be granted:
              </Typography>
              <Box component="ul" sx={{ pl: 4, mb: 2 }}>
                <li>
                  <Typography variant="body1">
                    <strong>Medical Emergency:</strong> With valid medical
                    documentation, a prorated refund may be considered for
                    unused portion of the course.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    <strong>Relocation:</strong> If you relocate to an area
                    where our services are not accessible, partial refunds may
                    be considered.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    <strong>Service Disruption:</strong> If our services are
                    disrupted for an extended period due to circumstances within
                    our control.
                  </Typography>
                </li>
              </Box>
            </section>

            {/* Payment Methods */}
            <section>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                fontWeight={600}
              >
                9. Payment Methods
              </Typography>
              <Typography variant="body1" paragraph>
                We accept payments through the following methods via our payment
                partner Razorpay:
              </Typography>
              <Box component="ul" sx={{ pl: 4, mb: 2 }}>
                <li>
                  <Typography variant="body1">Credit/Debit Cards</Typography>
                </li>
                <li>
                  <Typography variant="body1">UPI (Google Pay, PhonePe, Paytm, etc.)</Typography>
                </li>
                <li>
                  <Typography variant="body1">Net Banking</Typography>
                </li>
                <li>
                  <Typography variant="body1">Digital Wallets</Typography>
                </li>
                <li>
                  <Typography variant="body1">EMI Options (subject to eligibility)</Typography>
                </li>
              </Box>
              <Typography variant="body1" paragraph>
                All payments are processed securely through Razorpay. We do not
                store your complete payment information on our servers.
              </Typography>
            </section>

            {/* Disputes */}
            <section>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                fontWeight={600}
              >
                10. Disputes & Chargebacks
              </Typography>
              <Typography variant="body1" paragraph>
                If you have a dispute regarding any charge, please contact us
                first at{" "}
                <Link
                  href="mailto:support@neramclasses.com"
                  color="primary"
                  underline="hover"
                >
                  support@neramclasses.com
                </Link>{" "}
                before initiating a chargeback with your bank or card provider.
                We are committed to resolving any issues promptly and fairly.
              </Typography>
              <Typography variant="body1" paragraph>
                Initiating a chargeback without first attempting to resolve the
                issue with us may result in suspension of your account and
                access to our services.
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
                11. Contact Us
              </Typography>
              <Typography variant="body1" paragraph>
                For any questions, concerns, or refund requests, please contact
                our support team:
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body1" paragraph>
                  <strong>Neram Classes - Support Team</strong>
                </Typography>
                <Typography variant="body1">
                  Email:{" "}
                  <Link
                    href="mailto:support@neramclasses.com"
                    color="primary"
                    underline="hover"
                  >
                    support@neramclasses.com
                  </Link>
                </Typography>
                <Typography variant="body1">
                  Phone:{" "}
                  <Link
                    href="tel:+919876543210"
                    color="primary"
                    underline="hover"
                  >
                    +91 98765 43210
                  </Link>
                </Typography>
                <Typography variant="body1" paragraph>
                  Support Hours: Monday to Saturday, 9:00 AM - 6:00 PM IST
                </Typography>
              </Box>
              <Typography variant="body1" paragraph>
                We aim to respond to all queries within 24-48 hours.
              </Typography>
            </section>

            {/* Policy Changes */}
            <section>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                fontWeight={600}
              >
                12. Changes to This Policy
              </Typography>
              <Typography variant="body1" paragraph>
                We reserve the right to modify this Refund & Cancellation Policy
                at any time. Changes will be effective immediately upon posting
                on our website. We encourage you to review this policy
                periodically. Your continued use of our services after any
                changes constitutes acceptance of the updated policy.
              </Typography>
            </section>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary" paragraph>
              For our Privacy Policy, please visit:{" "}
              <Link href="/privacy" color="primary" underline="hover">
                Privacy Policy
              </Link>
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              For our Terms and Conditions, please visit:{" "}
              <Link href="/terms" color="primary" underline="hover">
                Terms and Conditions
              </Link>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              &copy; {new Date().getFullYear()} Neram Classes. All rights reserved.
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
