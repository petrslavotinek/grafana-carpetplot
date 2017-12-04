"use strict";

System.register(["d3"], function (_export, _context) {
  "use strict";

  var interpolateRgbBasis;

  _export("default", function (scheme) {
    return interpolateRgbBasis(scheme[scheme.length - 1]);
  });

  return {
    setters: [function (_d) {
      interpolateRgbBasis = _d.interpolateRgbBasis;
    }],
    execute: function () {}
  };
});
//# sourceMappingURL=ramp.js.map
