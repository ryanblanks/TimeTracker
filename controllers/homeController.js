(function  (homeController) {

	//var data = require("../data");

	homeController.init = function (app) {
		app.get("/", function (req, res) {
			res.render("index");
		});
	};
})(module.exports);