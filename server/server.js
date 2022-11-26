let {
	Sensor
} = require("./db.js")
const mqtt = require('mqtt')

const host = "broker.galasp.cn"
const port = "1883"
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`

const connectUrl = `mqtt://${host}:${port}`
const client = mqtt.connect(connectUrl, {
	clientId,
	clean: true,
	connectTimeout: 4000,
	reconnectPeriod: 1000,
})

client.on('connect', () => {
	console.log('Connected')
	client.subscribe(["from-4001-light", "from-admin"], () => {
		console.log("Subscribe to topic from-4001-light")
	})
	client.publish("to-4001-light", "cmd:hello;", {
		qos: 0,
		retain: false
	}, (error) => {
		if (error) {
			console.error(error)
		}
	})
})
let row = {
	dhth: 0,
	dhtt: 0,
	smeh: 0
};
let dhtPattern = /report:dht;humidity:([0-9\.]+?);temperature:([0-9\.]+?);/
let smePattern = /report:sme;humidity:([0-9\.]+?);/
let updatePattern = /update,(.+?)$/
let lock = true
let adminData = "[]"
client.on('message', (topic, payload) => {
	console.log('Received Message:', topic, payload.toString())
	let msg = payload.toString()
	if (dhtPattern.test(msg)) {
		lock = false
		let data = dhtPattern.exec(msg)
		row.dhth = parseFloat(data[1])
		row.dhtt = parseFloat(data[2])
	} else if (smePattern.test(msg)) {
		lock = false
		let data = smePattern.exec(msg)
		row.smeh = parseFloat(data[1])
	} else if (msg == "list") {
		client.publish("to-admin", adminData, {
			qos: 0,
			retain: false
		}, (error) => {
			if (error) {
				console.error(error)
			}
		})
	} else if (updatePattern.test(msg)) {
		adminData = updatePattern.exec(msg)[1]
	}
})
setInterval(function() {
	if (!lock) {
		Sensor.create(row)
		console.log(row)
	}
}, 5 * 60 * 1000)
let waterLock = false;
setInterval(function() {
	if (waterLock) return;
	JSON.parse(adminData).forEach(item => {
		if (parseInt(item.start.split(':')[0]) == new Date().getHours() && parseInt(item.start.split(':')[1]) == new Date().getMinutes()) {
			waterLock = true;
			setTimeout(function() {
				waterLock = false;
			}, 70 * 1000)
			client.publish("to-4001-light", "cmd:waterStart;", {
				qos: 0,
				retain: false
			}, (error) => {
				if (error) {
					console.error(error)
				}
			})
			setTimeout(function() {
				client.publish("to-4001-light", "cmd:waterStop;", {
					qos: 0,
					retain: false
				}, (error) => {
					if (error) {
						console.error(error)
					}
				})
			}, parseFloat(item.end) * 40 * 1000);
		}
	})
}, 1000)
