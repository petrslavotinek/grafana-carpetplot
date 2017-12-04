import {interpolateRgbBasis} from "d3";

export default function(scheme) {
  return interpolateRgbBasis(scheme[scheme.length - 1]);
}
