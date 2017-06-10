const AVG = 'AVG';
const SUM = 'SUM';
const CNT = 'CNT';

const sum = (values) => values.reduce((s, n) => s + n, 0);

const aggregates = {
  [AVG]: (values) => sum(values) / values.length,
  [SUM]: (values) => sum(values),
  [CNT]: (values) => values.length
};

export const aggregate = (type) => {
  const func = aggregates[type];
  return (values) => func(values);
};

export default {
  AVG,
  SUM,
  CNT
};