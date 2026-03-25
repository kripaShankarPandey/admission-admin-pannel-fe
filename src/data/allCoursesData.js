// ============================================================
// Complete Courses Data: Discipline → Courses → Specializations
// ============================================================
// Structure:
//   allCoursesData = [
//     {
//       discipline: "MEDICAL UG",
//       priority: 1,
//       courses: [
//         {
//           name: "Bachelor of Medicine...",
//           specializations: ["Spec 1", "Spec 2"]
//         }
//       ]
//     }
//   ]
// ============================================================

export const allCoursesData = [
  // ──────────────────────────────────────────
  // 1. MEDICAL UG
  // ──────────────────────────────────────────
  {
    discipline: "Medical Ug",
    priority: 1,
    courses: [
      { name: "Bachelor of Medicine, Bachelor of Surgery (MBBS)", specializations: [] },
      { name: "Bachelor of Dental Surgery (BDS)", specializations: [] },
      { name: "Bachelor of Ayurveda Medicine and Surgery (BAMS)", specializations: [] },
      { name: "Bachelor of Homoeopathic Medicine and Surgery (BHMS)", specializations: [] },
      { name: "Bachelor of Unani Medicine and Surgery (BUMS)", specializations: [] },
      { name: "Bachelor of Veterinary Science and Animal Husbandry (B.V.Sc. & A.H.)", specializations: [] },
    ],
  },

  // ──────────────────────────────────────────
  // 2. MEDICAL PG
  // ──────────────────────────────────────────
  {
    discipline: "Medical Pg",
    priority: 2,
    courses: [
      {
        name: "MEDICAL PG",
        specializations: [
          "MD (Radio Diagnosis)",
          "MD (DERMA, VENE & LEPROSY)",
          "MD (Gen. Medicine)",
          "MD (Paediatrics)",
          "MS (Orthopaedics)",
          "MS (Obst. & Gynae)",
          "MS (Gen. Surgery)",
          "MD (Pulmonary Medicine)",
          "M.D. (Emergency Medicine)",
          "MS (Ophthalmology)",
          "MS (ENT)",
          "M.D. (ANAESTHESIOLOGY)",
          "M.D. (PSYCHIATRY)",
          "M.D. (PATHOLOGY)",
          "MS (Traumatology & Surgery)",
          "M.D. (GERIATRICS)",
          "M.D. (Immuno Haematology)",
          "M.D. (Family Medicine)",
          "M.D. (Radiology)",
          "M.D. (COMMUNITY MEDICINE)",
          "M.D. (Microbiology)",
          "M.D. (Anatomy)",
          "M.D.(Physiology)",
          "M.D. (Pharmacology)",
          "M.D. (Biochemistry)",
          "MS Otorhinolaryngology",
          "M.D. (Forensic Medicine)",
        ],
      },
      {
        name: "DENTAL PG (MDS)",
        specializations: [
          "Prosthodontics and Crown & Bridge",
          "Orthodonitics & Dentofacial Orthopedics",
          "Conservative Dentistry & Endodontics",
          "Periodontology",
          "Oral and Maxillofacial Surgery",
          "Pediatric and Preventive Dentistry",
          "Oral Medicine & Radiology",
          "Oral & Maxillofacial Pathology and Oral Microbiology",
          "Public Health Dentistry",
        ],
      },
      {
        name: "Ayurveda PG",
        specializations: [
          "MD Samhita Siddhant (Ayurvedic Medicine)",
          "MD Dravyaguna (Materia Medica & Pharmacology)",
          "MD Rog Nidan",
          "MS PRASUTI-TANTRA & STRI ROG (Gynaecology & Obstetrics)",
          "M.D (Ayu.) Rachana Sharira (Anatomy)",
          "M.D (Ayu.) Kriya Sharira (Physiology)",
          "M.D (Ayu.) Kayachikitsa (Medicine)",
          "M.D (Ayu.) Kaumarabhritya OR Bala Roga (Paediatrics)",
          "Agad Tantra (Medical Jurisprudence & Toxicology)",
          "Maulik Siddhanta (Fundamental Principles)",
          "Panchakarma (Penta Bio-Purification Methods)",
          "Roga & Vikrit Vigyan (Clinical Medicine & Pathology)",
          "Rasa Shastra & Bhaishajya Kalpana (Iatro-Chemistry)",
          "Shalya Tantra (Surgery)",
          "Shalakya Tantra (ENT & Eye)",
          "Swastha Vritta (Preventive & Social Medicine)",
        ],
      },
      {
        name: "Homeopathy PG",
        specializations: [
          "MD (Hom) Psychiatry",
          "MD (Hom) Pharmacy",
          "MD (Hom) Practice of Medicine",
          "MD (Hom) Materia Medica",
          "MD (Hom) Pediatrics",
          "MD (Hom) Allopathy",
          "MD (Hom) in Endocrinology",
          "MSc Applied Psychology in BHMS",
          "MSc Clinical Research in BHMS",
          "MSc Health Sciences and Yoga Therapy in BHMS",
          "MSc Medical Biochemistry in BHMS",
          "MSc Human Genome in BHMS",
          "MSc Genetics in BHMS",
          "MSc Food Science in BHMS",
          "MSc Epidemiology in BHMS",
        ],
      },
      {
        name: "UNANI PG",
        specializations: [
          "MD Kulliyat-Umoor-e-Tabiya (Basic Principles of Unani Medicines)",
          "MD Ilmul Advia (Unani Pharmacology)",
          "MD Ilmus Saidla (Unani Pharmacy)",
          "MD Tahaffuzi-wa-Samaji-Tib (Unani Preventive and Social Medicine)",
          "MD Ilmul Atfal (Unani Paediatrics)",
          "MD Moalajat (Unani General Medicine)",
          "MD Ilmul Amraz (Unani Pathology)",
          "MD Ilaj Bit Tadbeer (Unani Regimental Therapy)",
          "MD Amraz-e-Jild-o-Zohrawaiya (Unani Dermatology and Venereal Diseases)",
          "MD Munefe-ul-Aza (Unani Physiology)",
          "MS Tashreeh-ul-Badan (Unani Anatomy)",
          "MS Ilmul Jarahat (Unani Surgery)",
          "MS Amraze-e-Uzn, Anaf-wa-Halaq (Unani Diseases of the eye, ear, nose, and throat)",
          "MS Ilmul Qabalat-wa-Amraz-e-Niswan (Unani Obstetrics and Gynaecology)",
        ],
      },
    ],
  },

  // ──────────────────────────────────────────
  // 3. PARAMEDICAL
  // ──────────────────────────────────────────
  {
    discipline: "Paramedical",
    priority: 3,
    courses: [
      { name: "Bachelor of Medical Lab Technology (BMLT)", specializations: [] },
      { name: "Bachelor of Radio Imaging Technology (BRIT)", specializations: [] },
      { name: "Bachelor of Operation Theater Technician (BOTT)", specializations: [] },
      { name: "Bachelor in Audiology and Speech Language (BASLP)", specializations: [] },
      { name: "Bachelor of Ophthalmic Technology", specializations: [] },
      { name: "Bachelor of Anesthesia Technology", specializations: [] },
      { name: "Bachelor of Blood Transfusion Technology", specializations: [] },
      { name: "Bachelor of Cardiac Transfusion Technology", specializations: [] },
      { name: "Bachelor of Science in Emergency Medicine Technology", specializations: [] },
      { name: "Bachelor of Ophthalmology and Optometry Technology", specializations: [] },
      { name: "Bachelor in Optometry Technology", specializations: [] },
      { name: "Bachelor of Dialysis Technology", specializations: [] },
      { name: "Bachelor Occupational Therapy", specializations: [] },
      { name: "Bachelor of Nuclear Medicine", specializations: [] },
      { name: "Bachelor of Naturopathy and Yogic Science", specializations: [] },
      { name: "Bachelor of Nutrition and Dietician", specializations: [] },
      { name: "Bachelor of Forensic Science", specializations: [] },
      { name: "Bachelor of Biomedical Science", specializations: [] },
      { name: "Bachelor of Biotechnology", specializations: [] },
    ],
  },

  // ──────────────────────────────────────────
  // 4. NURSING
  // ──────────────────────────────────────────
  {
    discipline: "Nursing",
    priority: 4,
    courses: [
      { name: "B.SC NURSING", specializations: [] },
      { name: "P.B.SC. NURSING", specializations: [] },
      { name: "GNM", specializations: [] },
      { name: "ANM", specializations: [] },
    ],
  },

  // ──────────────────────────────────────────
  // 5. PHARMACY
  // ──────────────────────────────────────────
  {
    discipline: "Pharmacy",
    priority: 5,
    courses: [
      { name: "D.PHARMA (2 year)", specializations: [] },
      { name: "B.PHARMA (4 year)", specializations: [] },
      { name: "PHARMA-D (5+1 year)", specializations: [] },
      {
        name: "M.PHARMA (2 year)",
        specializations: [
          "Pharmaceutics (MPH)",
          "Pharmacology (MPL)",
          "Pharmaceutical Chemistry (MPC)",
          "Pharmaceutical Quality Assurance (MQA)",
          "Pharmaceutical Analysis (MPA)",
          "Industrial Pharmacy (MIP)",
          "Pharmaceutical Regulatory Affairs (MRA)",
          "Pharmaceutical Biotechnology (MPB)",
          "Pharmacognosy (MPG)",
          "Pharmacy Practice (MPP)",
        ],
      },
    ],
  },

  // ──────────────────────────────────────────
  // 6. AGRICULTURE
  // ──────────────────────────────────────────
  {
    discipline: "Agriculture",
    priority: 6,
    courses: [
      { name: "B.Tech. Agriculture", specializations: [] },
      { name: "B.Sc. Agriculture", specializations: [] },
      { name: "B.Sc. Sericulture", specializations: [] },
      { name: "B.Sc. Fisheries", specializations: [] },
      { name: "B.Sc. Horticulture", specializations: [] },
      { name: "B.Sc. Verticulture", specializations: [] },
      { name: "B.Sc. Dairy Technology", specializations: [] },
    ],
  },

  // ──────────────────────────────────────────
  // 7. AVIATION
  // ──────────────────────────────────────────
  {
    discipline: "Aviation",
    priority: 7,
    courses: [
      { name: "B.Tech Aeronautical Engineering", specializations: [] },
      { name: "B.Tech Aerospace Engineering", specializations: [] },
      { name: "B.Sc. Aviation Technology", specializations: [] },
      {
        name: "Aircraft Maintenance Engineering",
        specializations: ["Avionics", "Mechanical"],
      },
      {
        name: "Pilot Licence (SPL, PPL, CPL, ATPL, PHPL)",
        specializations: [
          "Student Pilot Licence (SPL)",
          "Private Pilot Licence (PPL)",
          "Commercial Pilot Licence (CPL)",
          "Airline Transport Pilot Licence (ATPL)",
          "Private Helicopter Pilot Licence (PHPL)",
        ],
      },
    ],
  },

  // ──────────────────────────────────────────
  // 8. LAW
  // ──────────────────────────────────────────
  {
    discipline: "Law",
    priority: 8,
    courses: [
      { name: "BA LLB", specializations: [] },
      { name: "BCA LLB", specializations: [] },
      { name: "B.COM LLB", specializations: [] },
      { name: "B.TECH LLB", specializations: [] },
      { name: "B.Sc. LLB", specializations: [] },
      { name: "BBA LLB", specializations: [] },
      {
        name: "LLM",
        specializations: [
          "Corporate and Commercial Law",
          "Intellectual Property (IP) Law",
          "International Trade Law/WTO Law",
          "Criminal Law & Criminal Justice",
          "Technology & Cybersecurity Law",
          "Human Rights Law",
          "Environmental Law",
          "Alternative Dispute Resolution (ADR)",
          "Constitutional & Administrative Law",
          "Tax Law",
          "Banking & Finance Law",
          "Maritime Law",
          "Real Estate Law",
          "Health Law/Medical Law",
          "Family Law/Child Law",
          "Labour Law/Employment Law",
        ],
      },
      {
        name: "LLB",
        specializations: [
          "Corporate Law",
          "Criminal Law",
          "Constitutional Law",
          "Intellectual Property Law (IPR)",
          "Taxation Law",
          "Environmental Law",
          "Labour Law",
          "Family Law",
          "Real Estate Law",
          "Cyber Law",
          "International Law",
          "Banking and Insolvency Law",
          "Energy Law",
          "Media Law",
          "Human Rights Law",
        ],
      },
    ],
  },

  // ──────────────────────────────────────────
  // 9. MANAGEMENT
  // ──────────────────────────────────────────
  {
    discipline: "Management",
    priority: 9,
    courses: [
      {
        name: "MBA",
        specializations: [
          "MBA in General Management",
          "MBA in Marketing",
          "MBA in Human Resource Management",
          "MBA in Consulting",
          "MBA in Entrepreneurship",
          "MBA in Finance",
          "MBA in Operations Management",
          "MBA in Management Information Systems",
          "MBA in Global Management",
          "MBA in Engineering Management",
          "MBA in Technology Management",
        ],
      },
      {
        name: "PGDM",
        specializations: [
          "PGDM in Marketing Management",
          "PGDM in Finance Management",
          "PGDM in Human Resource Management (HRM)",
          "PGDM in Operations Management",
          "PGDM in Business Analytics",
          "PGDM in International Business (IB)",
          "PGDM in Information Technology (IT) Management",
          "PGDM in Digital Marketing",
          "PGDM in Rural Management",
          "PGDM in Hospital and Healthcare Management",
          "PGDM in Entrepreneurship Management",
          "PGDM in Logistics and Supply Chain Management",
          "PGDM in Pharmaceutical Management",
          "PGDM in Event Management",
          "PGDM in Public Policy Management",
          "PGDM in Retail Management",
        ],
      },
      {
        name: "BBA",
        specializations: [
          "BBA in Business Administration",
          "BBA in International Business",
          "BBA in Computer Application",
          "BBA in Finance",
          "BBA in Entrepreneurship",
          "BBA in Human Resources",
          "BBA in Global Business",
          "BBA in Tourism",
          "BBA in Human Resource Management",
          "BBA in Accounting",
          "BBA in Supply Chain",
          "BBA in Business Analytics",
        ],
      },
    ],
  },

  // ──────────────────────────────────────────
  // 10. COMPUTER APPLICATION
  // ──────────────────────────────────────────
  {
    discipline: "Computer Application",
    priority: 10,
    courses: [
      {
        name: "BCA",
        specializations: [
          "BCA (Core)",
          "BCA in Artificial Intelligence",
          "BCA in Software Engineering",
          "BCA in Data Scientist",
          "BCA in Database Management Systems",
          "BCA in Digital Marketing",
          "BCA in Cyber Security",
          "BCA in Information Technology",
          "BCA in Software Developer",
          "BCA in Cloud Computing",
          "BCA in Mobile Application Developer",
        ],
      },
      {
        name: "MCA",
        specializations: [
          "MCA (Core)",
          "MCA in Cyber Security",
          "MCA in Data Analytics",
          "MCA in Software Development",
          "MCA in Artificial Intelligence",
          "MCA in Cloud Computing",
          "MCA in Data Science",
          "MCA in System Management",
          "MCA in Web Technology",
          "MCA in Mobile Application Development",
        ],
      },
    ],
  },

  // ──────────────────────────────────────────
  // 11. MARINE
  // ──────────────────────────────────────────
  {
    discipline: "Marine",
    priority: 11,
    courses: [
      { name: "B.Sc (Maritime Science) - Polyvalent Course", specializations: [] },
      { name: "B.Sc Nautical Science", specializations: [] },
      { name: "BE / B-Tech Marine Engineering", specializations: [] },
      { name: "Basic Safety Training", specializations: [] },
      { name: "Certificate Course In Maritime Catering", specializations: [] },
      { name: "Diploma In Nautical Science", specializations: [] },
      { name: "Graduate Marine Engineering", specializations: [] },
      { name: "Naval Architecture And Ocean Engineering", specializations: [] },
      { name: "Higher National Diploma Course (Marine Engineering)", specializations: [] },
      { name: "Higher National Diploma Course (Nautical Science)", specializations: [] },
    ],
  },

  // ──────────────────────────────────────────
  // 12. ARCH & DESIGN
  // ──────────────────────────────────────────
  {
    discipline: "Arch & Design",
    priority: 12,
    courses: [
      { name: "Bachelor of Architecture (BArch)", specializations: [] },
      { name: "Bachelor of Planning (B.Plan)", specializations: [] },
      {
        name: "Bachelor of Design",
        specializations: [
          "Interior Design",
          "Textile Design",
          "Jewellery Design",
          "Ceramic Design",
          "Product Design",
          "Fashion & Communication Design",
        ],
      },
    ],
  },

  // ──────────────────────────────────────────
  // 13. MASSCOM. AND MEDIA
  // ──────────────────────────────────────────
  {
    discipline: "Masscom. And Media",
    priority: 13,
    courses: [
      {
        name: "Bachelor of Journalism & Mass Communication (BJMC)",
        specializations: [
          "Journalism (Print/Broadcast/Digital)",
          "Broadcast Journalism (TV & Radio)",
          "Public Relations & Corporate Communication",
          "Digital Media & Content Creation",
          "Film & TV Production",
          "Media Analytics & Research",
          "Advertising & Branding",
        ],
      },
      {
        name: "BA in Mass Communication & Film Making",
        specializations: [
          "Film and Video Production",
          "Direction",
          "Cinematography/Camera & Lighting",
          "Editing & Post-Production",
          "Screenwriting & Scriptwriting",
          "Sound Design",
          "Film Marketing and Distribution",
          "Broadcast Journalism/Electronic Media",
          "Digital Media & Content Creation",
          "Advertising & Brand Communication",
          "Public Relations (PR)",
        ],
      },
      {
        name: "Diploma in Journalism and Mass Comm.",
        specializations: [
          "Journalism & News",
          "Media Production & Arts",
          "Corporate Communication",
          "Language-Specific Journalism",
        ],
      },
      {
        name: "B.A. (Hons.) Mass Communication (B.A.M.C.)",
        specializations: [
          "Journalism & Broadcast",
          "Advertising & Public Relations (PR)",
          "Film & Multimedia",
          "Digital Media",
        ],
      },
      {
        name: "Bachelor of Mass Communication (B.M.C.)",
        specializations: [
          "Journalism (Print, Broadcast, Digital)",
          "Advertising & Marketing Communication",
          "Public Relations (PR) & Corporate Communication",
          "Film & Television Production",
          "Radio Jockeying & Production",
          "Digital Media & Social Media Management",
          "Photojournalism & Videography",
        ],
      },
      {
        name: "B.Sc. Mass Communication, Advertising & Journalism",
        specializations: [
          "Broadcast Journalism",
          "Public Relations (PR) & Corporate Affairs",
          "Film and Video Production",
          "Digital and Social Media Communication",
          "Print Media",
          "Advertising & Marketing Communication",
          "Photojournalism",
          "Media Production Design & Graphics",
          "Specialized Reporting",
        ],
      },
    ],
  },

  // ──────────────────────────────────────────
  // 14. HOTEL MANAGEMENT
  // ──────────────────────────────────────────
  {
    discipline: "Hotel Management",
    priority: 14,
    courses: [
      {
        name: "Bachelor of Hotel Management (BHM)",
        specializations: [
          "Food Production / Culinary Arts",
          "Food and Beverage Service",
          "Front Office Operations",
          "Housekeeping Operations",
          "Hospitality & Hotel Administration/Management",
          "Travel & Tourism Management",
          "Event Management/Planning",
          "Accommodation Operations",
          "Hospitality Marketing/Sales",
          "Institutional/Catering Services",
        ],
      },
      { name: "BBA in Hospitality, Travel & Tourism", specializations: [] },
      { name: "BSc in Hospitality & Administration", specializations: [] },
      { name: "BSc in Hospitality and Catering Services", specializations: [] },
      {
        name: "Bachelor in Hotel Management and Catering Technology (BHMCT)",
        specializations: [
          "Food Production/Culinary Arts",
          "Food & Beverage Service",
          "Front Office Management",
          "Housekeeping Operations",
          "Catering Technology/Catering Science",
          "Travel & Tourism Management",
          "Hotel/Hospitality Management",
          "Patisserie/Bakery & Confectionery",
          "Diet and Nutrition",
        ],
      },
      { name: "BVoc in Hotel Management", specializations: [] },
    ],
  },

  // ──────────────────────────────────────────
  // 15. ENGINEERING
  // ──────────────────────────────────────────
  {
    discipline: "Engineering",
    priority: 15,
    courses: [
      { name: "Computer Science Engineering (Core)", specializations: ["CSE (Core)"] },
      {
        name: "Computer Science Engineering",
        specializations: [
          "Internet of Things",
          "Business Systems",
          "Information Security",
          "Data Science",
          "Bioinformatics",
          "Block Chain Technology",
          "Artificial Intelligence and Machine Learning",
          "Artificial Intelligence and Robotics",
          "Artificial Intelligence",
          "Computer-Human Interface",
          "Game Design",
          "Networking",
          "Cyber Security",
          "Cloud Computing",
          "Robotics",
          "Electrical Vehicle",
          "Artificial Intelligence & Data Science",
          "Big Data Analytics",
          "Mechatronics",
          "Drone Technology",
          "3D Printing",
          "App Development",
          "Gaming & Animation",
        ],
      },
      { name: "Information Technology (Core)", specializations: ["IT (Core)"] },
      {
        name: "Information Technology",
        specializations: [
          "Internet of Things",
          "Business Systems",
          "Information Security",
          "Data Science",
          "Bioinformatics",
          "Block Chain Technology",
          "Artificial Intelligence and Machine Learning",
          "Artificial Intelligence and Robotics",
          "Artificial Intelligence",
          "Computer-Human Interface",
          "Game Design",
          "Networking",
          "Cyber Security",
          "Cloud Computing",
          "Robotics",
          "Electrical Vehicle",
          "Artificial Intelligence & Data Science",
          "Big Data Analytics",
          "Mechatronics",
          "Drone Technology",
          "3D Printing",
          "App Development",
        ],
      },
      { name: "Mechanical Engineering (Core)", specializations: ["ME (Core)"] },
      {
        name: "Mechanical Engineering",
        specializations: [
          "Robotics and Mechatronics",
          "Automotive Engineering",
          "Thermal Systems & Energy Engineering",
          "Manufacturing and Production Engineering",
          "Biomechanics/Biomedical Engineering",
          "Materials Engineering/Tribology",
          "Structural Mechanics and FEA",
          "Computational Fluid Dynamics (CFD)",
          "Mechatronics",
          "Renewable Energy Systems",
          "Computational Mechanics",
          "Biomechanical Engineering",
        ],
      },
      { name: "Civil Engineering (Core)", specializations: ["Civil (Core)"] },
      {
        name: "Civil Engineering",
        specializations: [
          "Structural Engineering",
          "Geotechnical Engineering",
          "Transportation Engineering",
          "Environmental Engineering",
          "Water Resources Engineering",
          "Construction Engineering/Management",
        ],
      },
      { name: "Automobile Engineering (Core)", specializations: ["Core Branch"] },
      {
        name: "Automobile Engineering",
        specializations: [
          "Automotive Design Engineering",
          "Powertrain Engineering",
          "Vehicle Dynamics & Performance",
          "Automotive Electronics & Embedded Systems",
          "Aerodynamics",
          "Materials Engineering (Automotive)",
          "Electric Vehicle (EV) Engineering",
          "Autonomous Driving & Control Systems",
          "Connected Vehicles & IoT",
        ],
      },
      { name: "Electrical Engineering (Core)", specializations: ["Core Branch"] },
      {
        name: "Electrical Engineering",
        specializations: [
          "Power & Energy Engineering",
          "Electronics Engineering",
          "Control Systems Engineering",
          "Telecommunications Engineering",
          "Microelectronics & Nanoelectronics",
          "Signal Processing",
        ],
      },
      { name: "Electronics & Communication Engineering (Core)", specializations: ["Core Branch"] },
      {
        name: "Electronics & Communication Engineering",
        specializations: [
          "VLSI Design & System",
          "Embedded Systems",
          "Wireless Communication & Networking",
          "Internet of Things (IoT) & Smart Systems",
          "Signal & Image Processing",
          "Robotics & Automation",
          "AI & Machine Learning in Electronics",
          "Microwave & Antenna Engineering",
          "Power Electronics",
          "Cyber-Physical Systems (CPS)",
          "Mechatronics",
          "Quantum Electronics & Photonics",
        ],
      },
      { name: "Electrical & Electronics Engineering (Core)", specializations: ["Core Branch"] },
      {
        name: "Electrical & Electronics Engineering",
        specializations: [
          "Power Systems Engineering",
          "Power Electronics and Drives",
          "VLSI (Very Large Scale Integration) Design",
          "Embedded Systems & Robotics",
          "Control Systems Engineering",
          "Telecommunication & RF Engineering",
          "Renewable Energy Systems",
          "Instrumentation & Control",
          "Electric Vehicle (EV) Technology",
          "Internet of Things (IoT)",
        ],
      },
      { name: "Biotechnology (Core)", specializations: ["Core Branch"] },
      {
        name: "Biotechnology",
        specializations: [
          "Medical Biotechnology (Red Biotech)",
          "Bioinformatics (Gold Biotech)",
          "Industrial Biotechnology (White Biotech)",
          "Agricultural Biotechnology (Green Biotech)",
          "Environmental Biotechnology (Grey Biotech)",
          "Genetic Engineering",
          "Bioprocess Engineering",
          "Food Biotechnology (Yellow Biotech)",
          "Nanobiotechnology",
          "Synthetic Biology",
          "Marine Biotechnology (Blue Biotech)",
        ],
      },
      { name: "Biomedical Engineering (Core)", specializations: ["Core Branch"] },
      {
        name: "Biomedical Engineering",
        specializations: [
          "Bioinstrumentation",
          "Biomechanics",
          "Biomaterials",
          "Medical Imaging & Signal Processing",
          "Rehabilitation Engineering",
          "Clinical Engineering",
          "Computational Biology & Bioinformatics",
          "Tissue Engineering & Regenerative Medicine",
        ],
      },
      { name: "Chemical Engineering (Core)", specializations: ["Core Branch"] },
      {
        name: "Chemical Engineering",
        specializations: [
          "Petrochemical and Refinery",
          "Environmental Engineering",
          "Process & Design",
          "Material & Polymer Engineering",
          "Bio-Processing",
          "Energy & Safety",
        ],
      },
      { name: "Petroleum Engineering (Core)", specializations: ["Core Branch"] },
      {
        name: "Petroleum Engineering",
        specializations: [
          "Drilling Engineering",
          "Reservoir Engineering",
          "Production Engineering",
          "Applied Petroleum Geoscience",
          "Offshore Engineering",
          "Petrochemical Engineering",
          "Oil & Gas Data Science/Intelligent Systems",
          "Pipeline Maintenance Engineering",
          "Health, Safety, and Environmental (HSE) Engineering",
        ],
      },
      { name: "Fire Safety Engineering (Core)", specializations: ["Core Branch"] },
      {
        name: "Fire Safety Engineering",
        specializations: [
          "Fire & Industrial Safety Management",
          "Fire Protection System Engineering",
          "Environmental, Health & Safety (E&EHS)",
          "Chemical Process Safety & Hazardous Materials",
          "Construction & Infrastructure Safety",
        ],
      },
      { name: "Production Engineering (Core)", specializations: ["Core Branch"] },
      {
        name: "Production Engineering",
        specializations: [
          "Manufacturing Engineering/Technology",
          "Industrial Engineering",
          "Production and Industrial Engineering",
          "Supply Chain and Logistics Management",
          "Product Design and Development",
          "Material Handling Systems",
        ],
      },
      { name: "Automation & Robotics Engineering (Core)", specializations: ["Core Branch"] },
      {
        name: "Automation & Robotics Engineering",
        specializations: [
          "Industrial Automation & Smart Manufacturing",
          "AI & Machine Learning in Robotics",
          "Embedded Systems & Robotics",
          "Autonomous Mobile Robotics & UAVs",
          "Medical Robotics/Bionics",
          "Mechatronics Engineering",
        ],
      },
      { name: "Environmental Engineering (Core)", specializations: ["Core Branch"] },
      {
        name: "Environmental Engineering",
        specializations: [
          "Water & Wastewater Treatment",
          "Waste Management",
          "Air & Noise Pollution",
          "Environmental Technology",
          "Sustainability & Assessment",
          "Resources & Geo-environment",
        ],
      },
      { name: "Metallurgy Engineering (Core)", specializations: ["Core Branch"] },
      {
        name: "Metallurgy Engineering",
        specializations: [
          "Physical Metallurgy",
          "Extractive Metallurgy",
          "Materials Science & Engineering",
          "Mineral Processing",
          "Magnetic Separation",
          "Corrosion and Surface Engineering",
          "Welding Technology/Joining Processes",
          "Computational Materials Engineering",
          "Powder Metallurgy & Ceramics",
          "Nano-materials and Biomaterials",
        ],
      },
    ],
  },

  // ──────────────────────────────────────────
  // 16. M.TECH
  // ──────────────────────────────────────────
  {
    discipline: "M.Tech",
    priority: 16,
    courses: [
      { name: "M.Tech in Artificial Intelligence", specializations: [] },
      { name: "M.Tech in Mechanical Engineering", specializations: [] },
      { name: "M.Tech in Electrical Engineering", specializations: [] },
      { name: "M.Tech in Computer Science And Engineering", specializations: [] },
      { name: "M.Tech in VLSI Design", specializations: [] },
      { name: "M.Tech in Civil Engineering", specializations: [] },
      { name: "M.Tech in Chemical Engineering", specializations: [] },
      { name: "M.Tech in Telecommunications Engineering", specializations: [] },
      { name: "M.Tech in Electronic Engineering", specializations: [] },
      { name: "M.Tech in Embedded System", specializations: [] },
      { name: "M.Tech in Biotechnology", specializations: [] },
      { name: "M.Tech in Environmental Engineering", specializations: [] },
      { name: "M.Tech in Materials Science", specializations: [] },
      { name: "M.Tech in Structural Engineering", specializations: [] },
      { name: "M.Tech in Data Science and Engineering", specializations: [] },
    ],
  },

  // ──────────────────────────────────────────
  // 17. ARCHITECTURE AND PLANNING
  // ──────────────────────────────────────────
  {
    discipline: "Architecture And Planning",
    priority: 17,
    courses: [
      {
        name: "Bachelor of Architecture (B.Arch)",
        specializations: [
          "Core Branch",
          "Architectural Design",
          "Interior Design",
          "Landscape Architecture",
          "Urban Design",
          "Sustainable/Green Building Design",
          "Building Construction & Management",
          "Conservation/Heritage Architecture",
          "Parametric Design/Digital Architecture",
        ],
      },
      {
        name: "Bachelor of Planning (B.Plan)",
        specializations: [
          "Core Branch",
          "Urban and Regional Planning",
          "Environmental Planning",
          "Transport Planning",
          "Housing and Infrastructure Development",
          "Smart City Planning",
        ],
      },
    ],
  },

  // ──────────────────────────────────────────
  // 18. YOGA AND NATUROPATHY
  // ──────────────────────────────────────────
  {
    discipline: "Yoga And Naturopathy",
    priority: 18,
    courses: [
      { name: "Bachelor of Naturopathy & Yogic Sciences (BNYS)", specializations: [] },
      { name: "Diploma Programs (DNYT/DYN)", specializations: [] },
      { name: "B.Sc. in Yoga Therapy", specializations: [] },
      { name: "B.Sc. in Yogic Science/Yoga", specializations: [] },
      { name: "B.Sc. (Hons) in Yoga Science and Naturopathy", specializations: [] },
      { name: "BA in Yoga/Yoga Studies", specializations: [] },
      { name: "B.Voc in Yoga and Naturopathy", specializations: [] },
    ],
  },

  // ──────────────────────────────────────────
  // 19. ANIMATION, VFX & GAMING DESIGN
  // ──────────────────────────────────────────
  {
    discipline: "Animation, Vfx & Gaming Design",
    priority: 19,
    courses: [
      { name: "B.Des. in Animation & Game Design", specializations: [] },
      { name: "B.Sc. in Animation and VFX", specializations: [] },
      { name: "B.Des. in Animation", specializations: [] },
      { name: "B.A. in Animation and CG Arts", specializations: [] },
      { name: "B.Sc. in Multimedia and Animation", specializations: [] },
      { name: "B.Sc. in Gaming and Animation", specializations: [] },
      { name: "B.Sc. in Game Design", specializations: [] },
      { name: "B.Des. in Game Design and Development", specializations: [] },
      { name: "B.Sc. (Hons.) in Animation, VFX & Gaming", specializations: [] },
      { name: "B.A. in Digital Filmmaking and Animation", specializations: [] },
      { name: "Bachelor of Visual Arts (Animation)", specializations: [] },
      { name: "Diploma in 3D Animation & VFX", specializations: [] },
    ],
  },

  // ──────────────────────────────────────────
  // 20. LIFE SCIENCE
  // ──────────────────────────────────────────
  {
    discipline: "Life Science",
    priority: 20,
    courses: [
      { name: "B.Sc. Life Sciences", specializations: [] },
      { name: "B.Sc. Biotechnology", specializations: [] },
      { name: "B.Sc. Microbiology", specializations: [] },
      { name: "B.Sc. Biochemistry", specializations: [] },
      { name: "B.Sc. Genetics", specializations: [] },
      { name: "B.Sc. Bioinformatics", specializations: [] },
      { name: "B.Sc. Botany/Zoology", specializations: [] },
      { name: "B.Sc. Biomedical Science", specializations: [] },
      { name: "B.Sc. Food Technology/Science", specializations: [] },
      { name: "B.Sc. Environmental Science/Management", specializations: [] },
      { name: "B.Sc. Forestry/Agriculture", specializations: [] },
      { name: "B.Sc. Applied Biology", specializations: [] },
    ],
  },

  // ──────────────────────────────────────────
  // 21. HUMANITIES & SOCIAL SCIENCES
  // ──────────────────────────────────────────
  {
    discipline: "Humanities & Social Sciences",
    priority: 21,
    courses: [
      { name: "BA English", specializations: [] },
      { name: "BA Political Science", specializations: [] },
      { name: "BA Economics", specializations: [] },
      { name: "BA Psychology", specializations: [] },
      { name: "BA Sociology", specializations: [] },
      { name: "BA History", specializations: [] },
      { name: "BA Geography", specializations: [] },
      { name: "BA Philosophy", specializations: [] },
      { name: "BA Anthropology", specializations: [] },
      { name: "BSW (Bachelor of Social Work)", specializations: [] },
      { name: "BA Public Administration", specializations: [] },
      { name: "International Relations", specializations: [] },
      { name: "Linguistics", specializations: [] },
      { name: "Archaeology", specializations: [] },
      { name: "Cultural Studies", specializations: [] },
      { name: "Development Studies", specializations: [] },
    ],
  },
];

// ============================================================
// Helper Functions
// ============================================================

/** Get all discipline names (sorted by priority) */
export const getAllDisciplines = () =>
  allCoursesData.map((d) => d.discipline);

/** Get courses for a specific discipline */
export const getCoursesByDiscipline = (disciplineName) => {
  const disc = allCoursesData.find(
    (d) => d.discipline.toLowerCase() === disciplineName.toLowerCase()
  );
  return disc ? disc.courses.map((c) => c.name) : [];
};

/** Get specializations for a specific course within a discipline */
export const getSpecializations = (disciplineName, courseName) => {
  const disc = allCoursesData.find(
    (d) => d.discipline.toLowerCase() === disciplineName.toLowerCase()
  );
  if (!disc) return [];
  const course = disc.courses.find(
    (c) => c.name.toLowerCase() === courseName.toLowerCase()
  );
  return course ? course.specializations : [];
};

/** Get a flat list of all courses across all disciplines */
export const getAllCourses = () => {
  const result = [];
  for (const disc of allCoursesData) {
    for (const course of disc.courses) {
      result.push({
        discipline: disc.discipline,
        courseName: course.name,
        specializations: course.specializations,
      });
    }
  }
  return result;
};

/** Get a flat list of all specializations across all courses */
export const getAllSpecializations = () => {
  const result = [];
  for (const disc of allCoursesData) {
    for (const course of disc.courses) {
      for (const spec of course.specializations) {
        result.push({
          discipline: disc.discipline,
          courseName: course.name,
          specialization: spec,
        });
      }
    }
  }
  return result;
};
