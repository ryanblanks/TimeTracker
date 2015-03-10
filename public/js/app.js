var tt = angular.module("TimeTracker", ["firebase", "ngMaterial", "TimeTracker.config"]);

tt.controller("ttController",
  function($scope, $firebase, $mdDialog, $interval, FBUrl) {
    var taskRef = new Firebase(FBUrl + "/Tasks");
    $scope.tasks = $firebase(taskRef).$asArray();
    var today = new Date();
    var todayString = moment(today).format('MMDDYYYY');
    var todayRef = new Firebase(FBUrl + "/Trackers/"+todayString);
    $scope.trackers = $firebase(todayRef).$asArray();
    var openRef = new Firebase(FBUrl + "/OpenTrackers/"+todayString);
    $scope.openTrackers = $firebase(openRef).$asArray();
    
    $scope.openTrackers.$loaded().then(function(list){
      if(list.length > 0){
        $scope.runningElapsedTime = $scope.elapsedTime(list[0]);
        $scope.startTimer();
      }
     });

    $scope.startTimer = function () {
      $scope.timer = $interval(function () {
        $scope.runningElapsedTime = $scope.elapsedTime($scope.openTrackers[0]);
      }, 60000);
    };

    $scope.stopTimer = function () {
      if (angular.isDefined($scope.timer)) {
        $interval.cancel($scope.timer);
        $scope.timer = undefined;
      }
    };

    $scope.$on('$destroy', function() {
      // Make sure that the interval is destroyed too
      $scope.stopTimer();
    });

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

    $scope.initTimeEdits = function () {
      this.inEditStart = false;
      this.inEditEnd = false;
    };
    
    $scope.saveEdit = function (){
      this.inEdit = false;
      $scope.tasks.$save(this.task);
    };

    $scope.saveEditStart = function (collection){
      var newStart = Date.create(moment(today).format('MM/DD/YYYY') + ' ' + this.editStart);
      if ( Object.prototype.toString.call(newStart) === "[object Date]" ) {
        if ( !isNaN( newStart.getTime() ) ) {
          this.tracker.start = newStart.getTime();
          collection.$save(this.tracker);
        }
      }
      if($scope.openTrackers.length > 0){
        $scope.runningElapsedTime = $scope.elapsedTime($scope.openTrackers[0]);
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
      var start = new Date(this.tracker.start);
      this.editStart = moment(start).format('h:mmA');
    };

    $scope.startEditEnd = function () {
      this.inEditEnd = true;
      var end = new Date(this.tracker.end);
      this.editEnd = moment(end).format('h:mmA');
    };
        
    $scope.startTracker = function (task) {
      var runningTask = 'undefined';
      if ($scope.openTrackers.length > 0){
        for(i = 0; i < $scope.tasks.length; i++){
          runningTask = $scope.tasks[i];
          if (task.running) break;
        }
        $scope.stopTracker(runningTask);
      }
      var now = new Date().getTime();
      $scope.openTrackers.$add({start: now, task: task.task, taskKey: task.$id});
      task.running = true;
      $scope.tasks.$save(task);
      $scope.runningElapsedTime = '0hrs 0mins';
      $scope.startTimer();
    };

    $scope.stopTracker = function (task) {
      var tracker = $scope.openTrackers[0];
      tracker.end = new Date().getTime();
      $scope.trackers.$add(tracker);
      var taskRef = new Firebase(FBUrl + "/Tasks/" + tracker.taskKey);
      var task = $firebase(taskRef).$asObject();
      task.task = tracker.task;;
      task.running = false;
      task.$save();
      $scope.openTrackers.$remove(tracker);
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

    // $scope.anyTrackersRunning = function () {
    //   //console.log($scope.trackers[0]);
    //   //for(i = 0; i < $scope.trackers.length; i++){
    //   //  if(!$scope.trackers[i].end) return true;
    //   //}
    //   //return false;
    //   return $scope.openTrackers.length > 0;
    // };
    
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