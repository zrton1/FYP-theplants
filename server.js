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

const compression = require('compression');

const Firestore = require('@google-cloud/firestore');

const db = new Firestore({
	projectId: 'the-plants',
	keyFilename: path.join(__dirname, 'keyfile.json')
});


//initialise app opject and tell it to accept json
const app = express();

compression();
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

app.get('/survey', (req, res) => {
	res.sendFile(path.join(__dirname, '/public/main.html'));
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

app.post('/getMax', async function (req, res) {
	const s = req.body.state; //needs to be Number
	let maxWeightAction;
	maxWeightAction = await readMaxWeight(s)
		.then(results => {
			response = JSON.stringify(results.action);

			res.json(response);
		})
		.catch(error => {
			console.log('/getMax error', error);
		})
});

app.post('/Qs', async function (req, res) {
	const s = req.body.state; //needs to be Number
	let a = req.body.action;
	a = a.toString();
	let weight = await readWeight(s, a)
		.then(results => {
			response = JSON.stringify(results.action);

			res.send(response);
		})
		.catch(error => {
			console.log('/Qs error', error);
		})
});

app.post('/Qwrite', async function (req, res) {
	const Qs = req.body.Qs; //needs to be a number
	const s = req.body.state; //needs to be a Number
	let a = req.body.action; //needs to be a string
	a = a.toString();
	await writeWeight(Qs, s, a)
		.then(results => {
			res.json('done');
		})
		.catch(error => {
			console.log('/Qwrite error', error);
		})
});


//Specify the action (a) and state (s) and the updated weight Qs
//REMEMBER THAT a MUST BE A STRING
async function writeWeight(Qs, s, a) {
	let docRef = db.collection('action-state').doc(a);
	switch (s) {
		case 0:
			docRef.update({
				s0: Qs
			});
			break;
		case 1:
			docRef.update({
				s1: Qs
			});
			break;
		case 2:
			docRef.update({
				s2: Qs
			});
			break;
		case 3:
			docRef.update({
				s3: Qs
			});
			break;
		case 4:
			docRef.update({
				s4: Qs
			});
			break;
		case 5:
			docRef.update({
				s5: Qs
			});
			break;
		default:
			docRef.update({
				s0: Qs
			});
	}

	return {
		action: Qs
	};
}

//This function returns the state with the max weight from the database
async function readWeight(s, a) { //s is no. and a is string
	let weight;
	let docRef = await db.collection('action-state').doc(a).get() //doc is the action
		.then(snapshot => {
			if (snapshot.empty) {
				console.log('no matches');
			}
			switch (s) {
				case 0:
					//snapshot.data().s0 is the weight
					weight = snapshot.data().s0;
					break;
				case 1:
					weight = snapshot.data().s1;
					break;
				case 2:
					weight = snapshot.data().s2;
					break;
				case 3:
					weight = snapshot.data().s3;
					break;
				case 4:
					weight = snapshot.data().s4;
					return {
						action: weight
					};
					break;
				case 5:
					weight = snapshot.data().s5;
					break;
				default:
					weight = snapshot.data().s0;

			}
		})
		.catch(err => {
			console.log('reaadWeight Error getting documents', err);
		});
	return {
		action: weight
	};
}

//This function returns the state with the max weight from the database
async function readMaxWeight(s) { //s is the state number. Input as
	s = 's' + s.toString(); //changes into for 's0' etc
	let maxAction;
	let docRef = db.collection('action-state').orderBy(s, 'desc').limit(1);
	const queryRef = await docRef.get()
		.then(snapshot => {
			if (snapshot.empty) {
				console.log('server: no matching documents');
				return;
			} else {
				snapshot.forEach(doc => {
					maxAction = Number(doc.id);
				});
			}
		})
		.catch(err => {
			console.log('readMax: Error getting documents', err);
		});
	return {
		action: maxAction
	};
}

// Listen to the App Engine-specified port, or 3000 otherwise
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`server: Server listening on port ${PORT}...`);
});

//when the site receives a post with information to save, this fn gets called and saves it to the SS
async function accessSpreadsheet(duration, count, bank, dateEnd, init_bank, mode, indv_snap) {
	//spreadsheet ID
	const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
	await promisify(doc.useServiceAccountAuth)(creds)
	//call the spreadsheet
	const info = await promisify(doc.getInfo)();
	//call the info in the first sheet
	const sheet = info.worksheets[0];

	const row = {
		duration: duration,
		count: count,
		finalbank: bank,
		date: dateEnd,
		startbank: init_bank,
		mode: mode,
		individualsnapshot: indv_snap
	}
	await promisify(sheet.addRow)(row);
}
