#include <iostream>
#include <string>
#include <algorithm>
#include <fstream>
#include <iomanip>
#include <map>
#include <set>

// csv.h is a header-only library from: https://github.com/ben-strasser/fast-cpp-csv-parser
#include "csv.h" 

#define M_PI 3.141592653589793238462643383279502884
#define EARTH_RADIUS 6371000
#define MPS_TO_KMH 3.6

#define FIXED_FLOAT(x) std::fixed << std::setprecision(2) << (x)
#define FIXED_FLOAT_LONG(x) std::fixed << std::setprecision(15) << (x)

double deg2rad(double deg)
{
	return deg * M_PI / 180.0;
}

void remove_quotes(std::string &str)
{
	str.erase(std::remove(str.begin(), str.end(), '\"'), str.end());
}

int main()
{
	std::ofstream tot_file;
	tot_file.open("fordgobike_complete_all.csv");

	tot_file << "start_time,speed,age,gender,start_lat,start_lon,end_lat,end_lon,duration,bike_id,start_id,end_id,user_type,distance\n";

	std::map<int, std::string> id_station;

	int samp = 0;
	for (int i = 0; i < 12; i++)
	{
		std::string filename = "C:/Users/Laptop/Documents/Code/clean_csv_data/x64/Release/2018"; 
		filename += i + 1 <= 9 ? "0" : "";
		filename += std::to_string(i + 1);
		filename += "-fordgobike-tripdata.csv";

		io::CSVReader<14> in(filename);
		in.read_header(io::ignore_extra_column, 
			"\"duration_sec\"" , "\"start_time\"", 
			"\"start_station_latitude\"", "\"start_station_longitude\"", 
			"\"end_station_latitude\"", "\"end_station_longitude\"", 
			"\"member_birth_year\"", "\"member_gender\"", "\"bike_id\"", 
			"\"start_station_id\"", "\"end_station_id\"", "\"start_station_name\"", 
			"\"end_station_name\"", "\"user_type\"");

		int duration_sec, bike_id;
		std::string start_station_latitude_s, start_station_longitude_s, end_station_latitude_s, end_station_longitude_s; 
		std::string start_time, member_birth_year, member_gender, user_type, start_station_name, end_station_name, start_station_id, end_station_id;

		try 
		{
			while (in.read_row(
				duration_sec, start_time, 
				start_station_latitude_s, start_station_longitude_s, 
				end_station_latitude_s, end_station_longitude_s, 
				member_birth_year, member_gender, bike_id, start_station_id, 
				end_station_id, start_station_name, end_station_name, user_type))
			{

				double start_station_latitude, start_station_longitude, end_station_latitude, end_station_longitude;

				start_station_latitude = std::stod(start_station_latitude_s);
				start_station_longitude = std::stod(start_station_longitude_s);
				end_station_latitude = std::stod(end_station_latitude_s);
				end_station_longitude = std::stod(end_station_longitude_s);

				double deltaLat = deg2rad(end_station_latitude - start_station_latitude);
				double deltaLon = deg2rad(end_station_longitude - start_station_longitude);
				double x = deltaLon * cos(deg2rad((start_station_latitude + end_station_latitude) / 2.0));
				double y = deltaLat;
				double dist = EARTH_RADIUS * (abs(x) + abs(y)); // manhattan distance

				int age = 0;
				if (!(member_birth_year == "\"\""))
				{
					age = 2018 - std::stoi(member_birth_year);
				}

				remove_quotes(start_station_id);
				remove_quotes(end_station_id);
				remove_quotes(start_station_name);
				remove_quotes(end_station_name);

				int start_id;
				int end_id;

				try
				{
					start_id = std::stoi(start_station_id);
					end_id = std::stoi(end_station_id);
				}
				catch (const std::exception &ex)
				{
					std::cout << ex.what() << std::endl;
					continue;
				}

				id_station.insert(std::make_pair(start_id, start_station_name));
				id_station.insert(std::make_pair(end_id, end_station_name));

				remove_quotes(user_type);
				
				if (!(member_birth_year == "\"\"" || member_gender == "\"\"" || age < 19 || age > 75 || dist <= 10 || duration_sec <= 10))
				{
					remove_quotes(start_time);
					remove_quotes(member_gender);
					
					//start_time.erase(0, 5);
					start_time.erase(start_time.length() - 5, start_time.length() - 1);

					int gender;
					if (member_gender == "Male")
					{
						gender = 1;
					}
					else if (member_gender == "Female")
					{
						gender = 2;
					}
					else
					{
						gender = 3;
					}

					if (user_type == "Subscriber")
					{
						user_type_id = 1;
					}
					else // user_type == "Customer"
					{
						user_type_id = 2;
					}

					tot_file << start_time << ",";
					tot_file << FIXED_FLOAT((dist / duration_sec) * MPS_TO_KMH) << ",";
					tot_file << age << ",";
					tot_file << gender << ",";
					tot_file << start_station_latitude_s << ",";
					tot_file << start_station_longitude_s << ",";
					tot_file << end_station_latitude_s << ",";
					tot_file << end_station_longitude_s << ",";
					tot_file << duration_sec << ",";
					tot_file << bike_id << ",";
					tot_file << start_id << ",";
					tot_file << end_id << ",";
					tot_file << user_type_id << ",";
					tot_file << FIXED_FLOAT(dist) << std::endl;
				}
			}
		}
		catch (const std::exception &ex)
		{
			std::cout << ex.what() << std::endl;
			tot_file.close();
			return 0;
		}
	}

	tot_file.close();

	std::ofstream station_id_names;
	station_id_names.open("station_id_names.csv");

	station_id_names << "id,name" << std::endl;

	for (auto const& x : id_station)
	{
		station_id_names << x.first << "," << x.second << std::endl;
	}

	station_id_names.close();

	return 0;
}