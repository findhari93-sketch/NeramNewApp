export type TopperCircle = {
  circle: string;
  alt: string;
  loading?: "lazy" | "eager";
};

export type TopperPerson = {
  studentimage: string;
  studentimagealt: string;
  loading?: "lazy" | "eager";
  badge: string;
};

export type TopperContent = {
  primary: string;
  secondary: string;
  tertiary_name: string;
  tertiary_clg: string;
};

export type TopperItem = {
  circle: TopperCircle;
  person: TopperPerson;
  content: TopperContent;
};

export const TopperList: TopperItem[] = [
  {
    circle: {
      circle: "images/img/jee-2021/background/durga-circle.webp",
      alt: "India NATA topper tamilnadu",
      loading: "lazy",
    },
    person: {
      studentimage: "images/img/jee-2021/wep/muthu.webp",
      studentimagealt: "India NATA Exam 2020 top score",
      loading: "lazy",
      badge: "#1",
    },
    content: {
      primary: "100 Percentile",
      secondary: "2024 AIR 01",
      tertiary_name: "Muthu",
      tertiary_clg: "NIT Trichy",
    },
  },
  {
    circle: {
      circle: "images/img/jee-2021/background/chembian-circle.webp",
      alt: "NATA topper tamilnadu",
      loading: "lazy",
    },
    person: {
      studentimage: "images/img/jee-2021/wep/Varsha.webp",
      studentimagealt: "NATA Exam 2020 top score",
      loading: "lazy",
      badge: "#1",
    },
    content: {
      primary: "99.98 Percentile",
      secondary: "2022 Topper",
      tertiary_name: "Varsha",
      tertiary_clg: "NIT trichy",
    },
  },
  {
    circle: {
      circle: "images/img/jee-2021/background/sameer-circle.webp",
      alt: "India NATA topper tamilnadu",
      loading: "lazy",
    },
    person: {
      studentimage: "images/img/jee-2021/wep/chembian.webp",
      studentimagealt: "India NATA Exam 2021 top score",
      loading: "lazy",
      badge: "#3",
    },
    content: {
      primary: "99.97 Percentile",
      secondary: "2021 Topper",
      tertiary_name: "Chembian",
      tertiary_clg: "NIT trichy",
    },
  },
  {
    circle: {
      circle: "images/img/jee-2021/background/durga-circle.webp",
      alt: "India NATA topper tamilnadu",
      loading: "lazy",
    },
    person: {
      studentimage: "images/img/jee-2021/wep/Balwin.webp",
      studentimagealt: "India NATA Exam 2020 top score",
      loading: "lazy",
      badge: "#3",
    },
    content: {
      primary: "182/200 NATA Score",
      secondary: "2021 Topper",
      tertiary_name: "Balwin",
      tertiary_clg: "Anna University",
    },
  },
  {
    circle: {
      circle: "images/img/jee-2021/background/durga-circle.webp",
      alt: "India NATA topper tamilnadu",
      loading: "lazy",
    },
    person: {
      studentimage: "images/img/jee-2021/wep/Abinav.webp",
      studentimagealt: "India NATA Exam 2020 top score",
      loading: "lazy",
      badge: "#2",
    },
    content: {
      primary: "179/200 NATA Score",
      secondary: "2021 Topper",
      tertiary_name: "Abinav",
      tertiary_clg: "Anna University",
    },
  },
  {
    circle: {
      circle: "images/img/jee-2021/background/durga-circle.webp",
      alt: "India NATA topper tamilnadu",
      loading: "lazy",
    },
    person: {
      studentimage: "images/img/jee-2021/wep/Charubala.webp",
      studentimagealt: "India NATA Exam 2020 top score",
      loading: "lazy",
      badge: "#2",
    },
    content: {
      primary: "99.91 Percentile",
      secondary: "2021 Topper",
      tertiary_name: "Charubala",
      tertiary_clg: "NIT Nagpur",
    },
  },
  {
    circle: {
      circle: "images/img/jee-2021/background/durga-circle.webp",
      alt: "India NATA topper tamilnadu",
      loading: "lazy",
    },
    person: {
      studentimage: "images/img/jee-2021/wep/Alan.webp",
      studentimagealt: "India NATA Exam 2020 top score",
      loading: "lazy",
      badge: "#1",
    },
    content: {
      primary: "180/200 NATA Score",
      secondary: "2021 Topper",
      tertiary_name: "Alan",
      tertiary_clg: "Anna University",
    },
  },
  {
    circle: {
      circle: "images/img/jee-2021/background/durga-circle.webp",
      alt: "India NATA topper tamilnadu",
      loading: "lazy",
    },
    person: {
      studentimage: "images/img/jee-2021/wep/Thabis.webp",
      studentimagealt: "India NATA Exam 2020 top score",
      loading: "lazy",
      badge: "#3",
    },
    content: {
      primary: "177/200 NATA Score",
      secondary: "2021 Topper",
      tertiary_name: "Thabis",
      tertiary_clg: "Anna University",
    },
  },
  {
    circle: {
      circle: "images/img/jee-2021/background/durga-circle.webp",
      alt: "India NATA topper tamilnadu",
      loading: "lazy",
    },
    person: {
      studentimage: "images/img/jee-2021/wep/Vishnu.webp",
      studentimagealt: "India NATA Exam 2020 top score",
      loading: "lazy",
      badge: "#1",
    },
    content: {
      primary: "182/200 NATA Score",
      secondary: "2021 Topper",
      tertiary_name: "Vishnu",
      tertiary_clg: "Anna University",
    },
  },
  {
    circle: {
      circle: "images/img/jee-2021/background/durga-circle.webp",
      alt: "India NATA topper tamilnadu",
      loading: "lazy",
    },
    person: {
      studentimage: "images/img/jee-2021/wep/Dhakshiniya.webp",
      studentimagealt: "India NATA Exam 2020 top score",
      loading: "lazy",
      badge: "#2",
    },
    content: {
      primary: "180/200 NATA Score",
      secondary: "2021 Topper",
      tertiary_name: "Dakshiniya",
      tertiary_clg: "Measi",
    },
  },
  {
    circle: {
      circle: "images/img/jee-2021/background/durga-circle.webp",
      alt: "India NATA topper tamilnadu",
      loading: "lazy",
    },
    person: {
      studentimage: "images/img/jee-2021/wep/Jagadeesh.webp",
      studentimagealt: "India NATA Exam 2020 top score",
      loading: "lazy",
      badge: "#1",
    },
    content: {
      primary: "99.93 Percentile",
      secondary: "2021 Topper",
      tertiary_name: "Jagadeesh",
      tertiary_clg: "NIT Trichy",
    },
  },
  {
    circle: {
      circle: "images/img/jee-2021/background/durga-circle.webp",
      alt: "India NATA topper tamilnadu",
      loading: "lazy",
    },
    person: {
      studentimage: "images/img/jee-2021/wep/Bharathan.webp",
      studentimagealt: "India NATA Exam 2020 top score",
      loading: "lazy",
      badge: "#3",
    },
    content: {
      primary: "99.95 Percentile",
      secondary: "2021 Topper",
      tertiary_name: "Bharathan",
      tertiary_clg: "NIT Trichy",
    },
  },
  {
    circle: {
      circle: "images/img/jee-2021/background/durga-circle.webp",
      alt: "India NATA topper tamilnadu",
      loading: "lazy",
    },
    person: {
      studentimage: "images/img/jee-2021/wep/Sivaram.webp",
      studentimagealt: "India NATA Exam 2020 top score",
      loading: "lazy",
      badge: "#1",
    },
    content: {
      primary: "183/200 NATA Score",
      secondary: "2021 Topper",
      tertiary_name: "Sivaram",
      tertiary_clg: "Anna University",
    },
  },
  {
    circle: {
      circle: "images/img/jee-2021/background/durga-circle.webp",
      alt: "India NATA topper tamilnadu",
      loading: "lazy",
    },
    person: {
      studentimage: "images/img/jee-2021/wep/Arulmathi.webp",
      studentimagealt: "India NATA Exam 2020 top score",
      loading: "lazy",
      badge: "#3",
    },
    content: {
      primary: "177/200 NATA Score",
      secondary: "2021 Topper",
      tertiary_name: "Arulmathi",
      tertiary_clg: "Anna University",
    },
  },
  {
    circle: {
      circle: "images/img/jee-2021/background/durga-circle.webp",
      alt: "India NATA topper tamilnadu",
      loading: "lazy",
    },
    person: {
      studentimage: "images/img/jee-2021/wep/Reshmi.webp",
      studentimagealt: "India NATA Exam 2020 top score",
      loading: "lazy",
      badge: "#2",
    },
    content: {
      primary: "170/200 NATA Score",
      secondary: "2021 Topper",
      tertiary_name: "Reshmi",
      tertiary_clg: "Anna University",
    },
  },
  {
    circle: {
      circle: "images/img/jee-2021/background/durga-circle.webp",
      alt: "India NATA topper tamilnadu",
      loading: "lazy",
    },
    person: {
      studentimage: "images/img/jee-2021/wep/Afzan.webp",
      studentimagealt: "India NATA Exam 2020 top score",
      loading: "lazy",
      badge: "#3",
    },
    content: {
      primary: "173/200 NATA Score",
      secondary: "2021 Topper",
      tertiary_name: "Afzan",
      tertiary_clg: "Cresent",
    },
  },
  {
    circle: {
      circle: "images/img/jee-2021/background/durga-circle.webp",
      alt: "India NATA topper tamilnadu",
      loading: "lazy",
    },
    person: {
      studentimage: "images/img/jee-2021/wep/Gunaa.webp",
      studentimagealt: "India NATA Exam 2020 top score",
      loading: "lazy",
      badge: "#3",
    },
    content: {
      primary: "167/200 NATA Score",
      secondary: "2021 Topper",
      tertiary_name: "Gunaa",
      tertiary_clg: "Thiyagaraja",
    },
  },
  {
    circle: {
      circle: "images/img/jee-2021/background/durga-circle.webp",
      alt: "India NATA topper tamilnadu",
      loading: "lazy",
    },
    person: {
      studentimage: "images/img/jee-2021/wep/Sakthi.webp",
      studentimagealt: "India NATA Exam 2020 top score",
      loading: "lazy",
      badge: "#2",
    },
    content: {
      primary: "159/200 NATA Score",
      secondary: "2021 Topper",
      tertiary_name: "Sakthi",
      tertiary_clg: "Thiyagaraja",
    },
  },
  {
    circle: {
      circle: "images/img/jee-2021/background/durga-circle.webp",
      alt: "India NATA topper tamilnadu",
      loading: "lazy",
    },
    person: {
      studentimage: "images/img/jee-2021/wep/Karthik.webp",
      studentimagealt: "India NATA Exam 2020 top score",
      loading: "lazy",
      badge: "#3",
    },
    content: {
      primary: "166/200 NATA Score",
      secondary: "2021 Topper",
      tertiary_name: "Karthik",
      tertiary_clg: "Thiyagaraja",
    },
  },
  {
    circle: {
      circle: "images/img/jee-2021/background/durga-circle.webp",
      alt: "India NATA topper tamilnadu",
      loading: "lazy",
    },
    person: {
      studentimage: "images/img/jee-2021/wep/Deepika.webp",
      studentimagealt: "India NATA Exam 2020 top score",
      loading: "lazy",
      badge: "#1",
    },
    content: {
      primary: "169/200 NATA Score",
      secondary: "2021 Topper",
      tertiary_name: "Deepika",
      tertiary_clg: "Anna University",
    },
  },
  {
    circle: {
      circle: "images/img/jee-2021/background/durga-circle.webp",
      alt: "India NATA topper tamilnadu",
      loading: "lazy",
    },
    person: {
      studentimage: "images/img/jee-2021/wep/Aylin.webp",
      studentimagealt: "India NATA Exam 2020 top score",
      loading: "lazy",
      badge: "#1",
    },
    content: {
      primary: "99.92 Percentile",
      secondary: "2021 Topper",
      tertiary_name: "Lylin",
      tertiary_clg: "NIT Trichy",
    },
  },
  {
    circle: {
      circle: "images/img/jee-2021/background/durga-circle.webp",
      alt: "India NATA topper tamilnadu",
      loading: "lazy",
    },
    person: {
      studentimage: "images/img/jee-2021/wep/Pavan sanjay.webp",
      studentimagealt: "India NATA Exam 2020 top score",
      loading: "lazy",
      badge: "#2",
    },
    content: {
      primary: "99.91 Percentile",
      secondary: "2021 Topper",
      tertiary_name: "Durgule Pavan sanjay",
      tertiary_clg: "NIT Trichy",
    },
  },
  {
    circle: {
      circle: "images/img/jee-2021/background/durga-circle.webp",
      alt: "India NATA topper tamilnadu",
      loading: "lazy",
    },
    person: {
      studentimage: "images/img/jee-2021/wep/10.webp",
      studentimagealt: "India NATA Exam 2020 top score",
      loading: "lazy",
      badge: "#2",
    },
    content: {
      primary: "99.96 Percentile",
      secondary: "2021 Topper",
      tertiary_name: "10",
      tertiary_clg: "NIT Trichy",
    },
  },
  {
    circle: {
      circle: "images/img/jee-2021/background/durga-circle.webp",
      alt: "India NATA topper tamilnadu",
      loading: "lazy",
    },
    person: {
      studentimage: "images/img/jee-2021/wep/jatin.webp",
      studentimagealt: "India NATA Exam 2020 top score",
      loading: "lazy",
      badge: "#1",
    },
    content: {
      primary: "99.95 Percentile",
      secondary: "2024 Topper",
      tertiary_name: "Jatin",
      tertiary_clg: "NIT Trichy",
    },
  },
  {
    circle: {
      circle: "images/img/jee-2021/background/durga-circle.webp",
      alt: "India NATA topper tamilnadu",
      loading: "lazy",
    },
    person: {
      studentimage: "images/img/jee-2021/wep/Krishna.webp",
      studentimagealt: "India NATA Exam 2020 top score",
      loading: "lazy",
      badge: "#1",
    },
    content: {
      primary: "99.94 Percentile",
      secondary: "2024 Topper",
      tertiary_name: "Krishna",
      tertiary_clg: "NIT Trichy",
    },
  },

  // Add more objects as needed
];
