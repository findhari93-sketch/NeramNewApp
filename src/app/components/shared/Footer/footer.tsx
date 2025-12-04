"use client";
import React from "react";
import styled from "@emotion/styled";
import FooterCard from "./Childrens/infocard";
import AboutUs from "./aboutus";
import { pt } from "zod/v4/locales";

// Lightweight fallback Copyright block
const CopyRight: React.FC = () => (
  <div style={{ textAlign: "center", paddingTop: 16, fontSize: 12 }}>
    <div style={{ marginBottom: 8 }}>
      © {new Date().getFullYear()} Neram Classes. All rights reserved.
    </div>
    <div style={{ fontSize: 10, opacity: 0.8 }}>
      This site is protected by reCAPTCHA and the Google{" "}
      <a
        href="https://policies.google.com/privacy"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#fffb01", textDecoration: "underline" }}
      >
        Privacy Policy
      </a>{" "}
      and{" "}
      <a
        href="https://policies.google.com/terms"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#fffb01", textDecoration: "underline" }}
      >
        Terms of Service
      </a>{" "}
      apply.
    </div>
  </div>
);

const FooterSection = styled.footer`
  background-image: linear-gradient(
    90deg,
    #2b2d4e 1.557291666666667%,
    #e1148b 101.34895833333333%
  );
  padding: 80px 30px 10px 30px;
  color: #fff;
  font-size: 11px;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  box-sizing: border-box;
  /* outer padding guards */
  padding-right: 16px;
  padding-left: 16px;
`;

// Centered max-width container
const Wrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding-top: 40px;
  width: 100%;
  box-sizing: border-box;
`;

const FooterInfo = styled.div`
  margin-bottom: 15px;
  color: #fff;
  border-top: 4px solid #fffb01;
  padding: 30px 20px;
  box-shadow: 12px 12px 16px 0 rgba(0, 0, 0, 0.25),
    -8px -8px 12px 0 rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  text-align: left;
  box-sizing: border-box;
  font-size: 12px;
  line-height: 24px;
  margin-bottom: 0;
  background: rgba(0, 0, 0, 0.05);
`;

// Two-column layout: left info card (fixed min width) + right links grid
const FooterLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;

  @media (min-width: 992px) {
    grid-template-columns: 1fr;
    align-items: start;
  }
`;

// Links grid: responsive number of columns with proper spacing
const LinksGrid = styled.div`
  display: grid;
  gap: 20px 16px;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  max-width: 100%;
  overflow-x: hidden;

  @media (min-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: 992px) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (min-width: 1200px) {
    grid-template-columns: repeat(5, 1fr);
  }
`;

const ColumnContainer = styled.div`
  display: flex;
  flex-direction: column;
  text-transform: uppercase;
  min-width: 0;
  word-wrap: break-word;
`;

const LinkDiv = styled.div``;

const LinkAtag = styled.a`
  color: #fff;
  transition: 0.3s;
  display: inline-block;
  text-decoration: none;
  line-height: 1;
  &:hover {
    color: var(--yellow);
    text-decoration: underline;
  }
`;

const Title = styled.h4`
  font-size: 13px;
  font-weight: 600;
  color: #fffb01;
  position: relative;
  text-transform: uppercase;
`;

type LinkItem = { text: string; url: string };
type ColumnData = { Title: string; set1: LinkItem[] };

const Column: React.FC<{ data: ColumnData[] }> = ({ data }) => {
  return (
    <ColumnContainer>
      {data.map((exam, index) => (
        <div key={index} className="mb-4">
          <Title className="d-md-flex d-block mb-3">{exam.Title}</Title>
          {exam.set1.map((link, linkIndex) => (
            <LinkDiv key={linkIndex} className="my-2 d-md-flex d-block">
              <LinkAtag href={link.url}>{link.text}</LinkAtag>
            </LinkDiv>
          ))}
        </div>
      ))}
    </ColumnContainer>
  );
};

const LinksColumns: React.FC = () => {
  const linkbuilding: ColumnData[][] = [
    [
      {
        Title: "Exam Preparation",
        set1: [
          { text: "NATA Preparation", url: "/nata-preparation-guide" },
          { text: "JEE Paper 2 Guide", url: "/jee-paper-2-preparation" },
          { text: "Best Books", url: "/best-books-nata-jee" },
          { text: "Previous Papers", url: "/previous-year-papers" },
          { text: "Score 150+ Guide", url: "/how-to-score-150-in-nata" },
          { text: "NATA Calculator", url: "/nata-cutoff-calculator" },
        ],
      },
      {
        Title: "Online Coaching",
        set1: [
          { text: "NATA Online Classes", url: "/coaching" },
          { text: "JEE B.Arch Coaching", url: "/coaching" },
          { text: "Drawing Classes", url: "/coaching" },
          { text: "Premium Courses", url: "/premium" },
          { text: "Free Study Material", url: "/freebooks" },
          { text: "Ask Seniors", url: "/askSeniors" },
        ],
      },
    ],
    [
      {
        Title: "Resources",
        set1: [
          {
            text: "NATA Syllabus 2025",
            url: "/nata-preparation-guide#syllabus",
          },
          {
            text: "JEE Paper 2 Syllabus",
            url: "/jee-paper-2-preparation#syllabus",
          },
          { text: "Drawing Techniques", url: "/best-books-nata-jee#drawing" },
          {
            text: "Mathematics Tips",
            url: "/nata-preparation-guide#mathematics",
          },
          { text: "Aptitude Practice", url: "/previous-year-papers" },
        ],
      },
      {
        Title: "About Neram",
        set1: [
          { text: "About Us", url: "/#about" },
          { text: "Our Results", url: "/#toppers" },
          { text: "Teaching Team", url: "/#team" },
          { text: "Student Reviews", url: "/#testimonials" },
          { text: "Privacy Policy", url: "/privacy" },
          { text: "Terms & Conditions", url: "/terms" },
        ],
      },
    ],
    [
      {
        Title: "Tamil Nadu (A-C)",
        set1: [
          { text: "Ariyalur", url: "/coaching/ariyalur" },
          { text: "Chengalpattu", url: "/coaching/chengalpattu" },
          { text: "Chennai", url: "/coaching/chennai" },
          { text: "Coimbatore", url: "/coaching/coimbatore" },
          { text: "Cuddalore", url: "/coaching/cuddalore" },
          { text: "Dharmapuri", url: "/coaching/dharmapuri" },
          { text: "Dindigul", url: "/coaching/dindigul" },
          { text: "Erode", url: "/coaching/erode" },
        ],
      },
      {
        Title: "Tamil Nadu (K-O)",
        set1: [
          { text: "Kallakurichi", url: "/coaching/kallakurichi" },
          { text: "Kancheepuram", url: "/coaching/kancheepuram" },
          { text: "Karur", url: "/coaching/karur" },
          { text: "Krishnagiri", url: "/coaching/krishnagiri" },
          { text: "Madurai", url: "/coaching/madurai" },
          { text: "Mayiladuthurai", url: "/coaching/mayiladuthurai" },
          { text: "Nagapattinam", url: "/coaching/nagapattinam" },
          { text: "Nagercoil", url: "/coaching/nagercoil" },
          { text: "Namakkal", url: "/coaching/namakkal" },
          { text: "Ooty", url: "/coaching/ooty" },
        ],
      },
    ],
    [
      {
        Title: "Tamil Nadu (P-T)",
        set1: [
          { text: "Perambalur", url: "/coaching/perambalur" },
          { text: "Pudukkottai", url: "/coaching/pudukkottai" },
          { text: "Ramanathapuram", url: "/coaching/ramanathapuram" },
          { text: "Ranipet", url: "/coaching/ranipet" },
          { text: "Salem", url: "/coaching/salem" },
          { text: "Sivaganga", url: "/coaching/sivaganga" },
          { text: "Tenkasi", url: "/coaching/tenkasi" },
          { text: "Thanjavur", url: "/coaching/thanjavur" },
          { text: "Theni", url: "/coaching/theni" },
          { text: "Thiruvallur", url: "/coaching/thiruvallur" },
        ],
      },
      {
        Title: "Tamil Nadu (T-V)",
        set1: [
          { text: "Thiruvarur", url: "/coaching/thiruvarur" },
          { text: "Thoothukudi", url: "/coaching/thoothukudi" },
          { text: "Tirunelveli", url: "/coaching/tirunelveli" },
          { text: "Tirupathur", url: "/coaching/tirupathur" },
          { text: "Tiruppur", url: "/coaching/tiruppur" },
          { text: "Tiruvannamalai", url: "/coaching/tiruvannamalai" },
          { text: "Trichy", url: "/coaching/trichy" },
          { text: "Vellore", url: "/coaching/vellore" },
          { text: "Viluppuram", url: "/coaching/viluppuram" },
          { text: "Virudhunagar", url: "/coaching/virudhunagar" },
        ],
      },
    ],
    [
      {
        Title: "Karnataka (A-D)",
        set1: [
          { text: "Bagalkote", url: "/coaching/bagalkote" },
          { text: "Bangalore", url: "/coaching/bangalore" },
          { text: "Belgaum", url: "/coaching/belgaum" },
          { text: "Bellary", url: "/coaching/bellary" },
          { text: "Bengaluru Rural", url: "/coaching/bengaluru-rural" },
          { text: "Bidar", url: "/coaching/bidar" },
          { text: "Bijapur", url: "/coaching/bijapur" },
          { text: "Chamarajanagar", url: "/coaching/chamarajanagar" },
          { text: "Chikkaballapura", url: "/coaching/chikkaballapura" },
          { text: "Chikkamagaluru", url: "/coaching/chikkamagaluru" },
          { text: "Chitradurga", url: "/coaching/chitradurga" },
          { text: "Davanagere", url: "/coaching/davanagere" },
          { text: "Dharwad", url: "/coaching/dharwad" },
        ],
      },
      {
        Title: "Karnataka (G-Y)",
        set1: [
          { text: "Gadag", url: "/coaching/gadag" },
          { text: "Gulbarga", url: "/coaching/gulbarga" },
          { text: "Hassan", url: "/coaching/hassan" },
          { text: "Haveri", url: "/coaching/haveri" },
          { text: "Hubli", url: "/coaching/hubli" },
          { text: "Karwar", url: "/coaching/karwar" },
          { text: "Kodagu", url: "/coaching/kodagu" },
          { text: "Kolar", url: "/coaching/kolar" },
          { text: "Koppal", url: "/coaching/koppal" },
          { text: "Mandya", url: "/coaching/mandya" },
          { text: "Mangalore", url: "/coaching/mangalore" },
          { text: "Mysore", url: "/coaching/mysore" },
          { text: "Raichur", url: "/coaching/raichur" },
          { text: "Ramanagara", url: "/coaching/ramanagara" },
          { text: "Shimoga", url: "/coaching/shimoga" },
          { text: "Tumkur", url: "/coaching/tumkur" },
          { text: "Udupi", url: "/coaching/udupi" },
          { text: "Vijayanagara", url: "/coaching/vijayanagara" },
          { text: "Yadgir", url: "/coaching/yadgir" },
        ],
      },
    ],
    [
      {
        Title: "UAE & Qatar",
        set1: [
          { text: "Abu Dhabi", url: "/coaching/abu-dhabi" },
          { text: "Ajman", url: "/coaching/ajman" },
          { text: "Al Khor", url: "/coaching/al-khor" },
          { text: "Al Wakrah", url: "/coaching/al-wakrah" },
          { text: "Doha", url: "/coaching/doha" },
          { text: "Dubai", url: "/coaching/dubai" },
          { text: "Dukhan", url: "/coaching/dukhan" },
          { text: "Fujairah", url: "/coaching/fujairah" },
          { text: "Lusail", url: "/coaching/lusail" },
          { text: "Mesaieed", url: "/coaching/mesaieed" },
          { text: "Ras Al Khaimah", url: "/coaching/ras-al-khaimah" },
          { text: "Sharjah", url: "/coaching/sharjah" },
          { text: "Umm Salal", url: "/coaching/umm-salal" },
        ],
      },
      {
        Title: "Oman & Saudi",
        set1: [
          { text: "Al Ahsa", url: "/coaching/al-ahsa" },
          { text: "Al Khobar", url: "/coaching/al-khobar" },
          { text: "Dammam", url: "/coaching/dammam" },
          { text: "Ibri", url: "/coaching/ibri" },
          { text: "Jeddah", url: "/coaching/jeddah" },
          { text: "Jubail", url: "/coaching/jubail" },
          { text: "Madinah", url: "/coaching/madinah" },
          { text: "Makkah", url: "/coaching/makkah" },
          { text: "Muscat", url: "/coaching/muscat" },
          { text: "Nizwa", url: "/coaching/nizwa" },
          { text: "Riyadh", url: "/coaching/riyadh" },
          { text: "Ruwi", url: "/coaching/ruwi" },
          { text: "Salalah", url: "/coaching/salalah" },
          { text: "Seeb", url: "/coaching/seeb" },
          { text: "Sohar", url: "/coaching/sohar" },
          { text: "Sur", url: "/coaching/sur" },
          { text: "Yanbu", url: "/coaching/yanbu" },
        ],
      },
    ],
    [
      {
        Title: "Kuwait & Bahrain",
        set1: [
          { text: "Ahmadi", url: "/coaching/ahmadi" },
          { text: "Fahaheel", url: "/coaching/fahaheel" },
          { text: "Farwaniya", url: "/coaching/farwaniya" },
          { text: "Hawally", url: "/coaching/hawally" },
          { text: "Isa Town", url: "/coaching/isa-town" },
          { text: "Kuwait City", url: "/coaching/kuwait-city" },
          { text: "Manama", url: "/coaching/manama" },
          { text: "Mangaf", url: "/coaching/mangaf" },
          { text: "Muharraq", url: "/coaching/muharraq" },
          { text: "Riffa", url: "/coaching/riffa" },
          { text: "Salmiya", url: "/coaching/salmiya" },
          { text: "Sitra", url: "/coaching/sitra" },
        ],
      },
    ],
  ];

  return (
    <LinksGrid>
      {linkbuilding.map((columnData, index) => (
        <Column key={index} data={columnData} />
      ))}
    </LinksGrid>
  );
};

const NeramFooter: React.FC = () => {
  return (
    <FooterSection id="content-wrapper-with-footer">
      <Wrapper>
        <FooterLayout>
          <FooterInfo>
            <FooterCard />
          </FooterInfo>
          <LinksColumns />
        </FooterLayout>
        <div style={{ margin: "16px 0" }}>
          <hr />
        </div>
        <AboutUs />
        <div className="footersec2" />
        <CopyRight />
      </Wrapper>
    </FooterSection>
  );
};

export default NeramFooter;
