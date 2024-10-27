export default class audioRecorder extends HTMLElement {
    constructor() {
        super();
        this.mediaRecorder = null; 
        this.chunks = [];          
        this.isRecording = false;  
        this.audioBlob = null;
        this.render();
    }
    
    connectedCallback() {
        this.setupRecorder()
    }

    async setupRecorder() {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        this.mediaRecorder = new MediaRecorder(stream);

        this.mediaRecorder.ondataavailable = event => {
            this.chunks.push(event.data);
        };

        this.mediaRecorder.onstop = () => {
            this.audioBlob = new Blob(this.chunks, { type: 'audio/wav' });
            const audioURL = URL.createObjectURL(this.audioBlob);
            this.createAudioPlayer(audioURL);
            this.createHiddenInput();
            this.chunks = []; 
        };
    }

    createHiddenInput() {
        if (this.audioBlob) {
            
            const reader = new FileReader();
            reader.readAsDataURL(this.audioBlob);

            reader.onloadend = () => {
                
                const hiddenInput = document.createElement('input');
                hiddenInput.type = 'hidden';
                hiddenInput.name = 'audioData'; 
                hiddenInput.value = reader.result; 

                const form = document.querySelector('form');
                form.appendChild(hiddenInput);
            };
        }
    }  
        
    startRecording() {
        if (this.mediaRecorder) {
            this.mediaRecorder.start(); 
            this.isRecording = true;     
            console.log("Recording started");
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();  
            this.isRecording = false;     
            console.log("Recording stopped");
        }
    }

    createAudioPlayer(audioURL) {
        const existingAudio = this.querySelector('audio');
        if (existingAudio) {
            existingAudio.remove();
        }
        const audioElement = document.createElement('audio');
        audioElement.src = audioURL;
        audioElement.controls = true;  
        this.appendChild(audioElement);  
    }

    render() {
        this.innerHTML = `
            <button id="startBtn">Start Recording</button>
            <button id="stopBtn" disabled>Stop Recording</button>
        `;

        const startBtn = this.querySelector('#startBtn');
        const stopBtn = this.querySelector('#stopBtn');

        startBtn.addEventListener('click', () => {
            this.startRecording();
            startBtn.disabled = true; 
            stopBtn.disabled = false;  
        });

        stopBtn.addEventListener('click', () => {
            this.stopRecording();
            startBtn.disabled = false; 
            stopBtn.disabled = true;   
        });
    }
}

