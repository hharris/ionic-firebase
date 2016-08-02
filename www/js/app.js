// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic']).constant('ref', 'https://utapp-6b906.firebaseio.com/')

    .run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        if(window.cordova && window.cordova.plugins.Keyboard) {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

            // Don't remove this line unless you know what you are doing. It stops the viewport
            // from snapping when text inputs are focused. Ionic handles this internally for
            // a much nicer keyboard experience.
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if(window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
})

    .config(function($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('tabs', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
    })
        .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
    })

        .state('register', {
        url: '/register',
        templateUrl: 'templates/register.html',
        controller: 'RegisterCtrl'
    })

        .state('tabs.success', {
        url: '/success',
        views: {
            'list-tab' : {
                templateUrl: 'templates/success.html',
                controller: 'SuccessCtrl',
                authRequired: true
            }
        }
    })

        .state('tabs.user', {
        url: '/user',
        cache: false,
        views: {
            'user-tab' : {
                templateUrl: 'templates/user.html',
                controller: 'UserCtrl',
                authRequired: true
            }
        }
    })

    $urlRouterProvider.otherwise('/login');
})

    .controller('LoginCtrl', ['$scope', '$rootScope', '$http', '$state', function($scope, $rootScope, $http, $state, $rootScope) {

        $scope.user = {};
        $scope.login = function() {
            firebase.auth().signInWithEmailAndPassword($scope.user.email, $scope.user.password)
                .then(function(result) {
                
                firebase.auth().onAuthStateChanged(function(user) {
                  if (user) {
                    var user = firebase.auth().currentUser;
                    $state.go('tabs.user');
                  } else {
                    $state.go('login');
                  }
                });
            })
                .catch(function(error) {
                // Handle Errors here.
                $scope.errorCode = error.code;
                $scope.errorMessage = error.message;
                // ...
            });
        }
    }])

    .controller('RegisterCtrl', ['$scope', '$http', '$state', '$rootScope', function($scope, $http, $state, $rootScope) {

        $scope.user = {};
        $scope.register = function() {
            firebase.auth().createUserWithEmailAndPassword($scope.user.email, $scope.user.password)
                .then(function(regUser) {

                firebase.database().ref('users/').child(regUser.uid).set({
                    regUser: regUser.uid,
                    regDate: firebase.database.ServerValue.TIMESTAMP,
                    firstname: $scope.user.first_name,
                    lastname: $scope.user.last_name,
                    email: $scope.user.email
                })

                $state.go('login');  
            })
                .catch(function(error) {
                // Handle Errors here.
                $scope.errorCode = error.code;
                $scope.errorMessage = error.message;
                // ...
            });
        }
    }])

    .controller('SuccessCtrl', ['$scope', '$http', '$state', function($scope, $http, $state) {
    }])

    .controller('UserCtrl', ['$scope', '$rootScope', '$http', '$state', '$ionicHistory', function($scope, $rootScope, $http, $state, $ionicHistory) {        
                    var userId = firebase.auth().currentUser.uid;
                    console.log(userId);
        
                        $scope.firstname = {};
                          $scope.uid = {};
                          $scope.email = {};
        
                    firebase.database().ref('/users/' + userId).once('value')
                        .then(function(snapshot) {
                          $scope.firstname = snapshot.val().firstname;
                          $scope.uid = snapshot.val().regUser;
                          $scope.email = snapshot.val().email;
                        
                            console.log(snapshot.val().firstname);
                            console.log($scope.firstname);
                    });
        
                    firebase.database().ref('users/' + userId).on('value', function(snapshot) {
                        $scope.firstname = snapshot.val().firstname;
                      });


        $scope.logout = function() {
            firebase.auth().signOut().then(function() {
                $state.go('login');
                $ionicHistory.clearCache();
                $ionicHistory.clearHistory();
            }, function(error) {
                // An error happened.
            });
        }
    }]);
