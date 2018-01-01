import moment from 'moment';

import { aggregate } from './aggregates';
import { getFragment } from './fragments';

const createConverter = (aggregateType, fragmentType) => {

  const createArray = (length, initiator = () => null) => Array.apply(null, { length }).map(initiator);

  const prepareData = (from, to, fragment) => {
    const data = {};
    const fromUtc = moment.utc(from).startOf('day');
    const toUtc = moment.utc(to).startOf('day').add(1, 'day');
    for (let timeUtc = moment.utc(fromUtc); timeUtc.isBefore(toUtc); timeUtc = fragment.nextTime(timeUtc)) {
      data[timeUtc.unix()] = {
        time: timeUtc,
        values: []
      };
    }
    return {
      data,
      from: fromUtc,
      to: toUtc
    };
  };

  const groupData = (from, to, fragment, dataList) => {
    const container = prepareData(from, to, fragment);
    dataList.forEach(({ datapoints }) => {
      datapoints
        .filter(([value]) => value !== null)
        .forEach(([value, timestamp]) => {
          const bucket = fragment.getBucket(timestamp);
          if (!(bucket in container.data)) { return; }
          container.data[bucket].values.push(value);
        });
    });
    return container;
  };

  const aggregateData = (from, to, fragment, data) => {
    let min = Number.MAX_VALUE;
    let max = Number.MIN_VALUE;

    const aggregateFunc = aggregate(aggregateType);
    const result = [];

    const createBucket = (time) => ({
      time,
      buckets: createArray(fragment.count)
    });

    // Workaround for browsers that don't support ES2017 spec-compliant Object.values
    // Polyfill from: https://github.com/tc39/proposal-object-values-entries/blob/master/polyfill.js
    const reduce = Function.bind.call(Function.call, Array.prototype.reduce);
    const isEnumerable = Function.bind.call(Function.call, Object.prototype.propertyIsEnumerable);
    const concat = Function.bind.call(Function.call, Array.prototype.concat);
    const keys = Reflect.ownKeys;

    if (!Object.values) {
        Object.values = function values(O) {
              return reduce(keys(O), (v, k) => concat(v, typeof k === 'string' && isEnumerable(O, k) ? [O[k]] : []), []);
                };
    }
    // End Workaround

    let bucket = createBucket(moment(from).local().startOf('day'));
    Object.values(data).forEach(({ time, values }) => {
      const timeLocal = time.local();
      if (timeLocal.isBefore(bucket.time)) { return; }

      const value = values.length > 0
        ? aggregateFunc(values)
        : null;
      if (value !== null && value < min) { min = value; }
      if (value !== null && value > max) { max = value; }

      const day = moment(timeLocal).startOf('day');
      if (!day.isSame(bucket.time)) {
        result.push({ ...bucket });
        bucket = createBucket(moment(day));
      }

      const bucketIndex = fragment.getBucketIndex(timeLocal);
      bucket.buckets[bucketIndex] = value;
    });

    return {
      data: result,
      stats: {
        min,
        max
      }
    };
  };

  const convertData = (from, to, dataList) => {
    const fragment = getFragment(fragmentType);
    const container = groupData(from, to, fragment, dataList);
    const data = aggregateData(from, to, fragment, container.data);
    return {
      ...container,
      ...data
    };
  };

  return {
    convertData
  };
};

export default createConverter;
