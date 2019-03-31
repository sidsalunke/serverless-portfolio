import React from "react";
import HorizontalTimeline from "react-horizontal-timeline";

const timelineExamples = [
  {
    data: "2013-06-27",
    statusB: "Started working at Cognizant Technology Solutions as a Programmer Trainee",
  },
  {
    data: "2014-06-27",
    statusB: "Got promoted to Programmer at Cognizant Technology Solutions",
  },
  {
    data: "2015-01-10",
    statusB: "Left Cognizant Technology Solutions",
  },
  {
    data: "2015-11-30",
    statusB: "Started working at Suncorp Group as a Business Technology Intern",
  },
  {
    data: "2017-02-10",
    statusB: "Got promoted to Business Technology Officer at Suncorp Group",
  },
  {
    data: "2017-07-14",
    statusB: "Left Suncorp Group",
  },
  {
    data: "2017-07-17",
    statusB: "Started working as a Quality Analyst at MYOB Group",
  },
  {
    data: "2018-09-17",
    statusB: "Got promoted to Senior Quality Analyst at MYOB Group",
  },
];

export default class Timeline extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      curIdx: 0,
    };
  }

  render() {    
    const {curIdx} = this.state;
    const curStatus = timelineExamples[curIdx].statusB;

    return (
      <div>
        {/* Bounding box for the Timeline */}
        <div
          style={{
            width: "90%",
            height: "100px",
            margin: "0 auto",
            marginTop: "85px",
            fontSize: "15px",
            color: "white"
          }}
        >
          <HorizontalTimeline
            styles={{
              background: "#f8f8f8",
              foreground: "#1A79AD",
              outline: "#dfdfdf",
            }}
            index={this.state.curIdx}
            indexClick={index => {
              const curIdx = this.state.curIdx;
              this.setState({ curIdx: index, prevIdx: curIdx });
            }}            
            values={timelineExamples.map(x => x.data)}
          />
        </div>
        <div className="text-center color--white">
          {/* any arbitrary component can go here */}
          {curStatus}
        </div>
      </div>
    );
  }
}
