import {ScreenStatsSerialized} from "../shared";
import NavButton from './NavButton/NavButton';
import ScreenStatsComponent from './ScreenStats/ScreenStats';
import './App.scss';
import React from "react";

class App extends React.Component<any, any> {
  unfilteredResults: ScreenStatsSerialized[];
  constructor(props: any) {
    super(props);
    this.unfilteredResults = [];
    this.state = {
      globalStats: {
        totalDSerror: -1,
        totalDesignError: -1,
        totalNonAutoLayout: -1,
        totalNodes: 1
      },
      results:[],
      filter: "all",
      isLoading: false,
      isEmpty: true,
    }
    onmessage = (event) => {
      if(event.data.pluginMessage.type == "updateValue") {
        this.unfilteredResults = event.data.pluginMessage.results;
        this.setState({
          globalStats : event.data.pluginMessage.globalStats,
          results: this.unfilteredResults,
          isLoading: false,
          isEmpty: event.data.pluginMessage.results.length === 0,
          filter: "all"
        });
      }
    }
  }

  handleFilterChange(filter: string) {
    var filteredResults = this.unfilteredResults.filter((screenstats:ScreenStatsSerialized) => {
      if(filter === "ds")
        return screenstats.nondsscore > 0;
      if(filter === "design")
        return screenstats.designscore > 0;
      return true;
    });
    this.setState({...this.state, results: filteredResults, filter: filter});
  }

  handleGatherStats() {
    this.setState({...this.state, isLoading: true}, () => {
      parent.postMessage({ pluginMessage: { type: 'start' } }, '*');
    });
  }

  render() {
    return (
    <div id="app-container">
      <nav>
        <ul role="list">
          <li>
            <button className={this.state.filter === "all" ? "navButton is-active" : "navButton"} onClick={() => this.handleFilterChange("all")}>All</button>
          </li>
          <li>
              <NavButton isActive={this.state.filter === "ds"} onClick={() => this.handleFilterChange("ds")} showBar name="DS Score" value={this.state.globalStats.totalDSerror} total={this.state.globalStats.totalNodes} />
          </li>
          <li>
              <NavButton isActive={this.state.filter === "design"} onClick={() => this.handleFilterChange("design")} showBar name="Design Score" value={this.state.globalStats.totalDesignError} total={this.state.globalStats.totalNodes} />
          </li>
          <li>
              <NavButton isActive={this.state.filter === "misc"} onClick={() => this.handleFilterChange("misc")} name="Misc. warnings" value={this.state.globalStats.totalNonAutoLayout} total={this.state.globalStats.totalNodes} />
          </li>
        </ul>
          <button style={{ marginTop: 'auto' }} onClick={() => this.handleGatherStats()}>Reload</button>
      </nav>
      <main>
          {this.state.isLoading ? (
            <div className="loading">LOADING</div>
          ) : this.state.isEmpty ? (
          <div className="emptyState">No data <button onClick={() => this.handleGatherStats()}>Analyze Page</button></div>
          ) :
            this.state.results.map((screenStats: ScreenStatsSerialized) =>
              <ScreenStatsComponent filter={this.state.filter} stats={screenStats} />)
          }
        
      </main>
    </div>
  );}
}

export default App
