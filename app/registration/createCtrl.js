;(function () {
    'use strict';

    angular.module('app.registration')
        .controller('CreateController', ['$log', '$routeParams', '$location', 'commonService', function ($log, $routeParams, $location, commonService) {
            var self = this;
            self.userDetails = {user:{}};
            self.authorizeDetails = {};
            self.userDetails.hash = $routeParams.hash;
            self.authorizeDetails.hash = $routeParams.hash;
            self.message = {value: '', success: null};

            self.createUser = createUser;
            self.authorizeUser = authorizeUser;

            ////////////////////////////////////////////////////////////////////

            function createUser () {
                if (self.validateUser()) {
                    commonService.createInvitedUser(self.userDetails)
                        .then(function (response) {
                            self.message.value = 'Your account has been created. Please check your email to confirm your account';
                            self.message.success = true;
                        },function (error) {
                            self.message.value = error.data.error;
                            self.message.success = false;
                        });
                }
            }

            function authorizeUser () {
                if (self.authorizeDetails.userName &&
                    self.authorizeDetails.password &&
                    self.authorizeDetails.hash) {
                    commonService.authorizeUser(self.authorizeDetails)
                        .then(function (response) {
                            $location.path('/admin');
                        },function (error) {
                            self.message.value = error.data.error;
                            self.message.success = false;
                        });
                }
            }

            self.validateUser = function () {
                var valid = true;
                valid = valid && self.userDetails.hash && self.userDetails.hash.length > 0;
                valid = valid && self.userDetails.user.subjectName && self.userDetails.user.subjectName.length > 0;
                valid = valid && self.userDetails.user.password && self.userDetails.user.password.length > 0;
                valid = valid && self.userDetails.user.firstName && self.userDetails.user.firstName.length > 0;
                valid = valid && self.userDetails.user.lastName && self.userDetails.user.lastName.length > 0;
                valid = valid && self.userDetails.user.email && self.userDetails.user.email.length > 0;
                valid = valid && self.userDetails.user.phoneNumber && self.userDetails.user.phoneNumber.length > 0;
                valid = valid && self.userDetails.user.password === self.userDetails.user.passwordverify;
                return valid;
            };
        }]);
})();