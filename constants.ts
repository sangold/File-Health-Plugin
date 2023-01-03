export const DEPRECATED_COMPONENTS = "Deprecated Components";
export const ILLEGAL_AUTOLAYOUT = "Illegal Autolayouts";
export const ILLEGAL_ROUNDINGS = "Illegal Roundings";
export const UNSTYLED = "Unstyled elements";
export const UNNAMED = "Unnamed elements";
export const USELESS_GROUPS = "Useless groups";

export interface LintResult {
  name: string;
  nodes: NodeLink[];
}

export interface NodeLink {
  name: string;
  id: string;
}

export interface ScreenStatsSerialized {
  name: string,
  node: NodeLink,
  nodeCount: number,
  nonAutoLayoutFrames: number,
  nodeTypeCounts: any[],
  results: LintResult[],
  nondsscore: number,
  designscore: number
}

export class ScreenStats {
  name: string;
  node: NodeLink;
  nodeCount: number;
  nonAutoLayoutFrames: number;
  nodeTypeCounts: Map<NodeType, number>
  defaultNamedNodes: NodeLink[];
  results: Map<string, NodeLink[]>;

  constructor(node: SceneNode) {
    this.name = node.name;
    this.node = {name: node.name, id: node.id};
    this.nodeCount = 0;
    this.nonAutoLayoutFrames = 0;
    this.nodeTypeCounts = new Map;
    this.defaultNamedNodes = [];
    this.results = new Map<string, NodeLink[]>;
    this.results.set(ILLEGAL_ROUNDINGS, []);
    this.results.set(UNSTYLED, []);
    this.results.set(DEPRECATED_COMPONENTS, []);
    this.results.set(ILLEGAL_AUTOLAYOUT, []);
    this.results.set(UNNAMED, []);
    this.results.set(USELESS_GROUPS, []);
  }

  GetObject(): ScreenStatsSerialized {
    let nondscompliants: number = 0;
    let nondsid: string[] = [];
    let nondesignperfect: number = 0;
    let nondesignid: string[] = [];
    let resultsLinter: LintResult[] = [];
    this.results.forEach((v,k) => {
      resultsLinter.push({name: k, nodes: v});
      if(k === ILLEGAL_ROUNDINGS || k === UNSTYLED || k === DEPRECATED_COMPONENTS)
      {
        v.forEach((nl) => {
          if(nondsid.indexOf(nl.id) === -1) {
            nondscompliants++;
            nondsid.push(nl.id);
          }
        })
      }
      else {
        v.forEach((nl) => {
          if (nondesignid.indexOf(nl.id) === -1) {
            nondesignperfect++;
            nondesignid.push(nl.id);
          }
        })
      }
    });
    
    let nodeTypeCounts: any[] = [];
    this.nodeTypeCounts.forEach((v, k) => nodeTypeCounts.push({name: k, value: v}));

    return {
      name: this.name,
      node: this.node,
      nodeCount: this.nodeCount,
      nonAutoLayoutFrames: this.nonAutoLayoutFrames,
      nodeTypeCounts: nodeTypeCounts,
      results: resultsLinter,
      nondsscore: nondscompliants,
      designscore: nondesignperfect
    }
  }
}