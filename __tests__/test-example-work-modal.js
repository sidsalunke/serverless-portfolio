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
  }
};

describe("ExampleWorkModal component", () => {
  let component = shallow(<ExampleWorkModal example={myExample}
    open={false}/>);
  let openComponent = shallow(<ExampleWorkModal example={myExample} 
    open={true}/>)
  let anchors = component.find("a");
  
  it("should contain a single 'a' element", () => {
    expect(anchors.length).toEqual(1);
  });

  it("should link to our project", () => {
    expect(anchors.prop('href')).toEqual(myExample.href);
  });

  it("should have the modal class set correctly", () => {
    expect(component.find(".background--skyBlue").hasClass("modal--closed")).toBe(true);
    expect(openComponent.find(".background--skyBlue").hasClass("modal--open")).toBe(true);
  })
})