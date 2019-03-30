import React from 'react';
import { shallow } from 'enzyme';
import ExampleWorkModal from '../js/example-work-modal';

import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new Adapter() });

const myExample = {
  'title': "Senior Quality Analyst",
  'href': "https://example.com",
  'desc': "Lorem ipsum",
  'img': {
    'desc': "Work example when working at MYOB Group as a Senior Quality Analyst",
    'src': "images/example1.png",
    'comment': "",
  },
  'jobResponsibilities': [
    {'role': 'Writing and maintaining program code using Node.js, WebdriverIO, Cucumber and Chai to expand test coverage for end to end acceptance test suite'},
    {'role': 'Building an automated smoke test suite from scratch using Node.js, WebdriverIO and Cucumber for all the products that the team handles'},
    {'role': 'Setting up a build pipeline for the smoke test suite using an automated build management tool called Buildkite'},
    {'role': 'Mentoring and upskilling fellow QAs by conducting training sessions and brown bags'}
  ],
};

describe("ExampleWorkModal component", () => {
  let component = shallow(<ExampleWorkModal example={myExample}
    open={false}/>);
  let openComponent = shallow(<ExampleWorkModal example={myExample} 
    open={true}/>)
  let anchors = component.find("a");
  let jobResponsibilities = component.find("li");
  
  it("should contain a single 'a' element", () => {
    expect(anchors.length).toEqual(1);
  });

  it("should link to our project", () => {
    expect(anchors.prop('href')).toEqual(myExample.href);
  });

  it("should have the modal class set correctly", () => {
    expect(component.find(".background--white").hasClass("modal--closed")).toBe(true);
    expect(openComponent.find(".background--white").hasClass("modal--open")).toBe(true);
  })

  it("should render the correct number of job responsibilties", () => {
    expect(jobResponsibilities.length).toEqual(4);
  });
})