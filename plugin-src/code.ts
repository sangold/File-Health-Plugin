import {ScreenStats,NodeLink, DEPRECATED_COMPONENTS, UNNAMED, UNSTYLED, USELESS_GROUPS, ILLEGAL_AUTOLAYOUT, ILLEGAL_ROUNDINGS} from "../constants";
let authorizedSpacingsString: string = "0,4,8,12,16,24,32,36,40,48,64";
let authorizedRoundingString: string = "0,4,8";
const authorizedRounding = authorizedRoundingString.split(",").map((v) => parseInt(v));
const authorizedSpacings = authorizedSpacingsString.split(",").map((v) => parseInt(v));

figma.ui.onmessage = msg => {
  if (msg.type === 'start') {
    let results: any[] = [];
    let totalDSerror: number = 0;
    let totalDesignError: number = 0;
    let totalNodes: number = 0;
    let totalNonAutoLayout: number = 0;
    let screens = figma.currentPage.children.filter((node) => node.type === "FRAME");
    screens.forEach((screenNode) => {
      const screenStats = new ScreenStats(screenNode);
      visit(screenNode, screenStats);
      let screenStatsObject = screenStats.GetObject();
      results.push(screenStatsObject);
      
      totalNonAutoLayout += screenStatsObject.nonAutoLayoutFrames;
      totalDSerror += screenStatsObject.nondsscore;
      totalDesignError += screenStatsObject.designscore;
      totalNodes += screenStatsObject.nodeCount;
    });
    figma.ui.postMessage({ type: "updateValue", results: results, globalStats: {
      totalDSerror: totalDSerror,
      totalDesignError: totalDesignError,
      totalNonAutoLayout: totalNonAutoLayout,
      totalNodes: totalNodes
    } });
  }

  if (msg.type === 'goTo') {
    const node = figma.getNodeById(msg.id);
    if(!node || node.type == "PAGE") return;
    figma.viewport.scrollAndZoomIntoView([node]);
    figma.currentPage.selection = [node as SceneNode];
  }
};

function visit(node: BaseNode, stats: ScreenStats) {
  if(!node) {return;}
  // we should exclude parent frame and structural frames
  if (node.parent !== figma.currentPage && node.type !== "PAGE" && !IsStructuralFrame(node)) {
    stats.nodeCount++; 
    stats.nodeTypeCounts.set(node.type, 1 + (stats.nodeTypeCounts.get(node.type) || 0));
  }
  
  if(node.type === "WIDGET" || node.type === "COMPONENT" || node.type === "COMPONENT_SET")
  return;

  if(IsStructuralFrame(node)) {
    if (!supportsChildren(node)) { return; }
    if (node.children) node.children.forEach((n) => visit(n, stats));
    return;
  }
  
  const nodeLink = GetLinkToNode(node);

  if (node.type === "INSTANCE") {
    if (isDeprecatedInstance(node))
      stats.results.get(DEPRECATED_COMPONENTS)?.push(nodeLink);
    return;
  }

  if (node.type === "FRAME" && node.layoutMode === "NONE") {
    stats.nonAutoLayoutFrames++;
  }

  if (isDefaultName(node)) { 
    stats.results.get(UNNAMED)?.push(nodeLink);
  }

  if (isUselessGrouping(node)) {
    stats.results.get(USELESS_GROUPS)?.push(nodeLink)
  }

  if (usesNonDSStyles(node)) {
    stats.results.get(UNSTYLED)?.push(nodeLink)
  }

  if (isIllegalAutoLayout(node, authorizedSpacings)) stats.results.get(ILLEGAL_AUTOLAYOUT)?.push(nodeLink);
  
  if (!supportsChildren(node)) {return;}
  if(node.children) node.children.forEach((n) => visit(n, stats));
}

function GetLinkToNode(node: BaseNode): NodeLink {
  return { name: node.name, id: node.id };
}

function IsSameColor(color1: RGB, color2: RGB): boolean {
  return color1.r === color2.r && color1.g === color2.g && color1.b === color2.b; 
}

function IsStructuralFrame(node: BaseNode): boolean {
  if (node.type === "FRAME" && hasNoFillsNorStyles(node)) return true;
  if (node.type === "FRAME" && node.fills !== figma.mixed && node.fills.length < 2) {
    if(node.fills.length === 0) return true;
    if(node.fills[0].type === "SOLID" && IsSameColor(node.fills[0].color,{r: 1, g: 1, b: 1 })) return true;
  }
  return false;
}

function IsSameNodeLink(n1: NodeLink, n2: NodeLink): boolean {
  return n1.id == n2.id
}

function isDefaultName(node: BaseNode): boolean {
  if (node.type === "PAGE") return false;
  if (node.type === "TEXT") return node.autoRename;
  const typeName = node.type.toUpperCase();

  return node.name.toUpperCase().startsWith(typeName) || node.name.toUpperCase().startsWith("IMAGE");
}

function supportsChildren(node: BaseNode):
  node is FrameNode | BooleanOperationNode | GroupNode | PageNode {
  return node.type === 'FRAME' || node.type === 'GROUP' ||
    node.type === 'BOOLEAN_OPERATION' || node.type === 'PAGE'
}

// Need to find a way to be recursive
function isUselessGrouping(node: BaseNode): boolean {
  if (node.type !== 'GROUP' && node.type !== 'FRAME') return false;
  if (node.type === 'GROUP' && node.children.length < 2)
    return true;
  if (node.type === 'FRAME' && hasNoFillsNorStyles(node) && node.children.length < 2) {
    if (node.layoutMode === "NONE") { return true; }
    if (node.paddingLeft == 0 && node.paddingTop == 0 && node.paddingRight == 0 && node.paddingBottom == 0) {
      return true;
    }
  }
  return false;
}

function hasNoFillsNorStyles(node: any): boolean {
  return node.fills !== figma.mixed && node.fills.length === 0 && node.strokes.length === 0 && node.effects.length === 0;
}
function usesNonDSStyles(node: BaseNode) {
  if (
    node.type !== "BOOLEAN_OPERATION" &&
    node.type !== "COMPONENT" &&
    node.type !== "COMPONENT_SET" &&
    node.type !== "ELLIPSE" &&
    node.type !== "FRAME" &&
    node.type !== "HIGHLIGHT" &&
    node.type !== "INSTANCE" &&
    node.type !== "LINE" &&
    node.type !== "POLYGON" &&
    node.type !== "RECTANGLE" &&
    //node.type !== "SECTION" &&
    node.type !== "STAMP" &&
    node.type !== "STAR" &&
    node.type !== "TEXT" &&
    node.type !== "VECTOR") return false;

  if (hasNoFillsNorStyles(node)) return false;
  if (node.fills == figma.mixed) return true;
  if (node.fills.length > 0 && node.fills[0].type === "IMAGE") return false;
  if (node.strokes.length > 0 && !node.strokeStyleId) return true;
  if (node.effects.length > 0 && !node.effectStyleId) return true;
  if (node.type === "TEXT" && !node.textStyleId) return true;
  return node.fills.length > 0 && !node.fillStyleId;
}

function isIllegalAutoLayout(node: BaseNode, authorizedSpacings: number[]) {
  if (node.type !== "FRAME" || node.layoutMode === "NONE") return false;

  if (authorizedSpacings.indexOf(node.itemSpacing) === -1) return true;
  if (authorizedSpacings.indexOf(node.paddingTop) === -1) return true;
  if (authorizedSpacings.indexOf(node.paddingRight) === -1) return true;
  if (authorizedSpacings.indexOf(node.paddingBottom) === -1) return true;
  if (authorizedSpacings.indexOf(node.paddingLeft) === -1) return true;

  return false;
}

function isIllegalRounding(node: BaseNode, authorizedRounding: number[]) {
  if (
    node.type !== "BOOLEAN_OPERATION" &&
    node.type !== "COMPONENT" &&
    node.type !== "COMPONENT_SET" &&
    node.type !== "ELLIPSE" &&
    node.type !== "FRAME" &&
    node.type !== "HIGHLIGHT" &&
    node.type !== "RECTANGLE") return false;

  if (node.cornerRadius !== figma.mixed) {
    if (authorizedRounding.indexOf(node.cornerRadius) === -1) return true;
  } else if (node.type === "COMPONENT" || node.type === "COMPONENT_SET" || node.type === "FRAME" || node.type === "RECTANGLE") {
    const corners = [node.topLeftRadius, node.topRightRadius, node.bottomRightRadius, node.bottomLeftRadius];
    return corners.some(radius => authorizedRounding.indexOf(radius) === -1);
  }
  return false;
}

function isDeprecatedInstance(node: InstanceNode): boolean {
  if (node.mainComponent === null) return true;

  let comp: (ComponentNode | ComponentSetNode) = node.mainComponent;
  if (comp.parent?.type === "COMPONENT_SET") comp = comp.parent as ComponentSetNode;

  const desc = comp.description.toLowerCase();
  if (comp.name.indexOf("/") > -1 || desc.indexOf("deprecated") > -1)
    return true;

  return false;
}
figma.showUI(__html__, {
  width: 750,
  height: 400
});