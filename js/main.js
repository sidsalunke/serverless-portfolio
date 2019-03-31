import React from 'react';
import ReactDOM from 'react-dom';
import ExampleWork from './example-work';

const myWork = [
  {
    'id': "cognizant",
    'title': "Programmer",
    'href': "https://www.cognizant.com/",
    'companyDesc': `Cognizant Technology Solutions is an American multinational corporation that provides custom information technology, consulting and business process outsourcing services.`,
    'img': {
      'desc': "Work example when working at Cognizant Technology Solutions as a Programmer",
      'src': "images/example3.png",
      'comment': "",
    },
    'jobResponsibilities': [
      {'role': 'Prepare test cases and test data using MS Excel and HP Quality Center'},
      {'role': 'Report bugs using MS Excel or JIRA'},
      {'role': 'Create and maintain SQL queries to extract data from the database'},
      {'role': 'Automate test scripts using HP QTP and HP LoadRunner (VuGen)'},
      {'role': 'Interact with business analyst, system staff and developers from On-site and Off- shore to understand their requirements using MS Outlook or Office Communicator'},
      {'role': 'Perform smoke and regression testing using both automated and manual testing methods'}
    ],
  },
  {
    'id': "suncorp",
    'title': "BT Officer",
    'href': "https://www.suncorp.com.au/",
    'companyDesc': `Suncorp Group Limited is an Australian finance, insurance, and banking corporation based in Brisbane, Queensland, Australia. It includes leading general insurance, banking, life insurance and superannuation brands in Australia and New Zealand.`,
    'img': {
      'desc': "Work example when working at Suncorp Group as a Business Technology Officer",
      'src': "images/example2.png",
      'comment': "",
    },
    'jobResponsibilities': [
      {'role': 'Developing and maintaining program code using Java and Selenium for test automation suite to meet system and technical specifications'},
      {'role': 'Testing, diagnosing and correcting errors and faults in the automation test suite within established quality standards to ensure the Jenkins build jobs don’t fail and the product performs to specification'},
      {'role': 'Challenge the development team to ensure a high level of quality and test coverage at the appropriate levels'},
      {'role': 'Testing APIs using automation test suite as well as manually by using Postman'},
      {'role': 'Perform manual testing of cards and features across browsers and mobile devices for AEM and Drupal websites using Browserstack'},
      {'role': 'Writing and maintaining test scripts for visual responsive image comparison tool called Wraith'},
      {'role': 'Mentor UTS students and teach them agile and software testing concepts.'},
      {'role': 'Executing all the test suites (smoke, functional and wraith) before deployment to build confidence in the developed features and ensure no severe defects are found'},
      {'role': 'Raise, report and track risks and defects in accordance with Suncorp Agile principles using JIRA and Confluence Wiki'},
      {'role': 'Raise and communicate change requests and release planning and always be on the lookout to help improve processes for releases, deployments and reporting'},
      {'role': 'Collaborating and up skilling fellow QAs in terms of programming concepts such as Java, Git and Stash'}
    ],
  },
  {
    'id': "myob",
    'title': "Senior Quality Analyst",
    'href': "https://www.myob.com/au",
    'companyDesc': `MYOB, Mind Your Own Business, is an Australian multinational corporation that provides tax, accounting and other business services software to small and medium businesses.`,
    'img': {
      'desc': "Work example when working at MYOB Group as a Senior Quality Analyst",
      'src': "images/example1.png",
      'comment': "",
    },
    'jobResponsibilities': [
      {'role': 'Writing and maintaining program code using Node.js, WebdriverIO, Cucumber and Chai to expand test coverage for end to end acceptance test suite'},
      {'role': 'Building an automated smoke test suite from scratch using Node.js, WebdriverIO and Cucumber for all the products that the team handles'},
      {'role': 'Setting up a build pipeline for the smoke test suite using an automated build management tool called Buildkite'},
      {'role': 'Mentoring and upskilling fellow QAs by conducting training sessions and brown bags'},
      {'role': 'Using Fiddler and Postman to inspect network traffic and fire API requests to test integration between Online Tax and other third parties'},
      {'role': 'Analysing and monitoring AWS Cloudwatch and Splunk dashboards'},
      {'role': 'Running complex database queries in AWS RDS for PostgreSQL'},
      {'role': 'Displaying ATO and IRD outage banners on our websites using AWS S3 as and when required'},
      {'role': 'Up skilling team members in terms of Test Automation, WebdriverIO and Git'},
      {'role': 'Actively participating in mob programming sessions with software engineers in the team to improve quality of the product'},
      {'role': 'Active member of the QA Community of Practice and always on the lookout to improve QA and agile processes at MYOB'},
      {'role': 'Actively participate in recruiting new QA and senior QA candidates to MYOB by conducting telephonic and face to face interviews'}
    ],
  }
];

ReactDOM.render(<ExampleWork work={myWork}/>, document.getElementById('example-work'));