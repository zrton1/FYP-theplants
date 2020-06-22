//Zoe Tong
//This script runs the behind the scenes of the webpage
//It takes care of the instructions, noises, banks, timing
//It then sends all the relevant information to server.js when the user presses the Finished! button
//sets all classes called flex to be addressed at once
const flex1 = document.querySelectorAll('.FlexContainer1 button')
const flex2 = document.querySelectorAll('.FlexContainer2 button')
const flexEnd = document.querySelectorAll('.flexEnd')


//Initialising all variables
let startingTime;
let currentCount = 0; //Counts number of note presses
let lastCount = 0;
let bankNo = 0; //Tracks bank number
let initialBank;
let firstRound = true;
let last; //Last is set to be the last time the bank was changed (see soundBank())
let end; //End is set when the user confirms they're done
let duration; //Duration is the end time - start time
let states = 6;
let actions = 6;
let indvSnap= "start:";
let diff1 = 0;
let diff2 = 0;

//MAIN CODE THAT IS RUNNING:
last = instruction();
startingTime = last;

//Event listeners checking to see if note has been clicked or finish button has been pressed
flex1.forEach(flex1 => {
	flex1.addEventListener('click', () => playNote(flex1))
});
flex2.forEach(flex2 => {
	flex2.addEventListener('click', () => playNote(flex2))
});
flexEnd.forEach(flexEnd => {
	flexEnd.addEventListener('click', () => finishedPlay(flexEnd))
});

//All the functions
//Initial instruction popup when page loads
function instruction() {
	alert("Thanks for participating!\n Instructions: \nClick on the keys to hear some exciting sounds!\
\n\n Here are a few important things before you start:\
\n 1. Once you are done, please click Finished! This will ensure that your interaction is recorded. You may do this at any time.\
\n 2. There will be a questionnaire after you finish, please feel free to complete this.\n Please note, this web app and your participation is part of a research project for ECE4095. If you do not wish to participate, exit now.");
	//Alert halts code. Once the alert has been accepted, the start time will be called.
	start = time();
	return start;
}


//Reads the note and plays sound
async function playNote(flex) {
	await soundBank();
	const noteAudio = document.getElementById(flex.dataset.note);

	//setting current time to 0 means that the note can be re-played every time it's clicked
	currentCount += 1;
	noteAudio.currentTime = 0;
	noteAudio.play();
	flex.classList.add('active');
	noteAudio.addEventListener('ended', () => {
		flex.classList.remove('active');
	});
	return;
}


//Uses RL to get next bank
async function soundBank() {
	//Checks the differnce between the previous bank starting time and current. If > 10secs, changes to next bank
	let now = new Date(); //set now everytime soundBank is called
	if (firstRound == true) {
		bankNo = Math.floor(Math.random() * Math.floor(states));
		initialBank = bankNo;
		checkBank(bankNo);
		last = now;
		firstRound = false;
	}
	if (now-last > 10000){ //if longer than 10 secs
		bankNo = (bankNo%6) + 1;
		last = now;
		checkBank(bankNo);
		diff1 = currentCount - lastCount;
		lastCount = currentCount;
		indvSnapshot(diff1);
	}
	return;
}

function checkBank(bankNo) {
	switch (bankNo) {
		case 0:
			document.getElementById("note1").dataset.note = "01"
			document.getElementById("note2").dataset.note = "02"
			document.getElementById("note3").dataset.note = "03"
			document.getElementById("note4").dataset.note = "04"
			document.getElementById("note5").dataset.note = "05"
			document.getElementById("note6").dataset.note = "06"
			break;
		case 1:
			document.getElementById("note1").dataset.note = "11"
			document.getElementById("note2").dataset.note = "12"
			document.getElementById("note3").dataset.note = "13"
			document.getElementById("note4").dataset.note = "14"
			document.getElementById("note5").dataset.note = "15"
			document.getElementById("note6").dataset.note = "16"
			break;
		case 2:
			document.getElementById("note1").dataset.note = "21"
			document.getElementById("note2").dataset.note = "22"
			document.getElementById("note3").dataset.note = "23"
			document.getElementById("note4").dataset.note = "24"
			document.getElementById("note5").dataset.note = "25"
			document.getElementById("note6").dataset.note = "26"
			break;
		case 3:
			document.getElementById("note1").dataset.note = "31"
			document.getElementById("note2").dataset.note = "32"
			document.getElementById("note3").dataset.note = "33"
			document.getElementById("note4").dataset.note = "34"
			document.getElementById("note5").dataset.note = "35"
			document.getElementById("note6").dataset.note = "36"
			break;
		case 4:
			document.getElementById("note1").dataset.note = "41"
			document.getElementById("note2").dataset.note = "42"
			document.getElementById("note3").dataset.note = "43"
			document.getElementById("note4").dataset.note = "44"
			document.getElementById("note5").dataset.note = "45"
			document.getElementById("note6").dataset.note = "46"
			break;
		case 5:
			document.getElementById("note1").dataset.note = "51"
			document.getElementById("note2").dataset.note = "52"
			document.getElementById("note3").dataset.note = "53"
			document.getElementById("note4").dataset.note = "54"
			document.getElementById("note5").dataset.note = "55"
			document.getElementById("note6").dataset.note = "56"
			break;
		default:
			document.getElementById("note1").dataset.note = "01"
			document.getElementById("note2").dataset.note = "02"
			document.getElementById("note3").dataset.note = "03"
			document.getElementById("note4").dataset.note = "04"
			document.getElementById("note5").dataset.note = "05"
			document.getElementById("note6").dataset.note = "06"
	}

}

//reads time
function time() {
	let time = new Date();
	return time;
}

function indvSnapshot(diff){
	indvSnap = indvSnap + ", bankNo: " + (bankNo - 1) + ", #touch: " + diff;

}


//Sends SS info to server.js
async function accessSpreadsheet(duration, currentCount, end, bankNo, dateEnd, initialBank, indvSnap) {
	//Capture the information to be sent to SS
	const dur = duration;
	const count = currentCount;
	const bank = bankNo;
	const date_end = dateEnd;
	const init_bank = initialBank;
	const mode = 'CONSTANT';
	const indv_snap = indvSnap;

	//This doesn't work atm, see if can send end time/data later - 19/4
	const ending = end;

	const response = await fetch('/save', { //fetch receives a url (/save) and returns a promise
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		method: 'post',
		body: JSON.stringify({
			duration: dur,
			count: count,
			bank: bank,
			date: date_end,
			init_bank: init_bank,
			mode: mode,
			indv_snap : indv_snap
		})
	});
	//Wait for the server to finish sending us all the JSON data back
	const json = await response.json();
	return json;
}

async function finishedPlay(flexEnd) {
	if (confirm("Are you sure you're done?\
  \n If so, please make sure you wait until the next page loads to ensure your data is saved!\
  \n  You will be brought to an optional survey page, if you do not wish to participate in the survey, you may leave once the page loads\
  \n Thank you!")) {
		end = time();
		dateEnd = end.toDateString();
		duration = (end - startingTime) / 1000;
		diff2 = currentCount - lastCount; //calculate touchDelta
		indvSnapshot(diff2);
		//Call fn which sends data to server to be sent to SS
		let resp = await accessSpreadsheet(duration, currentCount, end, bankNo, dateEnd, initialBank, indvSnap);
		if (resp == 'error') {
			alert('FINISHED PLAY A There was an error with your submission, please try again')
		}else {
		//Links to URL of googleform
		document.location = ###;
		}
	}
}
