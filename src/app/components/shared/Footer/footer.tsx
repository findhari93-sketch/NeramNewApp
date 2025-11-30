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
  /* outer padding guards */
  padding-right: 16px;
  padding-left: 16px;
`;

// Centered max-width container
const Wrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 40px;
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
    grid-template-columns: 380px 1fr;
    align-items: start;
  }
`;

// Links grid: responsive number of columns
const LinksGrid = styled.div`
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(2, minmax(140px, 1fr));

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, minmax(140px, 1fr));
  }

  @media (min-width: 992px) {
    grid-template-columns: repeat(5, minmax(140px, 1fr));
  }
`;

const ColumnContainer = styled.div`
  display: flex;
  flex-direction: column;
  text-transform: uppercase;
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
        Title: "Tamil Nadu Cities",
        set1: [
          { text: "NATA Coaching Chennai", url: "/coaching/chennai" },
          { text: "NATA Coaching Madurai", url: "/coaching/madurai" },
          {
            text: "NATA Coaching Coimbatore",
            url: "/coaching/coimbatore",
          },
          { text: "NATA Coaching Trichy", url: "/coaching/trichy" },
          { text: "NATA Coaching Salem", url: "/coaching/salem" },
          { text: "NATA Coaching Erode", url: "/coaching/erode" },
          { text: "NATA Coaching Tiruppur", url: "/coaching/tiruppur" },
          { text: "NATA Coaching Vellore", url: "/coaching/vellore" },
          {
            text: "Architecture Coaching Pondicherry",
            url: "/coaching/pondicherry",
          },
        ],
      },
    ],
    [
      {
        Title: "Major Cities",
        set1: [
          { text: "NATA Coaching Mumbai", url: "/coaching/mumbai" },
          { text: "NATA Coaching Bangalore", url: "/coaching/bangalore" },
          { text: "NATA Coaching Hyderabad", url: "/coaching/hyderabad" },
          { text: "NATA Coaching Delhi", url: "/coaching/delhi" },
          { text: "NATA Coaching Kochi", url: "/coaching/kochi" },
          {
            text: "NATA Coaching Trivandrum",
            url: "/coaching/trivandrum",
          },
          { text: "JEE Coaching Vizag", url: "/coaching/vizag" },
          { text: "Architecture Coaching Pune", url: "/coaching/pune" },
        ],
      },
      {
        Title: "More Locations",
        set1: [
          { text: "Dindigul", url: "/coaching/dindigul" },
          { text: "Kanyakumari", url: "/coaching/kanyakumari" },
          { text: "Namakkal", url: "/coaching/namakkal" },
          { text: "Thanjavur", url: "/coaching/thanjavur" },
          { text: "Tirunelveli", url: "/coaching/tirunelveli" },
          { text: "Karaikudi", url: "/coaching/karaikudi" },
          { text: "Kanchipuram", url: "/coaching/kanchipuram" },
          { text: "All Locations", url: "/coaching" },
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
