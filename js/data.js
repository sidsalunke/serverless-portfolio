export const profile = {
  name: 'Siddharth Salunke',
  title: 'Principal Quality Engineer',
  tagline: 'Building and scaling enterprise-grade test platforms, infrastructure, and quality engineering capabilities',
  location: 'Dubai, UAE',
  citizenship: 'Australian Citizen',
  linkedin: 'https://www.linkedin.com/in/sidsalunke/',
  github: 'https://github.com/sidsalunke',
  summary: `Principal-level engineering leader with 13+ years building and scaling validation infrastructure,
    resiliency practices, and quality engineering capability across aviation, financial services, and SaaS.
    Currently leading a 25-engineer organisation at Emirates as Principal Quality Engineer, architecting
    automation frameworks and partnering with SRE and DevSecOps to embed automated quality gates that block
    regressions before they reach production. Proven track record designing and scaling performance and
    reliability platforms \u2014 including a Kubernetes-based load testing platform sustaining 300+ RPS over
    24-hour runs \u2014 and driving disciplined adoption of AI tooling across the SDLC.`,
  stats: [
    { value: '13+', label: 'Years Experience' },
    { value: '25', label: 'Engineers Led' },
    { value: '6', label: 'Companies' },
  ],
};

export const experience = [
  {
    id: 'emirates',
    company: 'Emirates Group',
    role: 'Principal Quality Engineer',
    domain: 'New Loyalty Platform',
    dates: '2025 \u2013 Present',
    location: 'Dubai, UAE',
    color: '#C60C30',
    href: 'https://www.emirates.com/',
    description: "Emirates is one of the world\u2019s largest airlines and a global leader in aviation, headquartered in Dubai, UAE. Emirates Group encompasses the airline and dnata, offering aviation, travel, and airport services worldwide.",
    responsibilities: [],
  },
  {
    id: 'qantas',
    company: 'Qantas Airways',
    role: 'Software Technical Lead',
    domain: 'Cloud Platform & Digital',
    dates: '2023 \u2013 2025',
    location: 'Sydney, Australia',
    color: '#E8002D',
    href: 'https://www.qantas.com/',
    description: "Qantas Airways is Australia\u2019s largest domestic and international airline and the country\u2019s flag carrier, regarded as a global leader in safety and operational performance.",
    responsibilities: [
      'Led a multi-disciplinary onshore team delivering automation capability across the Qantas Cloud Platform and Digital domains',
      'Defined and executed the Java-based API test automation strategy for cloud-native microservices; leveraged Slack and GitHub APIs to institutionalise ownership and reporting',
      'Designed and delivered a scalable performance testing platform using k6 on Kubernetes \u2013 sustaining 300+ RPS over 24-hour test runs without platform degradation',
      'Established an organisation-wide visual regression testing framework from scratch, adopted across multiple product teams',
      'Led vendor evaluation and RFP processes for engineering tooling; negotiated contracts resulting in measurable cost savings',
    ],
  },
  {
    id: 'canva',
    company: 'Canva',
    role: 'QA Manager',
    domain: 'Content & Discovery',
    dates: '2020 \u2013 2023',
    location: 'Sydney, Australia',
    color: '#7D2AE8',
    href: 'https://www.canva.com/',
    description: "Canva is an Australian-born global graphic design platform used by millions worldwide to create presentations, marketing materials, and visual content.",
    responsibilities: [
      'Drove quality transformation across the Content & Discovery product group \u2013 building Java-based API test suites across a microservices architecture and establishing a shift-left culture with early defect detection',
      'Integrated an SEO Automation Hub into the release cycle to prevent high-severity regressions reaching production',
      'Architected and executed full migration of frontend integration tests from Chimp to CodeceptJS',
      'Served as an official Canva Coach; mentored three internal coaches, delivering 1:1s, performance reviews, and career development guidance',
    ],
  },
  {
    id: 'myob',
    company: 'MYOB Group',
    role: 'Senior Quality Analyst',
    domain: 'Online Tax',
    dates: '2017 \u2013 2020',
    location: 'Sydney, Australia',
    color: '#00A651',
    href: 'https://www.myob.com/au',
    description: "MYOB is Australia\u2019s leading accounting and financial management software platform, serving SMEs and enterprise clients across Australia and New Zealand.",
    responsibilities: [
      'Built automated test suites (API, Performance, UI) from scratch using Node.js across a microservices architecture; established CI/CD pipelines with Docker and Buildkite',
      "Co-led the QA function across 11 teams in Sydney for one of MYOB\u2019s most complex delivery programmes \u2013 spanning accounting, payroll, and financial reporting product lines",
      "Recognised as a top 10% high performer (MYOB Kudos Award); won People\u2019s Choice Award at MYOB Hackdays 2018 & 2019",
    ],
  },
  {
    id: 'suncorp',
    company: 'Suncorp Group',
    role: 'Software Test Engineer',
    domain: 'Digital Banking & Insurance',
    dates: '2015 \u2013 2017',
    location: 'Sydney, Australia',
    color: '#F5A623',
    href: 'https://www.suncorp.com.au/',
    description: "Suncorp Group is one of Australia\u2019s largest financial services groups, operating across banking, insurance, and wealth management brands in Australia and New Zealand.",
    responsibilities: [
      'Delivered test automation across digital banking and insurance products using Java and Selenium within a highly regulated financial services environment',
      'Gained hands-on exposure to engineering practices, risk controls, and governance frameworks specific to banking and insurance product delivery',
      'Mentored junior engineers and university students; conducted manual exploratory and functional testing across digital product releases',
    ],
  },
  {
    id: 'cognizant',
    company: 'Cognizant',
    role: 'Programmer',
    domain: 'Credit Suisse Account',
    dates: '2013 \u2013 2015',
    location: 'Pune, India',
    color: '#1363A4',
    href: 'https://www.cognizant.com/',
    description: "Cognizant Technology Solutions is an American multinational IT corporation. Worked on the Credit Suisse account delivering quality engineering services within a global investment banking client engagement.",
    responsibilities: [
      'Delivered automation using HP QTP and LoadRunner within a financial services (Credit Suisse) environment \u2013 early exposure to banking-grade quality standards, stakeholder governance, and regulatory compliance',
      'Managed stakeholder reporting and daily communication across project teams',
    ],
  },
];

export const skills = [
  {
    category: 'Languages',
    icon: 'fas fa-code',
    items: ['Python', 'Java', 'TypeScript', 'Node.js', 'Bash'],
  },
  {
    category: 'Test Automation',
    icon: 'fas fa-flask',
    items: ['Playwright', 'Cypress', 'Selenium', 'WebdriverIO', 'RestAssured', 'Pytest', 'Jest'],
  },
  {
    category: 'Performance Testing',
    icon: 'fas fa-gauge-high',
    items: ['k6', 'Artillery', 'JMeter'],
  },
  {
    category: 'Cloud & DevOps',
    icon: 'fas fa-cloud',
    items: ['AWS', 'Docker', 'Kubernetes', 'GitHub Actions', 'Buildkite', 'GitLab CI'],
  },
  {
    category: 'Observability',
    icon: 'fas fa-eye',
    items: ['Splunk', 'Sumo Logic', 'Dynatrace'],
  },
  {
    category: 'AI Tooling',
    icon: 'fas fa-robot',
    items: ['Claude (Anthropic)', 'GenAI-assisted SDLC'],
  },
];
