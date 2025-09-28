export type AdvantageItem = {
  imageUrl: string;
  altText: string;
  name: string;
};

export const advantagesData: AdvantageItem[] = [
  {
    imageUrl: "/images/img/advantages/classes-icon.svg",
    altText: "Study from Alumni",
    name: `Study from Alumnus of
    IIT & NIT Architects`,
  },
  {
    imageUrl: "/images/img/advantages/self-paced-learning.svg",
    altText: "Self paced learning",
    name: `Watch missed Classes
    anytime`,
  },
  {
    imageUrl: "/images/img/advantages/weekday-icon.svg",
    altText: "Regular classes",
    name: `Regular classes to ensure regular study`,
  },
  {
    imageUrl: "/images/img/advantages/doubts-icon.svg",
    altText: "Personal guidance",
    name: `Mentors will guide you personally`,
  },
  {
    imageUrl: "/images/img/advantages/guidance-icon.svg",
    altText: "Mock tests",
    name: `100s of Mock Tests
    based on new syllabus`,
  },
];
