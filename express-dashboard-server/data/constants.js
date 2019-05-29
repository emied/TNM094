var COMPRESSORS = {
	NUM: 1000,

	INDEX_DEVIATION: (60*60*24)/150, // 1 day
	START_TIME_DEVIATION: 150*1000, // 2.5 min (time between data point per compressor)
	FLOW_DEVIATION: 1000.0,
	BEARING_VIBRATION_DEVIATION: 1.0,
	OIL_PRESSURE_DEVIATION: 0.5,
	OIL_TEMP_DEVIATION: 5,
	AMBIENT_TEMP_DEVIATION: 20,
	HUMIDITY_DEVIATION: 2,

	VIBRATION_SPIKE_PROBABILITY: 0.001,
	VIBRATION_RISE_PROBABILITY: 0.01,
	PRESSURE_SPIKE_PROBABILITY: 0.001,
	PRESSURE_RISE_PROBABILITY: 0.01,

	VIBRATION_RISE_SPEED: 0.05,
	VIBRATION_SPIKE_AMP: 40,
	PRESSURE_RISE_SPEED: 0.025,
	PRESSURE_SPIKE_AMP: 40
}

COMPRESSORS.PRESSURE_WARN_LIMIT = 1.61503 + COMPRESSORS.OIL_PRESSURE_DEVIATION;
COMPRESSORS.VIBRATION_WARN_LIMIT = 3.686 + COMPRESSORS.BEARING_VIBRATION_DEVIATION;

COMPRESSORS.PRESSURE_BREAK_LIMIT = COMPRESSORS.PRESSURE_WARN_LIMIT + 1.0;
COMPRESSORS.VIBRATION_BREAK_LIMIT = COMPRESSORS.VIBRATION_WARN_LIMIT + 2.5;

exports.COMPRESSORS = COMPRESSORS;