export type CourseCard = {
  description: string;
  image: string;
  knowMore: string;
  buttonText: string;
  footerText: string;
  // Use theme palette gradients by key
  gradientKey: "yellowGreen" | "blueViolet" | "pinkRed";
  index?: number;
};

export const courseCards: CourseCard[] = [
  {
    description: "NATA / JEE 2 Year long Online/Offline Coaching",
    image: "/images/card/play-learn-final.webp",
    knowMore: "Course Details",
    buttonText: "Join Class",
    footerText: "Sample",
    gradientKey: "yellowGreen",
    index: 0,
  },
  {
    description: "NATA / JEE 2 Crash coaching both Online/Offline",
    image: "/images/card/live-nata-online.webp",
    knowMore: "Course Details",
    buttonText: "Join Class",
    footerText: "Sample2",
    gradientKey: "blueViolet",
    index: 1,
  },
  {
    description: "NATA / JEE 2 LongTerm coaching both Online/Offline",
    image: "/images/card/nata-study-materials.webp",
    knowMore: "Course Details",
    buttonText: "Join Class",
    footerText: "Sample3",
    gradientKey: "pinkRed",
    index: 2,
  },
];
