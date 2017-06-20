(function () {
    'use strict';

    describe('chpl.admin.editCertifiedProduct.controller', function () {
        var vm, scope, $log, $q, commonService, utilService, mock, Mock;

        mock = {};
        mock.activeCP = {
            certificationStatus: [],
            certifyingBody: [],
            chplProductNumber: 'CHP-123123',
            classificationType: [],
            ics: { inherits: false },
            practiceType: [],
            product: { productId: 1 },
            targetedUsers: [],
        };
        mock.resources = {
            accessibilityStandards: [],
            bodies: [],
            classifications: [],
            practices: [],
            qmsStandards: [],
            statuses: [],
        }
        mock.relatedListings = [{id: 1}];

        beforeEach(function () {
            module('chpl.admin', 'chpl.mock', function ($provide) {
                $provide.decorator('commonService', function ($delegate) {
                    $delegate.getRelatedListings = jasmine.createSpy('getRelatedListings');
                    $delegate.updateCP = jasmine.createSpy('updateCP');
                    return $delegate;
                });
                $provide.decorator('utilService', function ($delegate) {
                    $delegate.extendSelect = jasmine.createSpy('extendSelect');
                    return $delegate;
                });
            });

            inject(function ($controller, _$log_, _$q_, $rootScope, _Mock_, _commonService_, _utilService_) {
                $log = _$log_;
                $q = _$q_;
                commonService = _commonService_;
                commonService.getRelatedListings.and.returnValue($q.when(mock.relatedListings));
                commonService.updateCP.and.returnValue($q.when(mock));
                Mock = _Mock_;
                utilService = _utilService_;
                utilService.extendSelect.and.returnValue([]);

                scope = $rootScope.$new();
                vm = $controller('EditCertifiedProductController', {
                    activeCP: mock.activeCP,
                    isAcbAdmin: true,
                    isAcbStaff: true,
                    isChplAdmin: true,
                    resources: mock.resources,
                    workType: 'manage',
                    $uibModalInstance: Mock.modalInstance,
                    $scope: scope,
                });
                scope.$digest();
            });
        });

        afterEach(function () {
            if ($log.debug.logs.length > 0) {
                //console.debug('\n Debug: ' + $log.debug.logs.join('\n Debug: '));
            }
        });

        describe('housekeeping', function () {
            it('should exist', function () {
                expect(vm).toBeDefined();
            });

            it('should have a way to close the modal', function () {
                expect(vm.cancel).toBeDefined();
                vm.cancel();
                expect(Mock.modalInstance.dismiss).toHaveBeenCalled();
            });
        });

        describe('saving an updated CP', function () {
            it('should set a "saving" flag on save', function () {
                vm.save();
                expect(vm.isSaving).toBe(true);
            });
        });

        it('should warn the user if the status will cause developer suspension', function () {
            expect(vm.willCauseSuspension('Active')).toBe(false);
            expect(vm.willCauseSuspension('Retired')).toBe(false);
            expect(vm.willCauseSuspension('Suspended by ONC')).toBe(false);
            expect(vm.willCauseSuspension('Suspended by ONC-ACB')).toBe(false);
            expect(vm.willCauseSuspension('Terminated by ONC')).toBe(true);
            expect(vm.willCauseSuspension('Withdrawn by Developer')).toBe(false);
            expect(vm.willCauseSuspension('Withdrawn by Developer Under Surveillance/Review')).toBe(true);
            expect(vm.willCauseSuspension('Withdrawn by ONC-ACB')).toBe(false);
        });

        describe('ics family', function () {
            it('should call the common service to get related listings', function () {
                expect(commonService.getRelatedListings).toHaveBeenCalled();
            });

            it('should load the related listings on load', function () {
                expect(vm.relatedListings).toEqual(mock.relatedListings);
            });

            it('should build an icsParents object if the Listing doesn\'t come with one', function () {
                expect(vm.cp.ics.parents).toEqual([]);
            });

            describe('disabling related options', function () {
                it('should disable itself', function () {
                    expect(vm.disabledParent({ chplProductNumber: 'CHP-123123'})).toBe(true);
                });

                it('should disable ones that are already parents', function () {
                    expect(vm.disabledParent({ chplProductNumber: '123'})).toBe(false);
                    vm.cp.ics.parents = [{ chplProductNumber: '123' }];
                    expect(vm.disabledParent({ chplProductNumber: '123'})).toBe(true);
                });
            });

            describe('ics code calculations', function () {
                it('should expect the code to be -1 if no parents', function () {
                    vm.cp.ics.parents = [];
                    expect(vm.requiredIcsCode()).toBe('-1');
                });

                it('should expect the code to be 1 if one parent and parent has ICS 0', function () {
                    vm.cp.ics.parents = [{chplProductNumber: '15.07.07.2713.CQ01.02.0.1.170331'}];
                    expect(vm.requiredIcsCode()).toBe('1');
                });

                it('should expect the code to be 1 if two parents and parents have ICS 0', function () {
                    vm.cp.ics.parents = [
                        {chplProductNumber: '15.07.07.2713.CQ01.02.0.1.170331'},
                        {chplProductNumber: '15.07.07.2713.CQ01.02.0.1.170331'},
                    ];
                    expect(vm.requiredIcsCode()).toBe('1');
                });

                it('should expect the code to be 2 if two parents and parents have ICS 1', function () {
                    vm.cp.ics.parents = [
                        {chplProductNumber: '15.07.07.2713.CQ01.02.1.1.170331'},
                        {chplProductNumber: '15.07.07.2713.CQ01.02.1.1.170331'},
                    ];
                    expect(vm.requiredIcsCode()).toBe('2');
                });

                it('should expect the code to be 3 if two parents and parents have ICS 1,2', function () {
                    vm.cp.ics.parents = [
                        {chplProductNumber: '15.07.07.2713.CQ01.02.1.1.170331'},
                        {chplProductNumber: '15.07.07.2713.CQ01.02.2.1.170331'},
                    ];
                    expect(vm.requiredIcsCode()).toBe('3');
                });
            });
        });
    })
})();
