//Zoe Tong
//This script acts as the main server hosting The Plants.
//It hosts the static HTML, javascript and CSS files
//It also writes to the googlesheet database

//Spreadsheet ID for google sheet
const SPREADSHEET_ID = ###;
//required for the app.post() and static pages
const express = require('express');
//required for the pathing requirements of other scripts
const path = require('path');
//middleware that helps express and allows it to understand json and sending between front and back
const bodyParser = require('body-parser');
//needed for css
const css = require('css');
//npm for googlesheet API
const GoogleSpreadsheet = require('google-spreadsheet');
//needed for asynch functions
const {
	promisify
} = require('util');
//json file containing spreadsheet info
const creds = require('./client_secret.json');

const Firestore = require('@google-cloud/firestore');

const db = new Firestore({
	projectId: 'the-plants',
	keyFilename: path.join(__dirname, 'keyfile.json')
});


//initialise app opject and tell it to accept json
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
//show that there's a folder full of static files called 'static'
//note: all files that aren't the server are static files (I think)
app.use(express.static(path.join(__dirname, 'public')));

//anything that's app.get('/') will be called when the initial URL is called
//This calls the main index html page
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '/index.html'));
});
//this calls the script in the static folder that has the button pressing
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '/public/script.js'));
});
//this has the css in the static folder
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '/public/styles.css'));
});

//Called when main sheet wants to save to ss
app.post('/save', async function (req, res) {
	//extract the data from the json object that was sent
	const duration = req.body.duration;
	const count = req.body.count;
	const bank = req.body.bank;
	const dateEnd = req.body.date;
  const init_bank = req.body.init_bank;
  const mode = req.body.mode;
	const indv_snap = req.body.indv_snap;

	const response = await accessSpreadsheet(duration, count, bank, dateEnd, init_bank, mode, indv_snap)
		.then(() => {
			res.send(JSON.stringify('I AM DONE!'));

		})
		.catch(err => {
			let e = 'error';
			res.send(JSON.stringify(e));
			console.log(err);

		})
	//Send a JSON response.
});

// Listen to the App Engine-specified port, or 3000 otherwise
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`server: Server listening on port ${PORT}...`);
});

//when the site receives a post with information to save, this fn gets called and saves it to the SS
async function accessSpreadsheet(duration, count, bank, dateEnd, init_bank, mode, indv_snap) {
	//spreadsheet ID
	const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
	await promisify(doc.useServiceAccountAuth)(creds);
	//call the spreadsheet
	const info = await promisify(doc.getInfo)();
	//call the info in the first sheet
	const sheet = info.worksheets[0];

	const row = {
		duration: duration,
		count: count,
		finalbank: bank,
		date: dateEnd,
		startbank : init_bank,
    mode: mode,
		individualsnapshot : indv_snap
	}
	await promisify(sheet.addRow)(row);
}
