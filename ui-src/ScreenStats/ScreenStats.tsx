import './ScreenStats.scss';
import React from "react";
import { LintResult, ScreenStatsSerialized } from '../../shared';
import LintResultsComponent from './LintResults/LintResultsComponent';

class ScreenStatsComponent extends React.Component<{stats:ScreenStatsSerialized}, any> {
  constructor(props: any) {
    super(props);
    this.state ={
      isOpen: false
    };
  }

  render() {
    return (
      <div className="screenstats-line">
        <div className="line-header" onClick={() => this.setState((prevState: any) => ({isOpen: !prevState.isOpen}))}>
          <h4 className="line-title">
            {this.props.stats.name}
          </h4>
          <div className="line-header-section">
          </div>
          <div className="line-header-section small">
            {this.props.stats.nondsscore} DS errors | {this.props.stats.designscore} Design errors | {this.props.stats.nonAutoLayoutFrames} Misc errors
          </div>
        </div>
        {(this.props.stats.results.length > 0 && this.state.isOpen) && 
        (<div className="line-details">
          {this.props.stats.results.map((lintResult: LintResult) => {
            if(lintResult.nodes.length > 0)
              return <LintResultsComponent stats={lintResult}/>
          }
          )}
        </div>) }
      </div>
    )
  }
}

export default ScreenStatsComponent;