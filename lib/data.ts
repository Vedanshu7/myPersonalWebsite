export interface Technology {
  name: string;
  icon: string;
}

export interface Project {
  title: string;
  type: string;
  projectURL: string;
  projectImg: string;
  descriptionShort: string;
  descriptionLong: string;
  button: {
    viewCodeUrl: string;
    viewProjectUrl: string;
  };
  technologyUsed: { name: string; img: string }[];
}

export interface TimelineEvent {
  title: string;
  organization: string;
  period: string;
  type: "work" | "education";
}

export interface Certification {
  title: string;
  issuer: string;
  issued: string;
  credentialUrl: string;
  /** Brand mark of the subject (Google Cloud, AWS, …); falls back to the Coursera mark. */
  icon: string;
}

export const projects: Project[] = [
  {
    title: "Lead Management System",
    type: "Web Application",
    projectURL: "vacface",
    projectImg: "/project-image/lead.png",
    descriptionShort:
      "A B2B solution for lead management targeted at 400+ car dealers across the world.",
    descriptionLong:
      "Created a B2B solution for lead management targeted at the 400+ car dealers across the world. Implemented Lead Tracking, Lead Auto-scheduling, Lead Similarity, and more. Developed a generic API endpoint for lead acceptance. Utilized data analytics to implement lead classification strategies. Deployed on Azure App Service, Azure Jobs, and Azure SQL Server.",
    button: {
      viewCodeUrl: "https://github.com/Vedanshu7/LeadManagementSystem",
      viewProjectUrl: "",
    },
    technologyUsed: [
      { name: "Company Project", img: "/technology-icon/gatewaylogo.svg" },
      { name: ".Net", img: "/technology-icon/dotnet.svg" },
      { name: "C#", img: "/technology-icon/c-sharp.svg" },
      { name: "JavaScript", img: "/technology-icon/javascript.svg" },
      { name: "MSSQL", img: "/technology-icon/mssql.svg" },
      { name: "JWT", img: "/technology-icon/jwt.svg" },
      { name: "Azure", img: "/technology-icon/azure.svg" },
    ],
  },
  {
    title: "Project Management Application",
    type: "Web Application",
    projectURL: "frav",
    projectImg: "/project-image/appoint-meet.png",
    descriptionShort:
      "FRAV — an advanced Project Management System engineered to streamline workflows and enhance collaboration.",
    descriptionLong:
      "FRAV, an advanced Project Management System, is engineered to streamline project workflows and enhance collaboration. Leveraging a modern tech stack, FRAV employs Node.js for the backend, React for the frontend, and incorporates Sequelize, Redux, JWT authentication. Designed as a single-page application (SPA).",
    button: {
      viewCodeUrl: "https://github.com/Vedanshu7/FRAV-Project-Management-Portal",
      viewProjectUrl: "",
    },
    technologyUsed: [
      { name: "React", img: "/technology-icon/react.svg" },
      { name: "Node Js", img: "/technology-icon/nodejs.svg" },
      { name: "MySQL", img: "/technology-icon/postgresql.svg" },
    ],
  },
  {
    title: "JobTracker",
    type: "Chrome Extension",
    projectURL: "jobtracker",
    projectImg: "/project-image/jobtracker.png",
    descriptionShort:
      "A comprehensive browser extension to simplify and streamline the job application process.",
    descriptionLong:
      "JobTracker is a comprehensive browser extension designed to simplify and streamline the job application process for job seekers. This tool offers a wide range of features to enhance the job search experience, from tracking applications to organizing opportunities.",
    button: {
      viewCodeUrl: "https://github.com/Vedanshu7/jobtracker",
      viewProjectUrl: "",
    },
    technologyUsed: [
      { name: "React Js", img: "/technology-icon/react.svg" },
      { name: "Chrome Extension", img: "/technology-icon/chrome.svg" },
      { name: "Azure", img: "/technology-icon/azure.svg" },
      { name: ".NET", img: "/technology-icon/dotnet.svg" },
      { name: "MSSQL", img: "/technology-icon/mssql.svg" },
    ],
  },
  {
    title: "Personality Prediction",
    type: "ML Application",
    projectURL: "appoint-meet",
    projectImg: "/project-image/pps.png",
    descriptionShort:
      "Predicts an individual's personality using a decision tree algorithm and an adaptive questionnaire.",
    descriptionLong:
      "Developed an application to predict an individual's personality by employing a decision tree algorithm. This predictive model is constructed by posing specific questions to the user. Applications include hiring and recruiting, marketing strategies, and mental health diagnosis. Features an adaptive questionnaire that adjusts based on user responses.",
    button: {
      viewCodeUrl: "https://github.com/Vedanshu7/Personality-Prediction-Using-Decision-Tree",
      viewProjectUrl: "",
    },
    technologyUsed: [{ name: "Python", img: "/technology-icon/python.svg" }],
  },
  {
    title: "Eager Beavers Club Website",
    type: "Web Application",
    projectURL: "park-spot",
    projectImg: "/project-image/ebc.png",
    descriptionShort:
      "A web application that promotes events with Single Sign-On for university students.",
    descriptionLong:
      "Developed a web application that promotes events and is easy to use and appealing for users. Created a back-end in Core PHP to provide e-certificates for key events. Enhanced with Single Sign On so only university students can access the portal for e-certificate.",
    button: {
      viewCodeUrl: "",
      viewProjectUrl: "https://eagerbeavers.charusat.ac.in/",
    },
    technologyUsed: [
      { name: "PHP", img: "/technology-icon/php.svg" },
      { name: "MSSQL", img: "/technology-icon/mssql.svg" },
      { name: "JavaScript", img: "/technology-icon/javascript.svg" },
      { name: "JWT", img: "/technology-icon/jwt.svg" },
    ],
  },
  {
    title: "V-Trans Mobile App",
    type: "Mobile Application",
    projectURL: "employee-management-system",
    projectImg: "/project-image/vtrans.png",
    descriptionShort:
      "A mobile application for V-Trans Transport Company to manage digital documents seamlessly.",
    descriptionLong:
      "Experience seamless digital document management with this cutting-edge mobile application developed for V-Trans Transport Company. The app streamlines operations by providing drivers with a secure platform for managing and accessing digital documents, enhancing efficiency and reducing paperwork.",
    button: { viewCodeUrl: "", viewProjectUrl: "" },
    technologyUsed: [
      { name: "Android", img: "/technology-icon/android.svg" },
      { name: "MSSQL", img: "/technology-icon/mssql.svg" },
      { name: "JavaScript", img: "/technology-icon/javascript.svg" },
      { name: "JWT", img: "/technology-icon/jwt.svg" },
      { name: ".NET", img: "/technology-icon/dotnet.svg" },
    ],
  },
  {
    title: "Home Automation Using IoT",
    type: "IoT Application",
    projectURL: "smart-home",
    projectImg: "/project-image/home-automation.png",
    descriptionShort:
      "An Android + Arduino IoT project for controlling home appliances in real-time.",
    descriptionLong:
      "Experience the future of home living with our Home Automation Using IoT project — a seamless integration of an Android application and IoT technology. This innovative application empowers users to control their home appliances effortlessly, responding to their actions in real-time. Powered by Arduino and Android, with a timer feature for scheduled operations.",
    button: {
      viewCodeUrl: "https://github.com/Vedanshu7/Home-Automation-Using-IOT-Android",
      viewProjectUrl: "",
    },
    technologyUsed: [
      { name: "Arduino", img: "/technology-icon/arduino.svg" },
      { name: "Android", img: "/technology-icon/android.svg" },
    ],
  },
  {
    title: "Retail Recommendation System",
    type: "Desktop Application",
    projectURL: "retail-rec",
    projectImg: "/project-image/rrs.jpg",
    descriptionShort:
      "A desktop recommendation system using the Apriori algorithm for basket analysis.",
    descriptionLong:
      "Recommendation System for E-Commerce Website using the Apriori algorithm for basket analysis. Built on the Online Retail Dataset from Kaggle. Packaged as a desktop app using Electron.",
    button: { viewCodeUrl: "", viewProjectUrl: "" },
    technologyUsed: [
      { name: "Python", img: "/technology-icon/python.svg" },
      { name: "Electron", img: "/technology-icon/electron.svg" },
    ],
  },
  {
    title: "BST Visualizer",
    type: "C++ Console Application",
    projectURL: "bst",
    projectImg: "/project-image/bst.png",
    descriptionShort:
      "A C++ application that visualizes binary search trees dynamically using graphics.",
    descriptionLong:
      "The BST Visualizer project is a captivating C++ endeavor that transforms the abstract concept of binary search trees into a visually stunning experience. Utilizing the graphics.h library, each node emerges as a circle, interconnected by lines that dynamically adjust as new elements are added. Supports in-order, pre-order, and post-order traversals.",
    button: {
      viewCodeUrl: "https://github.com/Vedanshu7/Binary-Search-Tree-Visualization-With--CPP",
      viewProjectUrl: "",
    },
    technologyUsed: [{ name: "C++", img: "/technology-icon/cplus.svg" }],
  },
];

export const technologyList: Technology[] = [
  { name: "HTML", icon: "/technology-icon/html-5.svg" },
  { name: "CSS", icon: "/technology-icon/css-3.svg" },
  { name: "Java", icon: "/technology-icon/java.svg" },
  { name: "JavaScript", icon: "/technology-icon/javascript.svg" },
  { name: "TypeScript", icon: "/technology-icon/typescript.svg" },
  { name: "Python", icon: "/technology-icon/python.svg" },
  { name: "C#", icon: "/technology-icon/c-sharp.svg" },
  { name: "C++", icon: "/technology-icon/cplus.svg" },
  { name: "PHP", icon: "/technology-icon/php.svg" },
  { name: "Go", icon: "/technology-icon/go.svg" },
  { name: "React", icon: "/technology-icon/react.svg" },
  { name: "Node.js", icon: "/technology-icon/nodejs.svg" },
  {
    name: "Next.js",
    icon: "/technology-icon/nextjs.svg",
  },
  { name: "Express.js", icon: "/technology-icon/express.svg" },
  { name: ".NET", icon: "/technology-icon/dotnet.svg" },
  { name: "Django", icon: "/technology-icon/django.svg" },
  {
    name: "Redux",
    icon: "/technology-icon/redux.svg",
  },
  {
    name: "Tailwind CSS",
    icon: "/technology-icon/tailwindcss.svg",
  },
  { name: "Sass", icon: "/technology-icon/sass.svg" },
  { name: "MySQL", icon: "/technology-icon/mysql-official.svg" },
  { name: "MongoDB", icon: "/technology-icon/mongodb.svg" },
  { name: "PostgreSQL", icon: "/technology-icon/postgresql.svg" },
  { name: "MSSQL", icon: "/technology-icon/mssql.svg" },
  { name: "Redis", icon: "/technology-icon/redis.svg" },
  { name: "Elasticsearch", icon: "/technology-icon/elasticsearch.svg" },
  { name: "JWT", icon: "/technology-icon/jwt.svg" },
  { name: "Docker", icon: "/technology-icon/docker.svg" },
  { name: "Nginx", icon: "/technology-icon/nginx.svg" },
  { name: "GitHub Actions", icon: "/technology-icon/github-actions.svg" },
  { name: "Jest", icon: "/technology-icon/jest.svg" },
  { name: "Azure", icon: "/technology-icon/azure.svg" },
  { name: "AWS", icon: "/technology-icon/aws.svg" },
  { name: "Heroku", icon: "/technology-icon/heroku.svg" },
  { name: "Git", icon: "/technology-icon/git-icon.svg" },
  { name: "Android", icon: "/technology-icon/android.svg" },
  { name: "Arduino", icon: "/technology-icon/arduino.svg" },
  { name: "Electron", icon: "/technology-icon/electron.svg" },
  { name: "Chrome Extension", icon: "/technology-icon/chrome.svg" },
  { name: "RabbitMQ", icon: "/technology-icon/rabbitmq.svg" },
  { name: "Kafka", icon: "/technology-icon/kafka.svg" },
  {
    name: "Pandas",
    icon: "/technology-icon/pandas.svg",
  },
  {
    name: "NumPy",
    icon: "/technology-icon/numpy.svg",
  },
  {
    name: "FastAPI",
    icon: "/technology-icon/fastapi.svg",
  },
  {
    name: "Flask",
    icon: "/technology-icon/flask.svg",
  },
  {
    name: "Apache Airflow",
    icon: "/technology-icon/airflow.svg",
  },
  {
    name: "scikit-learn",
    icon: "/technology-icon/scikit-learn.svg",
  },
  {
    name: "Prometheus",
    icon: "/technology-icon/prometheus.svg",
  },
  {
    name: "Grafana",
    icon: "/technology-icon/grafana.svg",
  },
  {
    name: "Kubernetes",
    icon: "/technology-icon/kubernetes.svg",
  },
  {
    name: "SQLite",
    icon: "/technology-icon/sqlite.svg",
  },
  { name: "gRPC", icon: "/technology-icon/grpc.svg" },
  { name: "NATS", icon: "/technology-icon/nats.svg" },
  {
    name: "OpenTelemetry",
    icon: "/technology-icon/opentelemetry.svg",
  },
];

export const educationEvents: TimelineEvent[] = [
  {
    title: "Master of Science, Computer Science",
    organization: "Purdue University",
    period: "Jan 2023 – Dec 2024",
    type: "education",
  },
  {
    title: "Bachelor of Technology, Information Technology",
    organization: "Charotar University of Science and Technology",
    period: "Jun 2017 – Jun 2021",
    type: "education",
  },
];

export const workEvents: TimelineEvent[] = [
  {
    title: "Software Engineer",
    organization: "Causify",
    period: "Feb 2025 – Present",
    type: "work",
  },
  {
    title: "Software Engineer Intern",
    organization: "Causify",
    period: "Jun 2024 – Dec 2024",
    type: "work",
  },
  {
    title: "Associate Software Engineer",
    organization: "Advanced",
    period: "Sep 2021 – Nov 2022",
    type: "work",
  },
  {
    title: "Software Engineer",
    organization: "Gateway Group of Companies",
    period: "Jun 2021 – Aug 2021",
    type: "work",
  },
  {
    title: "Software Engineer Intern",
    organization: "Gateway Group of Companies",
    period: "May 2020 – Dec 2020",
    type: "work",
  },
  {
    title: "Software Engineer",
    organization: "Navpad Infotech",
    period: "Mar 2019 – Aug 2019",
    type: "work",
  },
];

const GCP_ICON = "/technology-icon/googlecloud.svg";
const AWS_ICON = "/technology-icon/aws-mark.svg";
const GOOGLE_ICON = "/technology-icon/google.svg";
const TOR_ICON = "/technology-icon/tor.svg";
const COURSERA_ICON = "/technology-icon/coursera.svg";

export const certifications: Certification[] = [
  {
    title: "GCP Security Best Practices",
    issuer: "Coursera",
    issued: "Oct 2020",
    credentialUrl: "https://www.coursera.org/account/accomplishments/verify/C8PSBR7ZYMPY",
    icon: GCP_ICON,
  },
  {
    title: "Elastic GCP Infrastructure: Scaling & Automation",
    issuer: "Coursera",
    issued: "Jul 2020",
    credentialUrl: "https://www.coursera.org/account/accomplishments/verify/6LK77BFZMFHN",
    icon: GCP_ICON,
  },
  {
    title: "Mitigating Security Vulnerabilities on Google Cloud Platform",
    issuer: "Coursera",
    issued: "Apr 2020",
    credentialUrl: "https://www.coursera.org/account/accomplishments/verify/UCXD24UA7RYT",
    icon: GCP_ICON,
  },
  {
    title: "AWS Fundamentals: Going Cloud-Native",
    issuer: "Coursera",
    issued: "Apr 2020",
    credentialUrl: "https://www.coursera.org/account/accomplishments/verify/8FCEL3KYGY45",
    icon: AWS_ICON,
  },
  {
    title: "IT Security: Defense against the Digital Dark Arts",
    issuer: "Coursera",
    issued: "May 2020",
    credentialUrl: "https://www.coursera.org/account/accomplishments/verify/Z5B8BPUKRX33",
    icon: GOOGLE_ICON,
  },
  {
    title: "Palo Alto Networks Cybersecurity Foundation",
    issuer: "Coursera",
    issued: "2020",
    credentialUrl: "https://www.coursera.org/account/accomplishments/verify/FA4ATNRBWUWN",
    icon: COURSERA_ICON,
  },
  {
    title: "Security & Privacy in TOR Network",
    issuer: "Coursera",
    issued: "Apr 2020",
    credentialUrl: "https://www.coursera.org/account/accomplishments/verify/7D45EHQFRE66",
    icon: TOR_ICON,
  },
];
