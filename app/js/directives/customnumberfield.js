four51.app.directive('customnumberfield', function() {
    var obj = {
        scope: {
            customfield : '=',
            changed: '=',
            hidesuffix: '@',
            hideprefix: '@'
        },
        restrict: 'E',
        transclude: true,
        templateUrl: 'partials/controls/customNumberField.html'
    }
    return obj;
});