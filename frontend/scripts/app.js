let mediaRecorder;
let audioChunks = [];
let audioBlob;
const recordButton = document.getElementById('recordButton');
const stopButton = document.getElementById('stopButton');
const uploadButton = document.getElementById('uploadButton');
const audioUpload = document.getElementById('audioUpload');
const analysisResult = document.getElementById('analysisResult');

// Start Recording
recordButton.addEventListener('click', async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    stopButton.disabled = false;
    recordButton.disabled = true;

    mediaRecorder.ondataavailable = event => {
        audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
        audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        // Upload the audio file directly to the backend
        await uploadAudio(audioBlob);
        audioChunks = [];
        recordButton.disabled = false;
        stopButton.disabled = true;
    };

    mediaRecorder.start();
});

// Stop Recording
stopButton.addEventListener('click', () => {
    if (mediaRecorder) {
        mediaRecorder.stop();
    }
});

// Handle file upload
uploadButton.addEventListener('click', async () => {
    const file = audioUpload.files[0];
    if (file) {
        if (file.type.startsWith('audio/')) {
            // If it's an audio file, upload directly
            await uploadAudio(file);
        } else {
            alert('Please upload a valid audio file.');
        }
    }
});

// Function to upload audio file (WebM, WAV, or MP3)
async function uploadAudio(fileBlob) {
    const formData = new FormData();
    formData.append('audio', fileBlob, 'audio.webm'); // You can use webm or wav for the initial upload

    try {
        const response = await fetch('http://localhost:5000/api/analyze', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            const data = await response.json();
            analysisResult.innerText = `Analysis Result: ${data.result}`;
        } else {
            throw new Error('Failed to analyze audio.');
        }
    } catch (error) {
        console.error('Error analyzing audio:', error);
        alert('Something went wrong. Please try again.');
    }
}
