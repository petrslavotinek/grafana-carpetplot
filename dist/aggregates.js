'use strict';

System.register([], function (_export, _context) {
  "use strict";

  var _aggregates, AVG, SUM, CNT, sum, aggregates, aggregate, aggregatesMap;

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
    setters: [],
    execute: function () {
      AVG = 'AVG';
      SUM = 'SUM';
      CNT = 'CNT';

      sum = function sum(values) {
        return values.reduce(function (s, n) {
          return s + n;
        }, 0);
      };

      aggregates = (_aggregates = {}, _defineProperty(_aggregates, AVG, function (values) {
        return sum(values) / values.length;
      }), _defineProperty(_aggregates, SUM, function (values) {
        return sum(values);
      }), _defineProperty(_aggregates, CNT, function (values) {
        return values.length;
      }), _aggregates);

      _export('aggregate', aggregate = function aggregate(type) {
        var func = aggregates[type];
        return function (values) {
          return func(values);
        };
      });

      _export('aggregate', aggregate);

      _export('aggregatesMap', aggregatesMap = [{ name: 'Average', value: AVG }, { name: 'Sum', value: SUM }, { name: 'Count', value: CNT }]);

      _export('aggregatesMap', aggregatesMap);

      _export('default', {
        AVG: AVG,
        SUM: SUM,
        CNT: CNT
      });
    }
  };
});
//# sourceMappingURL=aggregates.js.map
