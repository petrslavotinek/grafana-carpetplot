# Carpet plot

Carpet plot panel plugin for grafana.

![Carpet plot - Screenshot 1 - Panel and options](https://raw.githubusercontent.com/petrslavotinek/grafana-carpetplot/master/dist/src/img/screenshot1.png)

![Carpet plot - Screenshot 2 - Panel](https://raw.githubusercontent.com/petrslavotinek/grafana-carpetplot/master/dist/src/img/screenshot2.png)

## How to use

This panel receives data series and divides all the data into individual buckets. It groups the data first by day and then by a selected fragment of a day (hour / 15 minutes / minute). If there are multiple data points in a bucket (for example there were multiple series) it aggregates the points using a selected function (average, sum, count).

The data are displayed in a grid where each bucket is presented by corresponding color calculated from a selected color scheme.

Tested with InfluxDb data source.

## Available options

* Colors
  * Scheme: Color scheme to represent data values.
  * Null Color: Color to represent buckets with null value.
  * Min: Minimum value corresponding to the leftmost color of the sceheme. If not set, is calculated as a minimum value in current visible data set.
  * Max: Maximum value corresponding to the rightmost color of the sceheme. If not set, is calculated as a maximum value in current visible data set.
* Data
  * Aggregate: Function used to aggregate values in a single bucket. (Average / Sum / Count / Min / Max / First / Last)
  * Fragment: Fragment of a day. (Hour, 15 minutes, Minute)
  * Decimals: Number of decimals displayed in tooltip and legend.
  * Unit: Unit format used in tooltip and legend.
* X Axis:
  * Show weekends: If selected, displays lines marking beggining and end of weekends.
  * Min bucket width: Minimum required width of a bucket in px to enable displaying of weekend lines.
  * Show crosshair: If selected, displays crosshair in x axis on hover.
* Y Axis:
  * Show crosshair: If selected, displays crosshair in y axis on hover.
* Tooltip:
  * Show: If selected, displays tooltip on hover.
* Legend:
  * Show: If selected, displays legend under graph.

## Changelog

* 0.0.2
  * New aggregate functions: Min, Max, First, Last