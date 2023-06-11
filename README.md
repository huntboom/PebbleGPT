# PebbleGPT - OpenAI-Powered Voice Assistant for Pebble Time

This project provides an OpenAI GPT-3 powered voice assistant for the Pebble Time watch. The assistant listens for your voice input, sends the transcriptions to OpenAI's GPT-3, and displays the AI's response on the watch.
## Rebble Store
This app can be installed directly from the [Rebble Store](https://apps.rebble.io/en_US/application/64853961143b6504611fbc06).
## Code Overview

The project is split into two main files:

1. **main.c**: This is the main file for the Pebble watchapp, which is responsible for handling the user interface and dictation sessions. It uses Pebble's SDK to create a window, initiate dictation, and handle scrolling and button presses. It communicates with the companion JavaScript application running on the smartphone to send transcriptions and receive responses from the OpenAI API.

2. **pebble-js-app.js**: This is the JavaScript file that runs on the smartphone. It handles the communication with the OpenAI API, sending the transcriptions received from the watch and sending back the AI's responses. It also stores the API key securely.

The app communicates with the OpenAI GPT-3 model using a POST request, and the response is then passed back to the watchapp to be displayed on the Pebble Time's screen.

## Getting Started

To use this project, you need to have a Rebble Subscription for the voice transcriptions to work and an OpenAI API key. If you don't have one, you can obtain it by visiting [OpenAI's API key page](https://platform.openai.com/account/api-keys).

### Installation

For those who do not wish to compile the code into a build folder on their own, a precompiled `.pbw` file is available in the [Releases section](https://github.com/huntboom/PebbleGPT/releases) of the GitHub repository. Simply download the `.pbw` file and install it onto your Pebble Time watch.

If you want to build and install the project manually:

1. Clone the [PebbleGPT repository](https://github.com/huntboom/PebbleGPT).
2. Import the project to the Pebble SDK.
3. Build the project and install it on your Pebble Time.

For a detailed step-by-step guide on how to do this, please refer to the Pebble development [documentation](https://developer.rebble.io/developer.pebble.com/tutorials/watchface-tutorial/part1/index.html).

### Usage

To use the voice assistant:

1. Open the PebbleGPT app on your Pebble Time.
2. Press the "Select" button to start dictation.
3. Speak your query or command.
4. Wait for the AI's response to be displayed.
