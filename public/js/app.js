var tt = angular.module("TimeTracker", ["firebase", "ngMaterial", "TimeTracker.config"]);

tt.controller("ttController",
  function($scope, $firebase, $mdDialog, $interval, FBUrl) {
    var taskRef = new Firebase(FBUrl + "/Tasks");
    $scope.tasks = $firebase(taskRef).$asArray();
    var today = new Date();
    var yesterday = Date.create('yesterday');
    initTrackers(today);

    $scope.tasks.$loaded().then(function(list){
      for (i = 0; i < list.length; i++){
        if (list[i].tracker) {
          $scope.runningTask = list[i];
          break;
        }
      }
      if ($scope.runningTask){
        $scope.runningElapsedTime = $scope.elapsedTime($scope.runningTask.tracker);
        $scope.startTimer();
      }
     });

    $scope.$on('$destroy', function() {
      // Make sure that the interval is destroyed too
      $scope.stopTimer();
    });

    $scope.startTimer = function () {
      $scope.timer = $interval(function () {
        $scope.runningElapsedTime = $scope.elapsedTime($scope.runningTask.tracker);
      }, 60000);
    };

    $scope.stopTimer = function () {
      if (angular.isDefined($scope.timer)) {
        $interval.cancel($scope.timer);
        $scope.timer = undefined;
      }
    };

    $scope.initTimeEdits = function () {
      this.inEditStart = false;
      this.inEditEnd = false;
    };

    $scope.initTaskEdits = function () {
      this.inEdit = false;
      this.inEditStart = false;
    };
    
    $scope.saveEdit = function (){
      this.inEdit = false;
      $scope.tasks.$save(this.task);
    };

    $scope.saveEditStart = function (runningTracker){
      var newStart = Date.create(moment(today).format('MM/DD/YYYY') + ' ' + this.editStart);
      if ( Object.prototype.toString.call(newStart) === "[object Date]" ) {
        if ( !isNaN( newStart.getTime() ) ) {
          if (this.tracker) {
            this.tracker.start = newStart.getTime();
          }
          else {
            this.task.tracker.start = newStart.getTime();
          }
          if (runningTracker) {
            $scope.tasks.$save(this.task);
            $scope.runningElapsedTime = $scope.elapsedTime(this.task.tracker);
          }
          else{
            $scope.trackers.$save(this.tracker);
          }
        }
      }
      this.inEditStart = false;
    };

    $scope.saveEditEnd = function (){
      var newEnd = Date.create(moment(today).format('MM/DD/YYYY') + ' ' + this.editEnd);
      if ( Object.prototype.toString.call(newEnd) === "[object Date]" ) {
        if ( !isNaN( newEnd.getTime() ) ) {
          this.tracker.end = newEnd.getTime();
          $scope.trackers.$save(this.tracker);
        }
      }
      this.inEditEnd = false;
    };
    
    $scope.startEdit = function () {
      this.inEdit = true;
    };

    $scope.startEditStart = function () {
      this.inEditStart = true;
      if (this.tracker){
        var start = new Date(this.tracker.start);
      }
      else {
        var start = new Date(this.task.tracker.start);
      }
      this.editStart = moment(start).format('h:mmA');
    };

    $scope.startEditEnd = function () {
      this.inEditEnd = true;
      var end = new Date(this.tracker.end);
      this.editEnd = moment(end).format('h:mmA');
    };
        
    $scope.startTracker = function (task) {
      if ($scope.runningTask)
        $scope.stopTracker($scope.runningTask);
      $scope.runningTask = task;
      task.tracker = {
        start: new Date().getTime(),
        task: task.task
      };
      task.running = true;
      $scope.tasks.$save(task);
      $scope.runningElapsedTime = '0hrs 0mins';
      $scope.startTimer();
    };

    $scope.stopTracker = function (task) {
      $scope.runningTask = null;
      var targetDate = new Date(task.tracker.start);
      var targetDateString = moment(targetDate).format('MMDDYYYY');
      var targetTrackers = $firebase(new Firebase(FBUrl + "/Trackers/"+targetDateString)).$asArray();
      var tracker = task.tracker;
      tracker.end = new Date().getTime();
      targetTrackers.$add(tracker);
      task.running = false;
      task.tracker = null;
      $scope.tasks.$save(task);
      $scope.stopTimer();
    };
    
    $scope.elapsedTime = function (tracker) {
      if (tracker.end){
        var elapsed = tracker.end - tracker.start;
      }
      else {
        var elapsed = new Date().getTime() - tracker.start;
      }
      var dur = moment.duration(elapsed);
      return dur.hours() + 'hrs ' + dur.minutes() + 'mins' ;
    };
    
    $scope.addTask = function () {
      if($scope.addedTask){
        $scope.tasks.$add({task: $scope.addedTask, running: false});
        $scope.addedTask = "";
      }
    };

    $scope.totalDayDuration = function () {
      var totalDuration = moment.duration(1);
      if ($scope.trackers.length > 0){
        for(i = 0; i < $scope.trackers.length; i++){
          var tracker = $scope.trackers[i];
          if(tracker.end){
            var elapsed = tracker.end - tracker.start;
            totalDuration.add(moment.duration(elapsed));
          }
        }
        return totalDuration.hours() + 'hrs and ' + totalDuration.minutes() + 'mins';
      }
      else {
        return '';
      }
    };

    $scope.showConfirmTask = function(ev, task) {
      var confirm = $mdDialog.confirm()
        .title('Delete Task?')
        .content('Are you sure you want to delete the task ' + task.task)
        .ariaLabel('Delete Task')
        .ok('Yes')
        .cancel('No')
        .targetEvent(ev);
      $mdDialog.show(confirm).then(function() {
        $scope.tasks.$remove(task);
      }, function() {
        //don't delete
      });
    };

    $scope.showConfirmTracker = function(ev, tracker) {
      var confirm = $mdDialog.confirm()
        .title('Delete Tracked Time?')
        .content('Are you sure you want to delete the time tracked for task ' + tracker.task)
        .ariaLabel('Delete Tracked Time')
        .ok('Yes')
        .cancel('No')
        .targetEvent(ev);
      $mdDialog.show(confirm).then(function() {
        $scope.trackers.$remove(tracker);
      }, function() {
        //don't delete
      });
    };    

    function initTrackers (date) {
      $scope.trackedDate = date;
      var dateString = moment(date).format('MMDDYYYY');
      var trackerRef = new Firebase(FBUrl + "/Trackers/"+dateString);
      $scope.trackers = $firebase(trackerRef).$asArray();
    }
  }
);

tt.directive('showFocus', function($timeout) {
  return function(scope, element, attrs) {
    scope.$watch(attrs.showFocus, 
      function (newValue) { 
        $timeout(function() {
            newValue && element[0].focus();
        });
      },true);
  };    
});