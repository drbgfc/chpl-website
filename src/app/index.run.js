/*
  eslint angular/no-private-call: [2,{"allow":["$$route"]}]
  eslint angular/no-run-logic: [0]
*/
(function () {
    'use strict';

    angular
        .module('chpl')
        .run(runBlock);

    /** @ngInject */
    function runBlock ($anchorScroll, $location, $log, $rootScope, $timeout, $window) {
        var routeChange = $rootScope.$on('$routeChangeSuccess', function (event, current) {
            if (current.$$route) {
                $rootScope.title = current.$$route.title;
                $rootScope.currentPage = $location.path();
            }
            if ($location.hash()) {
                $anchorScroll();
                $timeout(function () {
                    var element = $window.document.getElementById('mainContent');
                    var elementAng = angular.element($window.document.getElementById('mainContent'));
                    if (element && elementAng) {
                        elementAng.attr('tabindex', '-1');
                        element.focus();
                    }
                });
            }
        });
        $rootScope.$on('$destroy', routeChange);
    }
})();
