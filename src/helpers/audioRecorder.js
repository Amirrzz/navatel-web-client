// import lamejs from 'lamejs';
export default {
  /** Stores the recorded audio as Blob objects of audio data as the recording continues*/
  audioBlobs: [] /*of type Blob[]*/,
  /** Stores the reference of the MediaRecorder instance that handles the MediaStream when recording starts*/
  mediaRecorder: null /*of type MediaRecorder*/,
  /** Stores the reference to the stream currently capturing the audio*/
  streamBeingCaptured: null /*of type MediaStream*/,
  /** Start recording the audio
   * @returns {Promise} - returns a promise that resolves if audio recording successfully started
   */
  audioContext: null,
  mediaStreamSource: [],
  scriptProcessorNode: [],
  audioSamples: [],
  start: function () {
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
      //Feature Detection
      //Feature is not supported in browser
      //return a custom error
      return Promise.reject(
        new Error(
          'mediaDevices API or getUserMedia method is not supported in this browser.',
        ),
      );
    } else {
      //Feature is supported in browser

      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      //create an audio stream
      return (
        navigator.mediaDevices
          .getUserMedia({ audio: true } /*of type MediaStreamConstraints*/)
          //returns a promise that resolves to the audio stream
          .then((stream) /*of type MediaStream*/ => {
            //save the reference of the stream to be able to stop it when necessary
            this.mediaStreamSource =
              this.audioContext.createMediaStreamSource(stream);
            // Create ScriptProcessorNode to process audio samples
            this.scriptProcessorNode = this.audioContext.createScriptProcessor(
              4096,
              1,
              1,
            );
            this.scriptProcessorNode.onaudioprocess = (event) => {
              const inputData = event.inputBuffer.getChannelData(0); // Get audio samples
              this.audioSamples.push(new Float32Array(inputData)); // Store audio samples
            };

            // Connect nodes
            this.mediaStreamSource.connect(this.scriptProcessorNode);
            this.scriptProcessorNode.connect(this.audioContext.destination);
            this.streamBeingCaptured = stream;

            //create a media recorder instance by passing that stream into the MediaRecorder constructor
            this.mediaRecorder = new MediaRecorder(
              stream,
            ); /*the MediaRecorder interface of the MediaStream Recording
                    API provides functionality to easily record media*/
            //clear previously saved audio Blobs, if any
            this.audioBlobs = [];

            //add a dataavailable event listener in order to store the audio data Blobs when recording
            this.mediaRecorder.addEventListener('dataavailable', (event) => {
              //store audio Blob object
              if (event.data) {
                this.audioBlobs.push(event.data);
              }
            });

            //start the recording by calling the start method on the media recorder
            this.mediaRecorder.start();
            Promise.resolve(true);
          })
      );

      /* errors are not handled in the API because if its handled and the promise is chained, the .then after the catch will be executed*/
    }
  },
  /** Stop the started audio recording
   * @returns {Promise} - returns a promise that resolves to the audio as a blob file
   */
  stop: function () {
    //return a promise that would return the blob or URL of the recording
    return new Promise((resolve) => {
      //save audio type to pass to set the Blob type
      try {
        //listen to the stop event in order to create & return a single Blob object
        this.mediaRecorder.addEventListener('stop', async () => {
          if (this.mediaStreamSource) {
            this.mediaStreamSource.disconnect();
          }
          if (this.scriptProcessorNode) {
            this.scriptProcessorNode.disconnect();
          }
          if (this.audioContext) {
            this.audioContext.close();
          }
          let mimeType = 'audio/mp3;';
          //create a single blob object, as we might have gathered a few Blob objects that needs to be joined as one
          let audioBlob = new Blob(this.audioBlobs, { type: mimeType });
          audioBlob['name'] = 'recorded_audio.mp3';
          const file = new File([audioBlob], audioBlob.name, {
            type: mimeType,
          });
          resolve(file);
          //resolve promise with the single audio blob representing the recorded audio
        });
        this.cancel();
      } catch (error) {
        console.log('Error in', error);
      }
    });
  },
  /** Cancel audio recording*/
  cancel: function () {
    //stop the recording feature
    this.mediaRecorder.stop();

    //stop all the tracks on the active stream in order to stop the stream
    this.stopStream();

    //reset API properties for next recording
    this.resetRecordingProperties();
  },
  /** Stop all the tracks on the active stream in order to stop the stream and remove
   * the red flashing dot showing in the tab
   */
  stopStream: function () {
    //stopping the capturing request by stopping all the tracks on the active stream
    this.streamBeingCaptured
      .getTracks() //get all tracks from the stream
      .forEach((track) /*of type MediaStreamTrack*/ => track.stop()); //stop each one
  },
  /** Reset all the recording properties including the media recorder and stream being captured*/
  resetRecordingProperties: function () {
    this.mediaRecorder = null;
    this.streamBeingCaptured = null;

    /*No need to remove event listeners attached to mediaRecorder as
        If a DOM element which is removed is reference-free (no references pointing to it), the element itself is picked
        up by the garbage collector as well as any event handlers/listeners associated with it.
        getEventListeners(this.mediaRecorder) will return an empty array of events.*/
  },
  convertingWavToMp3: async function (blobFile) {
    // Initialize FFmpeg
    return new Promise(async (resolve, reject) => {
      try {
        console.log(blobFile, 'hihih');
        const arrayBuffer = await blobFile.arrayBuffer();
        console.log(arrayBuffer, arrayBuffer.byteLength);
        const dataView = new DataView(arrayBuffer);

        // Set up LAME encoder
        const mp3Encoder = new lamejs.Mp3Encoder(1, 44100, 128); // Assuming mono channel, 44100 sample rate, and 128 kbps bitrate
        console.log(mp3Encoder, 'mp3Encoder');
        // Encode WAV audio samples to MP3
        const samples = new Int16Array(
          arrayBuffer,
          0,
          arrayBuffer.byteLength / 2,
        );
        console.log(samples, 'samp;es');
        const mp3Data = [];
        const sampleBlockSize = 1152; // Adjust based on your needs
        for (let i = 0; i < samples.length; i += sampleBlockSize) {
          const sampleChunk = samples.subarray(i, i + sampleBlockSize);
          const mp3buf = mp3Encoder.encodeBuffer(sampleChunk);
          if (mp3buf.length > 0) {
            mp3Data.push(new Int8Array(mp3buf));
          }
        }
        const finalChunk = mp3Encoder.flush();
        if (finalChunk.length > 0) {
          mp3Data.push(new Int8Array(finalChunk));
        }

        // Create a Blob from MP3 data
        const mp3Blob = new Blob(mp3Data, { type: 'audio/mpeg' });
        console.log(mp3Blob, 'mb3blob');
        resolve(mp3Blob);
      } catch (error) {
        reject(error);
      }
    });
  },
};
