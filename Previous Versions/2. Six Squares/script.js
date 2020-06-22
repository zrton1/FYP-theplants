//This script links the 'flex''child class and links it to the audio
const flex = document.querySelectorAll('.flex')

flex.forEach(flex => {
	flex.addEventListener('click', ()=>playNote(flex))
})

function playNote(flex){
	const noteAudio = document.getElementById(flex.dataset.note)
//setting current time to 0 means that the note can be re-played every time it's clicked
	noteAudio.currentTime = 0
	noteAudio.play()
	flex.classList.add('active')
	noteAudio.addEventListener('ended' , ()=> {
		flex.classList.remove('active')
	})
}
