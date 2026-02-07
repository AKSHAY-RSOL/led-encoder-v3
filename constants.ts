import { SuitConfig } from './types';

export const COLORS = {
  background: '#1a1a1a',
  panel: '#262626',
  accent: '#00d9ff', // Neon Blue
  timelineTrack: '#333333',
  text: '#e5e5e5',
  success: '#10b981',
};

// Updated logical LED distribution based on user specifications
export const DEFAULT_SUITS: SuitConfig[] = [
  {
    id: 0,
    name: "Dancer 1",
    ledCount: 563,
    parts: {
      rTorso: 32, rPocket: 32, rArmDown: 32, rFingers: 6, rArmUpper: 42,
      face: 42, lArmUp: 46, lFingers: 6, lArmDown: 33, lPocket: 34,
      lTorso: 34, lLegOuter: 54, lLegInner: 50, rLegInner: 42, rLegOuter: 67,
      lLegOuterExt: 11
    }
  },
  {
    id: 1,
    name: "Dancer 2",
    ledCount: 545,
    parts: {
      rTorso: 32, rPocket: 39, rArmDown: 32, rFingers: 6, rArmUpper: 43,
      face: 44, lArmUp: 42, lFingers: 6, lArmDown: 33, lPocket: 37,
      lTorso: 30, lLegOuter: 51, lLegInner: 38, rLegInner: 39, rLegOuter: 63,
      lLegOuterExt: 13
    }
  },
  {
    id: 2,
    name: "Dancer 3",
    ledCount: 541,
    parts: {
      rTorso: 33, rPocket: 36, rArmDown: 28, rFingers: 6, rArmUpper: 40,
      face: 41, lArmUp: 39, lFingers: 6, lArmDown: 30, lPocket: 33,
      lTorso: 39, lLegOuter: 51, lLegInner: 41, rLegInner: 41, rLegOuter: 64,
      lLegOuterExt: 13
    }
  },
  {
    id: 3,
    name: "Dancer 4",
    ledCount: 569,
    parts: {
      rTorso: 32, rPocket: 37, rArmDown: 28, rFingers: 6, rArmUpper: 43,
      face: 45, lArmUp: 41, lFingers: 6, lArmDown: 31, lPocket: 36,
      lTorso: 36, lLegOuter: 57, lLegInner: 48, rLegInner: 37, rLegOuter: 73,
      lLegOuterExt: 13
    }
  },
  {
    id: 4,
    name: "Dancer 5",
    ledCount: 574,
    parts: {
      rTorso: 32, rPocket: 34, rArmDown: 33, rFingers: 6, rArmUpper: 46,
      face: 41, lArmUp: 43, lFingers: 6, lArmDown: 32, lPocket: 32,
      lTorso: 32, lLegOuter: 54, lLegInner: 45, rLegInner: 50, rLegOuter: 73,
      lLegOuterExt: 15
    }
  }
];

export const SAMPLE_CUES = [
  {
    id: '1',
    suitId: 0,
    startTime: 1000,
    duration: 2000,
    type: 'solid',
    color: '#ff0000',
    ledRangeStart: 0,
    ledRangeEnd: 563,
  },
  {
    id: '2',
    suitId: 2,
    startTime: 2500,
    duration: 3000,
    type: 'chase',
    color: '#00d9ff',
    secondaryColor: '#000000',
    speed: 5,
    ledRangeStart: 143, // Face start
    ledRangeEnd: 183,   // Face end (143 + 41 - 1)
  },
] as const;