let Express = require("express")
let app = Express()
let port = 8881

//预处理
let BodyParser = require("body-parser")
app.use(BodyParser.urlencoded({
	extended: false
}))
app.use(BodyParser.json())
app.use(function(req, res, next) {
	req.authentication = true
	req.necs = []
	req.args = {}
	switch (req.method) {
		case "POST":
			req.args = req.body
			break
		case "GET":
			req.args = req.query
			break
		case "OPTIONS":
			res.status(200).send()
			return
	}
	// req.args.ip = req.headers["ali-cdn-real-ip"]
	next()
})

// 调试环境
if (process.env.OS == "Windows_NT") {
	// port = 80
	app.use(function(req, res, next) {
		req.authentication = false
		console.log({
			"index": req.path.substr(1),
			"method": req.method,
			"args": req.args
		})
		next()
	})
}

//加载路由
let Fs = require("fs")
Fs.readdirSync("routers").forEach(function(router) {
	if (router.substr(-3) != "ban") {
		app.use(
			`/${router.substr(0,router.length-3)}`,
			require(`./routers/${router}`)
		)
		console.log(`/${router.substr(0,router.length-3)}/ is Loaded`)
	}
})

/*-------------------起服务-------------------*/
let server = app.listen(port, "0.0.0.0", function() {
	console.log(`地址为 http://${server.address().address}:${server.address().port}`)
})
