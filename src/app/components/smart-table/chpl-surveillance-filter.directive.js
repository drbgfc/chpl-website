(function () {
    'use strict';
    angular.module('chpl.components')
        .controller('SurveillanceFullFilterController', SurveillanceFullFilterController)
        .directive('chplSurveillanceFilter', chplSurveillanceFilter);

    /** @ngInclude */
    function chplSurveillanceFilter () {
        return {
            bindToController: {
                hasChanges: '=?',
                initialState: '=?',
                nameSpace: '@?',
            },
            controller: 'SurveillanceFullFilterController',
            controllerAs: 'vm',
            link: chplSurveillanceFilterLink,
            restrict: 'E',
            require: ['^stTable', 'chplSurveillanceFilter'],
            scope: {
                registerAllowAll: '&',
                registerClearFilter: '&',
                registerRestoreState: '&',
            },
            templateUrl: 'chpl.components/smart-table/chpl-surveillance-filter.html',
        }
    }

    function chplSurveillanceFilterLink (scope, element, attr, ctrls) {

        activate();

        ////////////////////////////////////////////////////////

        function activate () {
            var table = ctrls[0];
            var ctrl = ctrls[1];
            var allowAll = scope.registerAllowAll({
                allowAll: function () {
                    ctrl.allowAll();
                },
            });
            scope.$on('$destroy', allowAll);
            var clearFilter = scope.registerClearFilter({
                clearFilter: function () {
                    ctrl.clearFilter();
                },
            });
            scope.$on('$destroy', clearFilter);
            var restoreState = scope.registerRestoreState({
                restoreState: function (state) {
                    ctrl.restoreState(state);
                },
            });
            scope.$on('$destroy', restoreState);
            ctrl.tableCtrl = table;
            ctrl.activate();
        }
    }
    /** @ngInclude */
    function SurveillanceFullFilterController ($analytics, $localStorage, SPLIT_PRIMARY) {
        var vm = this;

        vm.activate = activate;
        vm.allowAll = allowAll;
        vm.clearFilter = clearFilter;
        vm.filterChanged = filterChanged;
        vm.restoreState = restoreState;
        vm.storeState = storeState;

        ////////////////////////////////////////////////////////////////////

        function activate () {
            reset();
        }

        function allowAll () {
            vm.query = {
                separator: SPLIT_PRIMARY,
                NC: {},
                surveillance: {},
                dates: {},
            }
            vm.filterChanged();
        }

        function clearFilter () {
            reset();
            vm.filterChanged();
        }

        function filterChanged () {
            vm.hasChanges = false;
            var tableState = vm.tableCtrl.tableState();
            var events = [];
            if (tableState.search.predicateObject.surveillance) {
                delete tableState.search.predicateObject.surveillance;
            }
            if (vm.initialState) {
                if (vm.query.surveillance.status !== vm.initialState.surveillance.status) {
                    if (vm.query.surveillance.status === 'never') { events.push('Never Surveilled') }
                    else if (vm.query.surveillance.status === 'has-had') { events.push('Has had Surveillance') }
                    else { events.push('Cleared Surveillance') }
                }
                if (vm.query.NC.never !== vm.initialState.NC.never) {
                    if (vm.query.NC.never) { events.push('Never had a Nonconformity') }
                    else { events.push('Cleared Never had a Nonconformity') }
                }
                if (vm.query.NC.open !== vm.initialState.NC.open) {
                    if (vm.query.NC.open) { events.push('Open Nonconformity') }
                    else { events.push('Cleared Open Nonconformity') }
                }
                if (vm.query.NC.closed !== vm.initialState.NC.closed) {
                    if (vm.query.NC.closed) { events.push('Closed Nonconformity') }
                    else { events.push('Cleared Closed Nonconformity') }
                }
                if (vm.query.matchAll !== vm.initialState.matchAll) {
                    if (vm.query.matchAll) { events.push('Matching All') }
                    else if (vm.query.matchAll === false) { events.push('Matching Any') }
                    else { events.push('Cleared Match All') }
                }
                vm.hasChanges = (events.length > 0);
            } else if (vm.query.surveillance.status || vm.query.NC.never || vm.query.NC.open || vm.query.NC.closed || vm.query.matchAll) {
                vm.hasChanges = true;
                if (vm.query.surveillance.status && vm.query.surveillance.status === 'never') { events.push('Never Surveilled'); }
                else {
                    if (vm.query.surveillance.status && vm.query.surveillance.status === 'has-had') { events.push('Has had Surveillance'); }
                    if (vm.query.NC.never) { events.push('Never had a Nonconformity'); }
                    if (vm.query.NC.open) { events.push('Open Nonconformity'); }
                    if (vm.query.NC.closed) { events.push('Closed Nonconformity'); }
                    if (vm.query.NC.matchAll) { events.push('Matching All'); }
                }
            }
            if (vm.hasChanges) {
                $analytics.eventTrack('Surveillance Filter', { category: 'Search', label: events.join(',') });
            }
            if (vm.initialState || vm.hasChanges) {
                vm.tableCtrl.search(vm.query, 'surveillance');
            } else {
                delete tableState.search.predicateObject.surveillance;
                vm.tableCtrl.search();
            }
            if (vm.nameSpace) {
                vm.storeState();
            }
        }

        function restoreState (state) {
            vm.query = state.search.predicateObject.surveillance;
            if (vm.query) {
                vm.filterChanged();
            }
        }

        function storeState () {
            $localStorage[vm.nameSpace] = angular.toJson(vm.tableCtrl.tableState());
        }

        ////////////////////////////////////////////////////////////////////

        function reset () {
            if (vm.initialState) {
                vm.query = angular.copy(vm.initialState);
            } else {
                vm.query = {
                    separator: SPLIT_PRIMARY,
                    NC: {},
                    surveillance: {},
                    dates: {},
                }
            }
        }
    }
})();
