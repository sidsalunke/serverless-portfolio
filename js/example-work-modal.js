import React from 'react';

class ExampleWorkModal extends React.Component {
  render() {
    let example = this.props.example;
    const jobResponsibilitiesList = example.jobResponsibilities.map((d) => <li key={d.role}>{d.role}</li>);
    let modalClass = this.props.open ? 'modal--open' : 'modal--closed';

    return(
      <div className={"background--white " + modalClass}>
      <span className="color--cloud modal__closeButton"
        onClick={this.props.closeModal}>
        <i className="fa fa-window-close-o"></i>
      </span>
      <img alt={ example.img.desc }
           className="modal__image"
           src={ example.img.src }/>
      <div className="color--cloud modal__text">
        <h2 className="modal__title">
          <u><b>{ example.title }</b></u>
        </h2>
        <p className="modal__description">
          { example.companyDesc }
        </p>
        <a className="color--white modal__link"
           href={ example.href }>
          Check out the company's website
        </a>
        <h3>
          <u><b>Roles and Responsibilities:</b></u>
        </h3>
        <p>
          <ul>
          { jobResponsibilitiesList }
          </ul>
        </p>
      </div>
    </div>
    )
  }
}

export default ExampleWorkModal;