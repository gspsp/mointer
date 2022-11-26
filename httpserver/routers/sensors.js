const Express = require("express")
let {
	Sensor
} = require("../db.js")
let T = require("sequelize")
let {
	Op
} = require("sequelize")
let M = require("../methods.js")
let router = Express.Router()

//验证邮箱
router.all("/get", function(req, res, next) {
	req.necs = ["from", "to"]
	next()
}, M.argChecker, function(req, res, next) {
	Sensor.findAll({
		where: {
			createdAt: {
				[Op.gt]: new Date(parseInt(req.args.from)),
				[Op.lt]: new Date(parseInt(req.args.to))
			}
		}
	}).then(rows => {
		res.send(rows)
	}).catch(e => {
		console.log(e)
	})
})

module.exports = router
