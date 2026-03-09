---
layout: post
title: Reykjavík and Gothenburg, a weather comparison
date: 2026-03-09 00:00:00 +0000
---
Data visualization comparing weather patterns between Reykjavík, Iceland and Gothenburg, Sweden

---
## Background

Ever since I moved to Gothenburg from Reykjavík I have been getting questions about the weather in Iceland. Gothenburg is known for being gray, windy, and rainy, and I usually say that Reykjavík is grayer, windier and rainier than Gothenburg.

Some time ago I got the idea to dig into the numbers and see if it was actually true that it rains more and is windier in Reykjavík than in Gothenburg. This blog post is the outcome of that work.

The data presented here is based on historical weather records from both cities, between 2010 and 2025, with the data collected from Veðurstofa Íslands (the National Weather Service, www.vedur.is) and the SMHI (Swedish Meteorological and Hydrological Institute, www.smhi.se).

---

## Monthly average temperature

Which city is the warmer one? Let's start by looking at the average temperatures. 

On average, both cities have similar temperatures at the beginning of the year, in January and February, but in March it starts to get warmer in Gothenburg and it continues to be like that for the rest of the year. During the summer months, June, July, and August, the average temperature is clearly higher in Gothenburg than in Reykjavík.

<iframe src="{{ site.baseurl }}/assets/images/gbg_rvk_comparison/reykjavik_gothenburg_comparison_monthly_temperature.html" style="width:100%; height:600px; border:none;"></iframe>

## Average monthly minimum and maximum temperatures

The average temperature only says so much. Looking at the average minimum and maximum temperatures for each month we see a clearer trend. Gothenburg is clearly the warmer city over the summer months, with Gothenburg's average minimum temperature during the summer being the same as Reykjavík's average maximum temperature.

<iframe src="{{ site.baseurl }}/assets/images/gbg_rvk_comparison/reykjavik_gothenburg_comparison_monthly_min_max_temperature.html" style="width:100%; height:600px; border:none;"></iframe>

## Average yearly temperature

As was to be expected after the previous image with the monthly temperatures, the yearly average is higher for Gothenburg as well. The difference is really noticeable for the years 2015, 2018 and 2024, where Gothenburg had a very warm year and Reykjavík a very cold one.

<iframe src="{{ site.baseurl }}/assets/images/gbg_rvk_comparison/reykjavik_gothenburg_comparison_yearly_temperature.html" style="width:100%; height:600px; border:none;"></iframe>


## 20 Degree Days or "Tuttugu gráður á pallinum"?

People typically prefer warm days and there seems to be way more of them in Gothenburg than in Reykjavík.

In Reykjavík, and in Iceland in general, people often note when the temperature reaches 20 degrees Celsius on the patio around the house, where there is shelter from the wind and the sun shines directly on to the patio. In those scenarios the temperature often exceeds the magic number 20 degrees, but the official temperature measurements measure the temperature of the air, which is usually lower. Therefore the number of days where the temperature reached 20 degrees in Reykjavík might seem lower than people experience.

<iframe src="{{ site.baseurl }}/assets/images/gbg_rvk_comparison/reykjavik_gothenburg_comparison_20_degree_days.html" style="width:100%; height:600px; border:none;"></iframe>

What about cold days, is Reykjavík so much colder? 2010 looks like an exceptionally cold year in Gothenburg, but apart from that Reykjavík typically has more days where the temperature goes below 0 degrees Celsius. Note that the plot below shows the number of days where the day's **minimum** temperature went below 0 degrees Celsius.

<iframe src="{{ site.baseurl }}/assets/images/gbg_rvk_comparison/reykjavik_gothenburg_comparison_below_zero_days.html" style="width:100%; height:600px; border:none;"></iframe>

Let's take a look at the percentage of days where the day's **max temperature** was at or above certain thresholds. Both cities have equivalently many days at or above 0 degrees Celsius but Gothenburg has quite a few more days where the temperature reached 10 degrees Celsius than what Reykjavík had.

<iframe src="{{ site.baseurl }}/assets/images/gbg_rvk_comparison/reykjavik_gothenburg_comparison_temperature_max_threshold_percentages.html" style="width:100%; height:600px; border:none;"></iframe>


---

## Looking at the wind

Both cities are known for being windy, so which one is windier? Reykjavík looks to be considerably windier in the winter months but both cities are as windy during summer. It's worth noting that the wind in Gothenburg seems to be similar for all months of the year.

<iframe src="{{ site.baseurl }}/assets/images/gbg_rvk_comparison/reykjavik_gothenburg_comparison_monthly_wind.html" style="width:100%; height:600px; border:none;"></iframe>

Average wind only says so much, let's take a look at the number of days where it was really windy!

<iframe src="{{ site.baseurl }}/assets/images/gbg_rvk_comparison/reykjavik_gothenburg_comparison_10_mps_wind_days.html" style="width:100%; height:600px; border:none;"></iframe>

> Reykjavík has way more days with wind speeds of 10 meters per second or more than Gothenburg, so Reykjavík definitely looks like the windier city.

The 10 meters per second threshold might look like a cherry-picked threshold. Let's look at some other thresholds. Still, Reykjavík is clearly the windier city of the two.

<iframe src="{{ site.baseurl }}/assets/images/gbg_rvk_comparison/reykjavik_gothenburg_comparison_wind_max_threshold_percentages.html" style="width:100%; height:600px; border:none;"></iframe>

---

## Rain-kjavík or Raining-burg?

Where does it rain more? Here Gothenburg takes the win, as the city with more total precipitation each year. Note that this is just *total precipitation* and not the type, meaning it might snow more in Reykjavík than in Gothenburg.

<iframe src="{{ site.baseurl }}/assets/images/gbg_rvk_comparison/reykjavik_gothenburg_comparison_yearly_precipitation.html" style="width:100%; height:600px; border:none;"></iframe>

Let's take a closer look at average monthly precipitation. We see that it rains considerably more in Gothenburg in summer than it does in Reykjavík! So even though Gothenburg is warmer in the summer, it also rains more there, so Gothenburg might not be the ideal summer destination.

<iframe src="{{ site.baseurl }}/assets/images/gbg_rvk_comparison/reykjavik_gothenburg_comparison_monthly_precipitation.html" style="width:100%; height:600px; border:none;"></iframe>

What about number of days with precipitation? Reykjavík is famous for rapidly changing weather, where it can be sunny one moment and raining the next, so it would be interesting to see if there are more days with precipitation in Reykjavík than in Gothenburg. From the plot below we see that this is definitely the case. The number of days with measured precipitation is clearly higher in Reykjavík than in Gothenburg.

<iframe src="{{ site.baseurl }}/assets/images/gbg_rvk_comparison/reykjavik_gothenburg_comparison_days_with_precipitation.html" style="width:100%; height:600px; border:none;"></iframe>

Let's look at year-by-year days with precipitation. Again, we see that there are more days with precipitation in Reykjavík than in Gothenburg.

<iframe src="{{ site.baseurl }}/assets/images/gbg_rvk_comparison/reykjavik_gothenburg_comparison_yearly_days_with_precipitation.html" style="width:100%; height:600px; border:none;"></iframe>

> Reykjavík has more days with precipitation than Gothenburg, but there is still **more yearly precipitation** (total rain and snow during the year) in Gothenburg than in Reykjavík.

---

## Hello sunshine: does midnight sun count?

Sun matters! And on average there seems to be more of it in Gothenburg, except for October, where Reykjavík has on average slightly more sun hours than Gothenburg.

<iframe src="{{ site.baseurl }}/assets/images/gbg_rvk_comparison/reykjavik_gothenburg_comparison_monthly_sun_hours.html" style="width:100%; height:600px; border:none;"></iframe>

## Average yearly sun hours

Looking at the yearly average, we see again that Gothenburg has more sun than Reykjavík.

<iframe src="{{ site.baseurl }}/assets/images/gbg_rvk_comparison/reykjavik_gothenburg_comparison_yearly_sun_hours.html" style="width:100%; height:600px; border:none;"></iframe>

<!-- Phew, the next plot is difficult but it is the *total sun hours of each month*. The x-axis still needs some work. We see that the sun hours are low in the winter but peak during summer, and for some years there was even more sun in Reykjavík than Gothenburg! Most years there are more total sun hours in Gothenburg than Reykjavík though.

<iframe src="{{ site.baseurl }}/assets/images/gbg_rvk_comparison/reykjavik_gothenburg_comparison_sun_hours_by_year_month.html" style="width:100%; height:600px; border:none;"></iframe> -->

## Days Without Sun: The Polar Night Phenomenon or just two gray cities?

Gothenburg is gray, what about Reykjavík? Let's take a look at the number of days in both cities where there is *no measured sunshine*.

The winter is dark in both cities, there is no denying it. January and December are specially dark in Reykjavík but February, March, October and November seem to be equally gray in both cities.

<iframe src="{{ site.baseurl }}/assets/images/gbg_rvk_comparison/reykjavik_gothenburg_comparison_days_without_sun.html" style="width:100%; height:600px; border:none;"></iframe>

---

## Conclusion

From the above it's clear that Reykjavík is definitely windier than Gothenburg, while Gothenburg is the rainier city of the two and also warmer than Reykjavík. When it comes to being a gray city, Gothenburg is the city with the more sun hours, and Reykjavík the city with more days without any measured sun, but I'm not sure that is enough to conclude that Reykjavík is the grayer city of the two.

So all in all, I'll describe Reykjavík in the future as being colder and windier than Gothenburg, but definitely not more rainy than Gothenburg!