"use client";
import React from "react";
import styled from "@emotion/styled";
import FooterCard from "./Childrens/infocard";
import AboutUs from "./aboutus";

// Lightweight fallback Copyright block
const CopyRight: React.FC = () => (
  <div style={{ textAlign: "center", paddingTop: 16, fontSize: 12 }}>
    © {new Date().getFullYear()} Neram Classes. All rights reserved.
  </div>
);

const FooterSection = styled.footer`
  background-image: linear-gradient(
    90deg,
    #2b2d4e 1.557291666666667%,
    #e1148b 101.34895833333333%
  );
  padding: 0 0 30px 0;
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
        Title: "Exams",
        set1: [
          { text: "NATA", url: "#" },
          { text: "JEE-PAPER-2", url: "#" },
          { text: "JEEMAINS-2", url: "#" },
          { text: "JEE-ARCH", url: "#" },
          { text: "UCEED", url: "#" },
          { text: "NIFT", url: "#" },
          { text: "NID", url: "#" },
          { text: "AAT", url: "#" },
        ],
      },
      {
        Title: "qUESTIONS",
        set1: [
          { text: "NATA-DRAWING", url: "#" },
          { text: "NATA-QUESTION", url: "#" },
          { text: "NID-2020", url: "#" },
          { text: "NIFT-2022", url: "#" },
          { text: "ARCHITECTURE", url: "#" },
          { text: "NATA-ONLINE", url: "#" },
        ],
      },
    ],
    [
      {
        Title: "Syllabus",
        set1: [
          { text: "NATA-Syllabus", url: "#" },
          { text: "NID-Syllabus", url: "#" },
          { text: "NIFT-Syllabus", url: "#" },
          { text: "JEE-Paper-2", url: "#" },
          { text: "NATA-Online", url: "#" },
        ],
      },
      {
        Title: "Questions",
        set1: [
          { text: "NATA Aptitude", url: "#" },
          { text: "Jee 2 Aptitude", url: "#" },
          { text: "Aptitude Class", url: "#" },
          { text: "Nata paper 2", url: "#" },
          { text: "Jee Paper 2", url: "#" },
          { text: "Nata book", url: "#" },
          { text: "Nata e book", url: "#" },
          { text: "Question Nata", url: "#" },
          { text: "Best Nata", url: "#" },
        ],
      },
    ],
    [
      {
        Title: "Neram",
        set1: [
          { text: "About-us", url: "#" },
          { text: "Centers", url: "#" },
          { text: "results", url: "#" },
          { text: "NATA-app", url: "#" },
          { text: "team", url: "#" },
        ],
      },
      {
        Title: "City",
        set1: [
          { text: "Chennai", url: "#" },
          { text: "Madurai", url: "#" },
          { text: "Coimbatore", url: "#" },
          { text: "Trichy", url: "#" },
          { text: "Salem", url: "#" },
          { text: "Erode", url: "#" },
          { text: "Tiruppur", url: "#" },
          { text: "Vellore", url: "#" },
          { text: "Pondicherry", url: "#" },
        ],
      },
    ],
    [
      {
        Title: "Neram",
        set1: [
          { text: "Tamilnadu", url: "#" },
          { text: "Kerala", url: "#" },
          { text: "Andhrapradesh", url: "#" },
          { text: "Karnataka", url: "#" },
          { text: "Maharastra", url: "#" },
          { text: "Madhya pradesh", url: "#" },
          { text: "Telungana", url: "#" },
          { text: "Delhi", url: "#" },
        ],
      },
      {
        Title: "Nata IN",
        set1: [
          { text: "MUMBAI", url: "#" },
          { text: "COCHIN", url: "#" },
          { text: "TRIVANDRAM", url: "#" },
          { text: "HYDERABAD", url: "#" },
          { text: "VIZAG", url: "#" },
          { text: "BANGALORE", url: "#" },
        ],
      },
    ],
    [
      {
        Title: "COACHING IN",
        set1: [
          { text: "DINDIGUL", url: "#" },
          { text: "KANYAKUMARI", url: "#" },
          { text: "NAMAKKAL", url: "#" },
          { text: "PUDUKKOTTAI", url: "#" },
          { text: "KARAIKUDI", url: "#" },
          { text: "SIVAGANGAI", url: "#" },
          { text: "THANJAVUR", url: "#" },
          { text: "TIRUNELVELI", url: "#" },
          { text: "ANNA-NAGAR", url: "#" },
          { text: "PERAMBUR", url: "#" },
          { text: "TAMBARAM", url: "#" },
          { text: "THIRUVALLUR", url: "#" },
          { text: "UDUMALAPET", url: "#" },
          { text: "MALAPURAM", url: "#" },
          { text: "OOTY", url: "#" },
          { text: "KANCHIPURAM", url: "#" },
          { text: "PUDUKKOTTAI", url: "#" },
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
