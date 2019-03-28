import React from 'react';
import ReactDOM from 'react-dom';
import ExampleWork from './example-work';

const myWork = [
  {
    'title': "Senior Quality Analyst",
    'href': "https://example.com",
    'desc': "Lorem ipsum",
    'img': {
      'desc': "Work example when working at MYOB Group as a Senior Quality Analyst",
      'src': "images/example1.png",
      'comment': "",
    }
  },
  {
    'title': "BT Officer",
    'href': "https://example.com",
    'desc': "Lorem ipsum",
    'img': {
      'desc': "Work example when working at Suncorp Group as a Business Technology Officer",
      'src': "images/example2.png",
      'comment': "",
    }
  },
  {
    'title': "Programmer",
    'href': "https://example.com",
    'desc': "Lorem ipsum",
    'img': {
      'desc': "Work example when working at Cognizant Technology Solutions as a Programmer",
      'src': "images/example3.png",
      'comment': "",
    }
  }
];
ReactDOM.render(<ExampleWork work={myWork}/>, document.getElementById('example-work'));