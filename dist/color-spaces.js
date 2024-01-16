'use strict';

System.register(['d3'], function (_export, _context) {
  "use strict";

  var interpolateCubehelix, interpolateHcl, interpolateHsl, interpolateLab, interpolateRgb, _interpolationMap, RGB, HSL, HCL, LAB, CUBEHELIX, colorSpacesMap, interpolationMap;

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  return {
    setters: [function (_d) {
      interpolateCubehelix = _d.interpolateCubehelix;
      interpolateHcl = _d.interpolateHcl;
      interpolateHsl = _d.interpolateHsl;
      interpolateLab = _d.interpolateLab;
      interpolateRgb = _d.interpolateRgb;
    }],
    execute: function () {
      RGB = 'RGB';
      HSL = 'HSL';
      HCL = 'HCL';
      LAB = 'LAB';
      CUBEHELIX = 'CUBEHELIX';

      _export('colorSpacesMap', colorSpacesMap = [{ name: 'RGB', value: RGB }, { name: 'HSL', value: HSL }, { name: 'HCL', value: HCL }, { name: 'Lab', value: LAB }, { name: 'Cubehelix', value: CUBEHELIX }]);

      _export('colorSpacesMap', colorSpacesMap);

      _export('interpolationMap', interpolationMap = (_interpolationMap = {}, _defineProperty(_interpolationMap, RGB, interpolateRgb), _defineProperty(_interpolationMap, HSL, interpolateHsl), _defineProperty(_interpolationMap, HCL, interpolateHcl), _defineProperty(_interpolationMap, LAB, interpolateLab), _defineProperty(_interpolationMap, CUBEHELIX, interpolateCubehelix), _interpolationMap));

      _export('interpolationMap', interpolationMap);

      _export('default', {
        RGB: RGB,
        HSL: HSL,
        HCL: HCL,
        LAB: LAB,
        CUBEHELIX: CUBEHELIX
      });
    }
  };
});
//# sourceMappingURL=color-spaces.js.map
