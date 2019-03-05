#include "csv.h" // https://github.com/ben-strasser/fast-cpp-csv-parser
#include <iostream>
#include <string>
#include <algorithm>
#include <fstream>
#include <iomanip>

#define M_PI 3.141592653589793238462643383279502884
#define EARTH_RADIUS 6371000
#define MPS_TO_KMH 3.6

#define FIXED_FLOAT(x) std::fixed << std::setprecision(2) << (x)

double deg2rad(double deg)
{
	return deg * M_PI / 180.0;
}

int main()
{
	std::ofstream tot_file;
	tot_file.open("fordgobike_mhd_reduced_all.csv");

	tot_file << "start_time,speed,age,gender\n";

	int samp = 0;
	for (int i = 0; i < 12; i++)
	{
		std::string filename = "C:/Users/Laptop/Documents/Code/clean_csv_data/x64/Release/2018"; 
		filename += i + 1 <= 9 ? "0" : "";
		filename += std::to_string(i + 1);
		filename += "-fordgobike-tripdata.csv";

		io::CSVReader<8> in(filename);
		in.read_header(io::ignore_extra_column, 
			"\"duration_sec\"" , "\"start_time\"", 
			"\"start_station_latitude\"", "\"start_station_longitude\"", 
			"\"end_station_latitude\"", "\"end_station_longitude\"", 
			"\"member_birth_year\"", "\"member_gender\"");

		int duration_sec;
		double start_station_latitude, start_station_longitude, end_station_latitude, end_station_longitude; 
		std::string start_time, member_birth_year, member_gender;

		std::ofstream file;
		file.open("fordgobike_mhd_reduced_" + std::to_string(i + 1) + ".csv");

		file << "start_time,speed,age,gender\n";

		try 
		{
			while (in.read_row(
				duration_sec, start_time, 
				start_station_latitude, start_station_longitude, 
				end_station_latitude, end_station_longitude, 
				member_birth_year, member_gender))
			{

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
				
				samp++;
				if (!(member_birth_year == "\"\"" || member_gender == "\"\"" || age < 19 || age > 75 || dist <= 10 || duration_sec <= 10) && (samp % 16) == 0)
				{
					start_time.erase(std::remove(start_time.begin(), start_time.end(), '\"'), start_time.end());
					member_gender.erase(std::remove(member_gender.begin(), member_gender.end(), '\"'), member_gender.end());
					start_time.erase(0, 5);
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

					file << start_time << ",";
					file << FIXED_FLOAT((dist / duration_sec) * MPS_TO_KMH) << ",";
					file << age << ",";
					file << gender << std::endl;

					tot_file << start_time << ",";
					tot_file << FIXED_FLOAT((dist / duration_sec) * MPS_TO_KMH) << ",";
					tot_file << age << ",";
					tot_file << gender << std::endl;
				}
			}
		}
		catch (const std::exception &ex)
		{
			std::cout << ex.what() << std::endl;
			file.close();
			tot_file.close();
			return 0;
		}

		file.close();
	}

	tot_file.close();

	return 0;
}