const URL	= require("url");
const Directory = new Map();

Directory.find = (url) => {
	//Parse url
	const parsed = URL.parse(url,true);
	//Try to get server for that host or the default one
	return Directory.get(parsed.host) || Directory.get("*");
};

module.exports = Directory;