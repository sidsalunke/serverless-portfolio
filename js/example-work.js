import React from 'react';
import ExampleWorkModal from './example-work-modal';
import Timeline from './timeline';

class ExampleWork extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      'modalOpen': false,
      'selectedExample': this.props.work[0]
    }

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  };

  openModal(evt, example) {
    document.body.classList.add('modal--open');
    this.setState({
      'modalOpen': true,
      'selectedExample': example,
    });
  };

  closeModal(evt) {
    document.body.classList.remove('modal--open');
    this.setState({
      'modalOpen': false,
    });
  };

  render() {
    return (
      <span>
        <section className="section section--alignCentered section--description">

        { this.props.work.map((example, index) => {
          return (
            <ExampleWorkBubble example={example} key={index}
              openModal={this.openModal}/>
          )
        }) }
        <Timeline />
      </section>

      <ExampleWorkModal example={this.state.selectedExample}
        open={this.state.modalOpen} closeModal={this.closeModal}/>
    </span>
    )
  }
}

class ExampleWorkBubble extends React.Component {
  render() {
    let example = this.props.example;
    return(
      <div className="section__exampleWrapper"
        onClick={(evt) => this.props.openModal(evt, example)}>
      <div className="section__example">
        <img alt={ example.img.desc }
             id={example.id}
             className="section__exampleImage"
             src={ example.img.src }
             />
        <dl className="color--cloud">
          <dt className="section__exampleTitle section__text--centered">
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
export { ExampleWorkBubble };