import React from 'react';
import { shallow } from 'enzyme';
import ExampleWork, { ExampleWorkBubble } from '../js/example-work';

import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new Adapter() });

const myWork = [
  {
    'title': "Senior Quality Analyst",
    'img': {
      'desc': "Work example when working at MYOB Group as a Senior Quality Analyst",
      'src': "images/example1.png",
      'comment': "",
    }
  },
  {
    'title': "BT Officer",
    'img': {
      'desc': "Work example when working at Suncorp Group as a Business Technology Officer",
      'src': "images/example2.png",
      'comment': "",
    }
  },
];
describe("ExampleWork component", () => {
  let component = shallow(<ExampleWork work={myWork}/>);

  it("should be a section element", () => {
    expect(component.type()).toEqual("section")
  });

  it("should contain as many children as there are work examples", () => {
    expect(component.find("ExampleWorkBubble").length).toEqual(myWork.length);
  })

});

describe("ExampleWorkBubble component", () => {
  let component = shallow(<ExampleWorkBubble example={myWork[1]}/>);
  let images = component.find("img");

  it("should contain a single 'img' element", () => {
    expect(images.length).toEqual(1);
  });

  it("should have the image 'src' set correctly", () => {
    expect(images.prop('src')).toEqual(myWork[1].img.src);
  })
});