let {
	Sequelize,
	DataTypes,
	Op
} = require("sequelize")

let Tables = new Sequelize("giraffe", "giraffe", "EF56BEaJwabMzpJn", {
	host: "121.36.105.227",
	dialect: "mysql",
	logging: false,
	define: {
		charset: "utf8",
		collate: "utf8_general_ci"
	},
	dialectOptions: {
		dateStrings: true,
		typeCast: true
	},
	timezone: "+08:00"
})

let Sensor = Tables.define("sensor", {
	dhth: {
		type: DataTypes.DOUBLE,
		charset: "utf8"
	},
	dhtt: {
		type: DataTypes.DOUBLE,
		charset: "utf8"
	},
	smeh: {
		type: DataTypes.DOUBLE,
		charset: "utf8"
	}
})

Sensor.sync({
	alter: true
})


module.exports = {
	Sensor
}
