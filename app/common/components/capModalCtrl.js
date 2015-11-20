;(function () {
    'use strict';

    angular.module('app.common')
        .controller('EditCorrectiveActionPlanController', ['$modalInstance', 'action', 'certifiedProductId', 'certificationResults', 'correctiveActionPlan', 'commonService', function ($modalInstance, action, certifiedProductId, certificationResults, correctiveActionPlan, commonService) {
            var vm = this;

            vm.activate = activate;
            vm.cancel = cancel;
            vm.deleteCap = deleteCap;
            vm.save = save;

            vm.activate();

            ////////////////////////////////////////////////////////////////////

            function activate () {
                vm.action = action;
                vm.certificationResults = certificationResults;
                if (vm.action === 'initiate') {
                    vm.cap = {
                        certifiedProductId: certifiedProductId
                    };
                    vm.cap.certifications = [];
                    for (var i = 0; i < vm.certificationResults.length; i++) {
                        if (vm.certificationResults[i].success) {
                            vm.cap.certifications.push({
                                id: i,
                                number: vm.certificationResults[i].number,
                                title: vm.certificationResults[i].title,
                                certificationCriterionNumber: vm.certificationResults[i].number,
                                certificationCriterionTitle: vm.certificationResults[i].title,
                                error: false
                            });
                        }
                    }
                }
                if (vm.action === 'edit') {
                    vm.cap = correctiveActionPlan;
                    for (var i = 0; i < vm.cap.certifications.length; i++) {
                        vm.cap.certifications[i].id = i;
                        vm.cap.certifications[i].number = vm.cap.certifications[i].certificationCriterionNumber;
                        vm.cap.certifications[i].title = vm.cap.certifications[i].certificationCriterionTitle;
                        vm.cap.certifications[i].error = true;
                    }
                    if (vm.cap.approvalDate) { vm.cap.approvalDate = new Date(vm.cap.approvalDate); }
                    if (vm.cap.effectiveDate) { vm.cap.effectiveDate = new Date(vm.cap.effectiveDate); }
                    if (vm.cap.estimatedCompletionDate) { vm.cap.estimatedCompletionDate = new Date(vm.cap.estimatedCompletionDate); }
                    if (vm.cap.actualCompletionDate) { vm.cap.actualCompletionDate = new Date(vm.cap.actualCompletionDate); }
                    if (vm.cap.noncomplianceDate) { vm.cap.noncomplianceDate = new Date(vm.cap.noncomplianceDate); }
                }
            }

            function cancel () {
                $modalInstance.dismiss('cancelled');
            }

            function deleteCap () {
                commonService.deleteCap(vm.cap.id)
                    .then(function (result) {
                        $modalInstance.close(result);
                    }), function (error) {
                        $modalInstance.dismss(error);
                    };
            }

            function save () {
                var tempCerts = angular.copy(vm.cap.certifications);
                vm.cap.certifications = [];
                for (var i = 0; i < tempCerts.length; i++) {
                    if (tempCerts[i].error) {
                        vm.cap.certifications.push(tempCerts[i]);
                    }
                }

                if (vm.action === 'initiate') {
                    commonService.initiateCap(vm.cap)
                        .then(function (result) {
                            $modalInstance.close(result);
                        }), function (error) {
                            $modalInstance.dismss(error);
                        };
                } else if (vm.action === 'edit') {
                    commonService.updateCap(vm.cap)
                        .then(function (result) {
                            $modalInstance.close(result);
                        }), function (error) {
                            $modalInstance.dismss(error);
                        };
                }
            }
        }]);
})();
