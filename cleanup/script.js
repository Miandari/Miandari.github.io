// Replace with your EC2 WebSocket server public IP
const socket = new WebSocket("wss://clean-up-game.com/ws/");

socket.onopen = function() {
    console.log("Connected to WebSocket server.");
};

socket.onmessage = function(event) {
    const data = JSON.parse(event.data);

    if (data.type === "start" || data.type === "next_trial") {
        // Show the trial screen when a new trial starts
        jsPsych.addNodeToEndOfTimeline({
            type: 'html-keyboard-response',
            stimulus: `<p>Trial ${data.trial}. Press the spacebar to continue.</p>`,
            choices: ['space'],
            on_finish: function() {
                // Notify the server that the player completed the trial
                socket.send(JSON.stringify({type: 'trial_complete'}));
            }
        });

        // Start the trial
        jsPsych.resumeExperiment();
    } else if (data.type === "game_over") {
        jsPsych.addNodeToEndOfTimeline({
            type: 'html-keyboard-response',
            stimulus: '<p>Game Over! Thank you for playing.</p>',
            choices: jsPsych.NO_KEYS
        });

        // End the experiment
        jsPsych.resumeExperiment();
    }
};

// Initialize jsPsych with an empty timeline (we will dynamically add trials)
initJsPsych({
    timeline: [],
    on_finish: function() {
        console.log("Experiment finished.");
    }
});

// Pause the experiment initially until we get the start signal from the server
jsPsych.pauseExperiment();