# BubbleLog

BubbleLog is a small single‑page web application for tracking aquarium water quality. Users can register an account, log their measurements and view progress over time with charts. A built‑in advice function also provides basic AI suggestions about water conditions.

## Installation

1. Clone this repository.
2. Serve the files with a static web server (e.g. `python3 -m http.server`).
3. If you plan to deploy your own instance, replace the Firebase configuration in `app.js` with your project credentials.

## Usage

Run a local server from the project directory and open the site in your browser (usually `http://localhost:8000`). Create an account or sign in, then enter your pH, GH, KH and optional chlorine, nitrite and nitrate measurements. The app will calculate CO₂, display charts and store your history in Firebase.
