# Data Specifications

## fordgobike_complete_all.csv

| Value		   | Unit      | Explanation | 
|	---------- | --------- | ----------- |
| start_time | date | The start time of the bike trip. Formatted as "YYYY-MM-DD hh:mm:ss" |
| speed			 | km/h | Average speed of the whole trip in km/h. Calculated from the manhattan distance between the start and end station divided by bike trip duration. The real distance could be much longer depending on bike route, which makes this more of a measure of 'leisurely:ness'. |
| age        | years | Integer age of bike rider. |
| gender     | - | Gender of bike rider. Encoded to integers: 1 = Male, 2 = Female, 3 = Other |
| start_lat  | degrees | Latitude of start station. Formatted as real number degrees. |
| start_lon  | degrees | Longitude of start station. Formatted as real number degrees. |
| end_lat    | degrees | Latitude of end station. Formatted as real number degrees. |
| end_lon    | degrees | Longitude of end station. Formatted as real number degrees. |
| duration   | seconds | Duration of bike trip in seconds. |
| bike_id    | - | Unique integer ID of a specific bike. |
| start_id   | - | Unique integer ID of start station. Name of each station with a specific ID is located in *station_id_names.csv*. |
| end_id     | - | Unique integer ID of end station. Name of each station with a specific ID is located in *station_id_names.csv*. |
| user_type  | - | User type encoded to integer. 1 = Subscriber, 2 = Customer |
| distance   | meters | Manhattan distance between start and end station in meters. Calculated from the start and end station latitude and longitude, see *reduction-code/clean_bike_data.cpp*. |

## station_id_names.csv

This file is used to get the station name from corresponding station ID in *fordgobike_complete_all.csv*

| Value | Explanation  |
| ----- | ------------ |
| id    | Unique integer ID of a specific station. |
| name  | Name of station. |