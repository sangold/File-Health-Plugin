import './ScreenStats.scss';
import React from "react";
import { DESIGN_CRITERIA, DS_CRITERIA, LintResult, MISC_CRITERIA, ScreenStatsSerialized } from '../../shared';
import LintResultsComponent from './LintResults/LintResultsComponent';

class ScreenStatsComponent extends React.Component<{stats:ScreenStatsSerialized, filter:string}, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      isOpen: false
    };
  }

  componentDidUpdate(prevProps: Readonly<{ stats: ScreenStatsSerialized; filter: string; }>, prevState: Readonly<any>, snapshot?: any): void {
    if(prevProps !== this.props)
      this.setState({ isOpen: false });
  }

  handleGoToScreen(e:any, id: string) {
    e.stopPropagation();
    parent.postMessage({ pluginMessage: { type: 'goTo', id: id } }, '*');
  }

  render() {
    return (
      <div className="screenstats-line">
        <div className="line-header" onClick={() => this.setState((prevState: any) => ({isOpen: !prevState.isOpen}))}>
          <h4 className="line-title">
            {this.props.stats.name}
          </h4>
          <div className="line-header-section">
            <span className='link-to-screen' onClick={(e) => this.handleGoToScreen(e, this.props.stats.node.id)}>
              go to screen
              </span>
          </div>
          <div className="line-header-section small">
            {
              (this.props.filter === "all" || this.props.filter === "ds") && 
              <span className='screenstats-stat'>{this.props.stats.nondsscore} DS errors</span>
            } 
            {
              (this.props.filter === "all" || this.props.filter === "design") &&
              <span className='screenstats-stat'>{this.props.stats.designscore} Des. errors</span>
            } 
            {
              (this.props.filter === "all" || this.props.filter === "misc") &&
              <span className='screenstats-stat'>{this.props.stats.nonAutoLayoutFrames} Misc. errors</span>
            }
          </div>
        </div>
        {(this.props.stats.results.length > 0 && this.state.isOpen) && 
        (<div className="line-details">
          {this.props.stats.results.map((lintResult: LintResult) => {
            if(lintResult.nodes.length > 0) {
              if (this.props.filter === "ds" && DS_CRITERIA.indexOf(lintResult.name) === -1) return;
              if (this.props.filter === "design" && DESIGN_CRITERIA.indexOf(lintResult.name) === -1) return;
              return <LintResultsComponent stats={lintResult}/>
            }
          }
          )}
        </div>) }
      </div>
    )
  }
}

export default ScreenStatsComponent;