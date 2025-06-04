# BubbleLog Deployment Guide

This repo is a small static web app. You can preview it locally or host it online using Firebase Hosting.

## Local Preview

If you only want to view the site on your own machine, run a simple HTTP server from the repository directory:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/index.html` in your browser.

## Deploy to Firebase Hosting

1. Install the Firebase CLI if you don't have it:

   ```bash
   npm install -g firebase-tools
   ```

2. Log in to your Firebase account:

   ```bash
   firebase login
   ```

3. Initialize Firebase in this project (this creates `firebase.json`):

   ```bash
   firebase init hosting
   ```

   When prompted, choose the existing project "bubblelog-2933c" and use `index.html` as the public directory. You can answer **No** when asked about configuring as a single-page app.

4. Deploy the site:

   ```bash
   firebase deploy
   ```

After deployment, Firebase will give you a URL where your site is hosted.

