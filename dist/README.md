# Carpet plot

Carpet plot panel plugin for grafana.

## How to use

This panel receives data series and divides all the data into individual buckets. It groups the data first by day and then by a selected fragment of a day (hour / 15 minutes / minute). If there are multiple data points in a bucket (for example there were multiple series) it aggregates the points using a selected function (average, sum, count).

The data are displayed in a grid where each bucket is presented by corresponding color calculated from a selected color scheme.

Tested with InfluxDb data source.

## Available options

* Colors
  * Scheme
  * Null Color
  * Min
  * Max

