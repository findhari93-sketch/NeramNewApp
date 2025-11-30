"use client";
import React from "react";
import { Typography, Box } from "@mui/material";
import styled from "@emotion/styled";

const YellowHR = styled.div`
  h5 {
    color: var(--yellow);
    font-weight: 600;
    font-size: 16px;
    margin-bottom: 12px;
  }
  h6 {
    color: #fff;
    font-weight: 500;
    font-size: 13px;
    margin-top: 16px;
    margin-bottom: 8px;
  }
`;

const SEOSection = styled(Box)`
  margin-bottom: 24px;
  line-height: 1.8;
`;

const AboutUs: React.FC = () => {
  return (
    <YellowHR>
      {/* Primary About Section - Brand Introduction */}
      <SEOSection>
        <Typography variant="h5" component="h2">
          Best NATA & JEE B.Arch Online Coaching in India
        </Typography>
        <Typography variant="caption" component="p">
          Neram Academy is India&apos;s leading online coaching institute for NATA (National Aptitude Test in Architecture) and JEE Paper 2 (B.Arch).
          Established in 2017 by alumni from IITs, NITs, SPA Delhi, and Anna University, we&apos;ve achieved a 100% success rate with students
          securing top ranks including <strong>All India Rank 1 in JEE B.Arch 2024</strong> and <strong>NATA Rank 1 (187/200) in 2020</strong>.
          Our architecture entrance coaching serves students across Tamil Nadu, Karnataka, Kerala, and UAE through live online classes and recorded sessions.
        </Typography>
      </SEOSection>

      {/* Location-Based SEO Section */}
      <SEOSection>
        <Typography variant="h5" component="h2">
          Architecture Entrance Coaching Across India & UAE
        </Typography>
        <Typography variant="h6" component="h3">
          Tamil Nadu NATA Coaching Centers
        </Typography>
        <Typography variant="caption" component="p">
          We provide specialized NATA and JEE B.Arch coaching in <strong>Chennai, Madurai, Coimbatore, Trichy, Salem, Erode, Tiruppur, 
          Vellore, Pudukkottai, Thanjavur, Dindigul, Kanchipuram, and Pondicherry</strong>. Our Tamil Nadu students have secured 
          admissions in NIT Trichy, Anna University CEG, CEPT Ahmedabad, and top architecture colleges across South India.
        </Typography>
        
        <Typography variant="h6" component="h3">
          Karnataka & Kerala Architecture Coaching
        </Typography>
        <Typography variant="caption" component="p">
          Students from <strong>Bangalore, Mysore, Mangalore, Hubli, Kochi, Trivandrum, and Calicut</strong> join our online NATA coaching 
          programs. We help Karnataka and Kerala students prepare for both NATA and KCET/KEAM architecture entrance exams with 
          state-specific guidance and college counseling.
        </Typography>

        <Typography variant="h6" component="h3">
          UAE & International Students
        </Typography>
        <Typography variant="caption" component="p">
          Neram Academy serves NRI students across <strong>Dubai, Abu Dhabi, Sharjah, Doha, Muscat, Riyadh, and Kuwait</strong>. 
          Our flexible online coaching schedules accommodate Middle East time zones, helping international students prepare for 
          NATA and secure admissions in Indian architecture colleges.
        </Typography>
      </SEOSection>

      {/* Course & Exam Coverage */}
      <SEOSection>
        <Typography variant="h5" component="h2">
          Complete Architecture Entrance Exam Preparation
        </Typography>
        <Typography variant="caption" component="p">
          <strong>NATA Coaching:</strong> Drawing test preparation, general aptitude, mathematics, logical reasoning, and aesthetic sensitivity training.
          <br />
          <strong>JEE Main Paper 2 (B.Arch):</strong> Mathematics, aptitude, drawing skills, and problem-solving techniques.
          <br />
          <strong>Additional Exams:</strong> JEE Advanced AAT, UCEED, NID, NIFT entrance preparation for architecture and design streams.
        </Typography>
      </SEOSection>

      {/* Teaching Methodology - Competitive Edge */}
      <SEOSection>
        <Typography variant="h5" component="h2">
          Why Neram Academy Ranks #1 for NATA Online Coaching
        </Typography>
        <Typography variant="caption" component="p">
           <strong>100% Success Rate:</strong> Every student clears NATA and JEE B.Arch with qualifying scores
          <br />
           <strong>Top Rankers:</strong> All India Rank 1 in JEE B.Arch 2024, NATA 187/200 (2020), 99.99 percentile holders
          <br />
           <strong>Expert Faculty:</strong> Practicing architects from IIT, NIT, SPA, with UK & Australia education backgrounds
          <br />
           <strong>Live + Recorded Classes:</strong> Interactive online sessions with 24/7 doubt clearing and personalized mentoring
          <br />
           <strong>Realistic Mock Tests:</strong> NATA and JEE-style practice papers with instant evaluation and feedback
          <br />
           <strong>Drawing Evaluation:</strong> Online portfolio reviews, sketch critiques, and perspective drawing sessions
          <br />
           <strong>Affordable Fees:</strong> Budget-friendly architecture coaching with flexible payment options and scholarships
        </Typography>
      </SEOSection>

      {/* College Placement Results */}
      <SEOSection>
        <Typography variant="h5" component="h2">
          Top Architecture College Admissions (2020-2025)
        </Typography>
        <Typography variant="caption" component="p">
          Our students have secured seats in <strong>NIT Trichy, NIT Calicut, CEPT University Ahmedabad, SPA Delhi, SPA Bhopal, 
          Anna University CEG Chennai, Jadavpur University, MANIT Bhopal, and 50+ NAAC A+ architecture colleges</strong> across India. 
          Over 60% of our alumni are studying in government-funded NITs and state universities with merit scholarships.
        </Typography>
      </SEOSection>

      {/* Technology & Learning Platform */}
      <SEOSection>
        <Typography variant="h5" component="h2">
          Advanced Online Learning Platform for NATA 2025
        </Typography>
        <Typography variant="caption" component="p">
          Our cloud-based NATA coaching platform includes live whiteboard sessions, digital drawing pad integration, AI-powered 
          doubt solving, personalized study plans, progress tracking dashboards, mobile app access, and downloadable NATA previous 
          year papers (2015-2024). Students get lifetime access to recorded lectures and study materials even after exam completion.
        </Typography>
      </SEOSection>

      {/* Call-to-Action Footer Note */}
      <SEOSection>
        <Typography variant="caption" component="p" sx={{ fontStyle: 'italic', opacity: 0.9 }}>
          <strong>Join 5000+ architecture aspirants</strong> who trust Neram Academy for NATA and JEE B.Arch preparation. 
          Free demo classes available for Chennai, Bangalore, Kochi, Dubai, and all online students. 
          Enroll now for NATA 2025 batch with early bird discounts.
        </Typography>
      </SEOSection>
    </YellowHR>
  );
};

export default AboutUs;
