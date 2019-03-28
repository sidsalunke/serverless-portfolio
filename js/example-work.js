import React from 'react';

class ExampleWork extends React.Component {
  render() {
    return (
      <section class="section section--alignCentered section--description">

      { this.props.work.map((example, index) => {
        return (
          <ExampleWorkBubble example={example} key={index}/>
        )
      }) }

    </section>
    )
  }
}

class ExampleWorkBubble extends React.Component {
  render() {
    let example = this.props.example;
    return(
      <div class="section__exampleWrapper">
      <div class="section__example">
        <img alt={ example.img.desc }
             class="section__exampleImage"
             src={ example.img.src }/>
        <dl class="color--cloud">
          <dt class="section__exampleTitle section__text--centered">
            { example.title }
          </dt>
          <dd></dd>
        </dl>
      </div>
    </div>
    )
  }
}

export default ExampleWork;