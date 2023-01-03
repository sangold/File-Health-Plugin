import {ScreenStats,NodeLink, DEPRECATED_COMPONENTS, UNNAMED, UNSTYLED, USELESS_GROUPS, ILLEGAL_AUTOLAYOUT, ILLEGAL_ROUNDINGS, ScreenStatsSerialized} from "../constants";
import { useState } from 'react'
import NavButton from './NavButton/NavButton';
import './App.scss';
import React from "react";

class App extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = {
      globalStats: {
        totalDSerror: 0,
        totalDesignError: 0,
        totalNonAutoLayout: 0,
        totalNodes: 1
      },
      results:[]
    }
    onmessage = (event) => {
      if(event.data.pluginMessage.type == "updateValue") {
        console.log(event.data.pluginMessage.globalStats);
        this.setState({
          globalStats : event.data.pluginMessage.globalStats,
          results : event.data.pluginMessage.results
        });
      }
    }
  }
  handleGatherStats() {
    parent.postMessage({ pluginMessage: { type: 'start' } }, '*');
  }

  render() {
    return (
    <main>
      <nav>
        <ul role="list">
          <li>
            <NavButton showBar name="DS Score" value={this.state.globalStats.totalDSerror} total={this.state.globalStats.totalNodes} />
          </li>
          <li>
            <NavButton showBar name="Design Score" value={this.state.globalStats.totalDesignError} total={this.state.globalStats.totalNodes} />
          </li>
          <li>
            <NavButton name="Misc. warnings" value={this.state.globalStats.totalNonAutoLayout} total={this.state.globalStats.totalNodes} />
          </li>
        </ul>
        <button onClick={() => this.handleGatherStats()}>Gather Stats</button>
      </nav>
    </main>
  );}
}

export default App