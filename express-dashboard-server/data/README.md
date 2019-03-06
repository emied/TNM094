# Data Specifications
Specifications/explanations of all datasets.
## 'bike' dataset
Electronic bike data from [fordgobike](https://www.fordgobike.com/system-data).  
Our dataset uses data from 2018 and has been modified with [reduction-code/clean_bike_data.cpp](https://github.com/emied/TNM094/blob/2ac9288110bd753e4490cabc71e01c9254fcb0a1/express-dashboard-server/data/reduction-code/clean_bike_data.cpp).  
Modified data can be downloaded here: [bike_data.zip](https://drive.google.com/open?id=1jbFELcc1uSpDjsoRgh6fr_px7Fo668NT). Unzip to *data/source* directory.  
### fordgobike_complete_all.csv

| Value		   | Unit      | Example Value | Explanation | 
|	:--------: | :-------: | :-----: | ----------- |
| start_time | date      | 2018-09-27 16:31:26 | The start time of the bike trip. Formatted as *YYYY-MM-DD hh:mm:ss* |
| speed			 | km/h      | 13.54 | Average speed of the whole trip in km/h. Calculated from the manhattan distance between the start and end station divided by bike trip duration. The real distance could be much longer depending on bike route, which makes this more of a 'leisurely:ness' measure. |
| age        | years     | 32 | Integer age of bike rider. |
| gender     | -         | 2 | Gender of bike rider. Encoded to integers to reduce data: 1 = Male, 2 = Female, 3 = Other |
| start_lat  | degrees   | 37.330165 | Latitude of start station. Formatted as real number degrees. |
| start_lon  | degrees   | -121.885831 | Longitude of start station. Formatted as real number degrees. |
| end_lat    | degrees   | 37.333798 | Latitude of end station. Formatted as real number degrees. |
| end_lon    | degrees   | -121.886943 | Longitude of end station. Formatted as real number degrees. |
| duration   | seconds   | 849 | Duration of bike trip in seconds. |
| bike_id    | -         | 2473 | Unique integer ID of a specific bike. |
| start_id   | -         | 28 | Unique integer ID of start station. Name of each station with a specific ID is located in *station_id_names.csv*. |
| end_id     | -         | 92 | Unique integer ID of end station. Name of each station with a specific ID is located in *station_id_names.csv*. |
| user_type  | -         | 1 | User type. Encoded to integers to reduce data: 1 = Subscriber, 2 = Customer |
| distance   | meters    | 1872.75 | Manhattan distance between start and end station in meters. Calculated from the start and end station latitude and longitude, see [reduction-code/clean_bike_data.cpp L76-80](https://github.com/emied/TNM094/blob/2ac9288110bd753e4490cabc71e01c9254fcb0a1/express-dashboard-server/data/reduction-code/clean_bike_data.cpp#L76-L80). |

### station_id_names.csv

This file is used to get the station name from corresponding station ID in *fordgobike_complete_all.csv*

| Value | Example Value | Explanation  |
| :---: | :----: | ------------ |
| id    | 42 | Unique integer ID of a specific station. |
| name  | San Francisco City Hall (Polk St at Grove St) | Name of station. |