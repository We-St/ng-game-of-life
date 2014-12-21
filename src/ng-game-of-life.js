/**
 * Created by Stefan on 13.12.2014.
 */
if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports){
    module.exports = 'ng-game-of-life';
}

(function () {
    'use strict';
    /*global angular: false*/

    var module = angular.module('ng-game-of-life', []);

    module.factory('universe', function() {
        return new function() {

            var cellList = [];

            this.cells = [];
            this.width = 0;
            this.height = 0;
            this.generation = 0;

            /**
             *
             * @param dimensions
             */
            this.init = function(dimensions) {
                this.width = dimensions[0];
                this.height = dimensions[1];
                for(var i = 0; i < this.width; i++) {
                    this.cells.push(new Array(this.width));

                    for(var j = 0; j < this.height; j++) {
                        var cell = {
                            x: i,
                            y: j,
                            isAlive: 0,
                            next: 0
                        };

                        this.cells[i][j] = cell;
                        cellList.push(cell);
                    }
                }
            };

            /**
             *
             * @returns {Array}
             */
            this.getCells = function() {
                return cellList;
            };

            this.getLifeNeighboursCount = function(cell) {
                var count = 0;
                var x = cell.x;
                var y = cell.y;

                for(var col = (x - 1); col !== (x + 2); col++) {
                    for(var row = (y - 1); row !== (y + 2); row++) {
                        count += this.getCell(col, row).isAlive;
                    }
                }
                return count - cell.isAlive;
            };

            this.getCell = function(x, y){
                if( x < 0 ) {
                    x = this.width - 1;
                }
                if( x >= this.width ) {
                    x = 0;
                }
                if( y < 0 ) {
                    y = this.height - 1;
                }
                if( y >= this.height ) {
                    y = 0;
                }
                return this.cells[x][y];
            };

            this.getGeneration = function() {
                return this.generation;
            };

            this.incrementGeneration = function() {
                this.generation++;
            };
        };
    });


    module.directive('universe', ['$interval', gameOfLife]);

    function gameOfLife($interval) {
        return {
            restrict: 'E',
            template: '<canvas class="universe"></canvas>',
            replace: true,
            controller: function($scope, universe) {

                $scope.universe = universe;

                /**
                 * Randomizes the universe initial layout
                 */
                $scope.randomize = function() {
                    var cells = $scope.universe.getCells();
                    for(var i in cells) {
                        var random = Math.floor(Math.random() * 10);
                        if(random < 2) {
                            cells[i].isAlive = true;
                        }
                    }
                };

                /**
                 * Periodically invoke the rules on each cell to change
                 * its status.
                 */
                $scope.start = function() {

                    $interval(function() {
                        var cells = universe.getCells();
                        for(var i in cells) {
                            var cell = cells[i];
                            var lifeAround = universe.getLifeNeighboursCount(cell);
                            // invoke rules on config
                            cell.next = $scope.config.rules(cell, lifeAround);
                        }
                        // apply changes
                        for(var j in cells){
                            var c = cells[j];
                            c.isAlive = c.next;
                        }
                        // each timeout is a new generation
                        universe.incrementGeneration();
                    }, $scope.config.speed);

                };

            },
            link: function(scope, element, attr) {
                var canvas = element[0];
                var ctx = canvas.getContext('2d');

                var config = scope.config;
                scope.universe.init(config.dimensions);


                canvas.setAttribute('width', config.canvas[0]);
                canvas.setAttribute('height', config.canvas[1]);

                /**
                 * Check the universe for changes and redraw the canvas
                 */
                scope.$watch( 'universe.generation' , function() {
                    redraw(scope.universe);
                });

                if(config.random) {
                    scope.randomize();
                }
                if(config.autoStart) {
                    scope.start();
                }

                /**
                 * Redraws the whole canvas. Living cells are shown as squares.
                 */
                function redraw(universe) {
                    var border = config.borderSize;
                    var width = (canvas.width / config.dimensions[0]) - border;
                    var height = canvas.height / config.dimensions[1] - border;
                    var cells = universe.getCells();
                    ctx.clearRect ( 0 , 0 , canvas.width, canvas.height );
                    for(var i in cells) {
                        var cell = cells[i];

                        var x = cell.x * (width + border);
                        var y = cell.y * (height + border);

                        if(cell.isAlive) {
                            ctx.fillStyle = config.color;
                            ctx.fillRect( x, y, width, height);
                        } else {
                            ctx.clearRect( x, y, width, height);
                        }
                    }
                }

            }
        };
    }

}());