# TimeTracker

> A simple Node/Firebase Time Tracking web application

## Setup

### Clone Repository
```
git clone https://github.com/ryanblanks/TimeTracker.git
cd TimeTracker
```

### Install Dependencies
```
npm install
```

### Configure the App
You'll need to have or create a Firebase to use in the app.  To configure your Firebase for use in the app, create the TimeTrackerConfig.js file in the public\js directory.  The file should contain the following, with your firebase url:

```
'use strict';

angular.module('TimeTracker.config', [])
	.constant('FBUrl', 'https://<insertYourFirebase>.firebaseio.com');
```

### Run the App
```
gulp
```