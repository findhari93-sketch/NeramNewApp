export type BookItem = {
  bookTitle: string;
  bookCoverImg: string; // URL to image
  bookLink?: string; // main book link
  bookClassLink?: string;
  writtenBy?: string;
  bookDescription?: string;
  test1Link?: string;
  test2Link?: string;
  test3Link?: string;
  test4Link?: string;
  test5Link?: string;
};

export const books: BookItem[] = [
  {
    bookTitle: "History of Architecture",
    bookCoverImg: "https://neramclasses.com/images/img/bookcover/History.webp",
    bookLink:
      "https://neramclasses.sharepoint.com/:b:/s/StudyZone/EeyJh_7HNC9Ph0rbxrX4gFQBOBFj-WP9e760H8HWwUyeAw?e=nXnGgv",
    writtenBy: "By Ar.Haribabu - NATA / JEE 2025",
    bookDescription:
      "About the Early stages of civilised architecture starting starting from Indus valley civilisations.",
    test1Link: "https://forms.gle/c4trHcULmRbkRA176",
    test2Link: "https://forms.gle/W3QU2xhBsiMt4tnX8",
    test3Link: "https://forms.gle/3Rr7C2Gs9tDmH81eA",
  },
  {
    bookTitle: "Islamic Architecture",
    bookCoverImg: "https://neramclasses.com/images/img/bookcover/Islamic.webp",
    bookLink:
      "https://neramclasses.sharepoint.com/:b:/s/StudyZone/EcpXGs7DY_pLny4Vo7hevPwBLFTvI25V6zopICAk1_TOnQ?e=OVF8lk",
    bookClassLink: "https://youtu.be/Mc7K0YTvMM0",
    writtenBy: "By Ar.Haribabu - NATA / JEE 2025",
    bookDescription:
      "Islamic architecture includes many different styles of buildings made by Muslims.",
    test1Link: "https://forms.gle/F3eACJxPTHyAjax77",
    test2Link: "https://forms.gle/A52BkjF3qXiZo3NB8",
  },
  {
    bookTitle: "Famous Indian Buildings",
    bookCoverImg:
      "https://neramclasses.com/images/img/bookcover/Indian-buildings.webp",
    bookLink:
      "https://neramclasses.sharepoint.com/:b:/s/StudyZone/EW6Ps8bUBHlFvCgn1cB2XewB1-Hvh6buU8eZS9WmKjQVqA?e=hAlrpW",
    bookClassLink: "https://youtu.be/oCHay8EV-cw",
    writtenBy: "By Ar.Haribabu - NATA / JEE 2025",
    bookDescription:
      "Iconic landmarks such as the Taj Mahal, Red Fort, and Qutub Minar.",
    test1Link: "https://forms.gle/YBUe59VC7kWj5hzB8",
    test2Link: "https://forms.gle/a6kgKcYVbyrrryzx8",
    test3Link: "https://forms.gle/ux4VdGkb2yc6ykp16",
    test4Link: "https://forms.gle/DgqK6ypQQ3nmJkpBA",
    test5Link: "https://forms.gle/hDGJFNqorz5nkm2f8",
  },
  {
    bookTitle: "World Architecture",
    bookCoverImg:
      "https://neramclasses.com/images/img/bookcover/World-Architecture.webp",
    bookLink:
      "https://neramclasses.sharepoint.com/:b:/s/StudyZone/EWjISBVACvROugvI19Tu0CkB-zfGiKaWNMH-nlMekhN1RQ?e=Lk2W5m",
    bookClassLink: "https://youtu.be/_fqJHu572MU",
    writtenBy: "By Ar.Haribabu - NATA / JEE 2025",
    test1Link: "https://forms.gle/3T9mzAexFbbyKABb9",
    test2Link: "https://forms.gle/QnE8KZpTJbeaME6s7",
    test3Link: "https://forms.gle/XnqaUuuSwmSnf7ym9",
    test4Link: "https://forms.gle/YGvr9AKsDf5nrv67A",
  },
  {
    bookTitle: "Famous Architects",
    bookCoverImg:
      "https://neramclasses.com/images/img/bookcover/Famous-architects.webp",
    bookLink:
      "https://neramclasses.sharepoint.com/:b:/s/StudyZone/ESPmvFDA0BpJiA5c7SY7TWYBW1tlUZ02WZUNY0AlMtDaAA?e=htwoeT",
    bookClassLink: "https://youtu.be/_fqJHu572MU",
    writtenBy: "By Ar.Haribabu - NATA / JEE 2025",
    test1Link: "https://forms.gle/QZeqgj9BeKEAew9S8",
    test2Link: "https://forms.gle/uRqob84zWJUWRBkA6",
    test3Link: "https://forms.gle/tztLNf78JRdu6G2PA",
  },
  {
    bookTitle: "Building Materials",
    bookCoverImg:
      "https://neramclasses.com/images/img/bookcover/Building%20materials.webp",
    bookLink:
      "https://neramclasses.sharepoint.com/:b:/s/StudyZone/EYRTb6noBiJCim7_GXsucRMBfm7ogMxppiq25ImNHftQ0Q?e=tjFV3A",
    bookClassLink:
      "https://youtube.com/playlist?list=PLozQC4O68py-kKHDkFV4ROK9997scZOx4",
    writtenBy: "By Ar.Haribabu - NATA / JEE 2025",
    test1Link: "https://forms.gle/YVFjYBV11ymGMu5Q7",
    test2Link: "https://forms.gle/PrmUDx9LDMPLptYq9",
    test3Link: "https://forms.gle/MeTYEqBXghd56cxMA",
  },
  {
    bookTitle: "Building Constructions",
    bookCoverImg:
      "https://neramclasses.com/images/img/bookcover/Construction.webp",
    bookLink:
      "https://neramclasses.sharepoint.com/:b:/s/StudyZone/EWhZ_WGtvFpOuJE3nziyaA8BQQHw4TMvXy-Sb7N_xRPyZQ?e=Wepj3Q",
    bookClassLink:
      "https://www.youtube.com/playlist?list=PLozQC4O68py8KUW8jXkkS_69via8mC8Jl",
    writtenBy: "By Ar.Haribabu - NATA / JEE 2025",
    test1Link: "https://forms.gle/K8uYpxS69XG8xFLa6",
    test2Link: "https://forms.gle/o7qKmSLkr8sYLJkZ9",
  },
  {
    bookTitle: "Architectural Terminology",
    bookCoverImg:
      "https://neramclasses.com/images/img/bookcover/Architectural-terminology.webp",
    bookLink:
      "https://neramclasses.sharepoint.com/:b:/s/StudyZone/ET6A5dT2YiBMn2HKhBFNl0QBYyTIZLbOo7nFJJLQuBDm7g?e=nFgTPm",
    writtenBy: "By Ar.Haribabu - NATA / JEE 2025",
    test1Link: "https://forms.gle/JzzKrLyariRGpFin8",
    test2Link: "https://forms.gle/pxpw5GgKQJH8c98o7",
    test3Link: "https://forms.gle/oLjE6XMo8MtsW8sT8",
    test4Link: "https://forms.gle/c93JsrkMQnhUS1St6",
    test5Link: "https://forms.gle/4CtFW8CXwCscVwL46",
  },
  {
    bookTitle: "Climatology",
    bookCoverImg:
      "https://neramclasses.com/images/img/bookcover/Climatology.webp",
    bookLink:
      "https://neramclasses.sharepoint.com/:b:/s/StudyZone/EeGHlwyYsKJOs0nTyeuvW9YBL4Uc1Mi6SvPSuD5zB6Jn4g?e=FWiTlz",
    bookClassLink: "https://youtu.be/6GEoPx8A0_o",
    writtenBy: "By Ar.Haribabu - NATA / JEE 2025",
    test1Link: "https://forms.gle/omBzLvxgHw2Vof2p7",
  },
  {
    bookTitle: "Elements of Design",
    bookCoverImg:
      "https://neramclasses.com/images/img/bookcover/Elements-design.webp",
    bookLink:
      "https://neramclasses.sharepoint.com/:b:/s/StudyZone/EY0FZSy-PahCtCaXP7YGuHoB_Wnp9Nf5JjnH61t3uK_5dw?e=wg05aE",
    bookClassLink: "https://youtu.be/lyHZzrPXuE4",
    writtenBy: "By Ar.Haribabu - NATA / JEE 2025",
    test1Link: "https://forms.gle/mJ7eq63rxABzLuGt9",
    test2Link: "https://forms.gle/nZuxtWGLmWxr19xv8",
  },
];

export default books;
