import {interpolateCubehelix, interpolateHcl, interpolateHsl, interpolateLab, interpolateRgb} from "d3";

const RGB = 'RGB';
const HSL = 'HSL';
const HCL = 'HCL';
const LAB = 'LAB';
const CUBEHELIX = 'CUBEHELIX';

export const colorSpacesMap = [
  { name: 'RGB', value: RGB },
  { name: 'HSL', value: HSL },
  { name: 'HCL', value: HCL },
  { name: 'Lab', value: LAB },
  { name: 'Cubehelix', value: CUBEHELIX }
];

export const interpolationMap = {
  [RGB]: interpolateRgb,
  [HSL]: interpolateHsl,
  [HCL]: interpolateHcl,
  [LAB]: interpolateLab,
  [CUBEHELIX]: interpolateCubehelix
};

export default {
  RGB,
  HSL,
  HCL,
  LAB,
  CUBEHELIX
};
