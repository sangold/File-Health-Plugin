import './LintResultsComponent.scss';
import React from "react";
import { LintResult, NodeLink } from '../../../shared';

class LintResultsComponent extends React.Component<{stats:LintResult}, any> {
  constructor(props: any) {
    super(props);
    this.state = {isOpen: false};
  }

  handleOnLinkClicked(e:any, id: string) {
    e.stopPropagation();
    parent.postMessage({ pluginMessage: { type: 'goTo', id: id } }, '*');
  }

  render() {
    return (
      <div className="lint-container">
        <h5 className="lint-title" onClick={() => this.setState((prevState: any) => ({isOpen: !prevState.isOpen}))}>
          {this.props.stats.name} ({this.props.stats.nodes.length})
        </h5>
        {this.state.isOpen && 
        <ul className='lint-ul'>
          {this.props.stats.nodes.map((nodeLink: NodeLink) => 
          (
          <li><button className='link-to-element' onClick={(e) => this.handleOnLinkClicked(e, nodeLink.id)}>{nodeLink.name}</button></li>
          ))}
        </ul>
        }
      </div>
    )
  }
}

export default LintResultsComponent;