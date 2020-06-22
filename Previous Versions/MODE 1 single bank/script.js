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
let initialBank;
let end; //End is set when the user confirms they're done
let duration; //Duration is the end time - start time
let bankNo = NaN;

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
function playNote(flex) {
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

//reads time
function time() {
	let time = new Date();
	return time;
}

//Sends SS info to server.js
async function accessSpreadsheet(duration, currentCount, end, bankNo, dateEnd, initialBank) {
	//Capture the information to be sent to SS
	const dur = duration;
	const count = currentCount;
	const bank = NaN;
	const date_end = dateEnd;
	const init_bank = 2;
	const mode = 'SINGLE';

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
			mode: mode
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
		//Call fn which sends data to server to be sent to SS
		let resp = await accessSpreadsheet(duration, currentCount, end, bankNo, dateEnd, initialBank);
		if (resp == 'error') {
			alert('FINISHED PLAY A There was an error with your submission, please try again')
		}else {
		//Links to URL of googleform
		document.location = ###;
		}
	}
}
