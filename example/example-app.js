/**
 * Created by Stefan on 13.12.2014.
 */

var app = angular.module('game-of-life-example', ['ng-game-of-life']);

app.controller("GameController", function($scope) {
   $scope.test = "adf";

   $scope.config = {
      autoStart: true,
      mode: 'stretch',
      dimensions: [20, 20],
      animation: false,
      borderSize: 2,
      color: "rgb(200,0,0)",
      speed: 50,
      acceptMouse: false,
      init: [],
      random: true,
      rules: function(cell, lifeAround) {
         if(cell.isAlive) {
            // under- or overpopulation
            if(lifeAround < 2 || lifeAround > 3) {
               return 0;
            }
            // population is ok
            if(lifeAround === 2 || lifeAround === 3) {
               return 1;
            }
         } else {
            // rebirth
            if(lifeAround === 3) {
               return 1;
            } else {
               // no changes
               return 0;
            }
         }
      }
   };

});

