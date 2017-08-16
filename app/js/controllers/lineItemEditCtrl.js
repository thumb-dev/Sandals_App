four51.app.controller('LineItemEditCtrl', ['$scope', '$routeParams', '$location', 'Product', 'ProductDisplayService', 'Order', 'GraphicServiceCost', 'Variant',
    function ($scope, $routeParams, $location, Product, ProductDisplayService, Order, GraphicServiceCost, Variant) {

        $scope.isEditforApproval = $routeParams.orderID && $scope.user.Permissions.contains('EditApprovalOrder');
        $scope.EditingLineItem = (typeof ($routeParams.lineItemIndex) != 'undefined');
        if ($scope.EditingLineItem) $scope.LineItemIndex = $routeParams.lineItemIndex;
        if ($scope.isEditforApproval) {
            Order.get($routeParams.orderID, function (order) {
                $scope.currentOrder = order;
                init();
            });
        }
        else { init() }

        /* Begin Prograde code */
        function numberPadding(num, size) { return ('000000000' + num).substr(-size); }

        $scope.measurementSystemChanged = function () {
            if ($scope.measurementSystem) {
                if (!$scope.LineItem.Specs.Width.Value) {
                    $scope.LineItem.Specs.Width.Value = 0;
                }
                if (!$scope.LineItem.Specs.Height.Value) {
                    $scope.LineItem.Specs.Height.Value = 0;
                }
                $scope.LineItem.Specs.WidthMetric.Value = ($scope.LineItem.Specs.Width.Value * 2.54).toFixed(2);
                $scope.LineItem.Specs.WidthMetric.Required = true;
                $scope.LineItem.Specs.HeightMetric.Value = ($scope.LineItem.Specs.Height.Value * 2.54).toFixed(2);
                $scope.LineItem.Specs.HeightMetric.Required = true;

                $scope.LineItem.Specs.Width.Value = null;
                $scope.LineItem.Specs.Width.Required = false;
                $scope.LineItem.Specs.Height.Value = null;
                $scope.LineItem.Specs.Height.Required = false;
            }
            else {
                if (!$scope.LineItem.Specs.WidthMetric.Value) {
                    $scope.LineItem.Specs.WidthMetric.Value = 0;
                }
                if (!$scope.LineItem.Specs.HeightMetric.Value) {
                    $scope.LineItem.Specs.HeightMetric.Value = 0;
                }
                $scope.LineItem.Specs.Width.Value = ($scope.LineItem.Specs.WidthMetric.Value / 2.54).toFixed(2);
                $scope.LineItem.Specs.Width.Required = true;
                $scope.LineItem.Specs.Height.Value = ($scope.LineItem.Specs.HeightMetric.Value / 2.54).toFixed(2);
                $scope.LineItem.Specs.Width.Required = true;

                $scope.LineItem.Specs.WidthMetric.Value = null;
                $scope.LineItem.Specs.WidthMetric.Required = false;
                $scope.LineItem.Specs.HeightMetric.Value = null;
                $scope.LineItem.Specs.HeightMetric.Required = false;
            }
        };
        /* End Prograde code */

        function init() {
            $scope.LineItem = {};
            $scope.LineItem = $scope.currentOrder.LineItems[$routeParams.lineItemIndex];
            Product.get($scope.LineItem.Product.InteropID, function (product) {
                $scope.LineItem.Product = product;
                ProductDisplayService.setProductViewScope($scope);

                /* Begin Prograde code */
                if ($scope.has($scope, 'LineItem.Product.StaticSpecGroups.StaticCost.Specs.PerSquareFoot')) {
                    $scope.measurementSystem = $scope.LineItem.Specs.WidthMetric.Value > 0 && $scope.LineItem.Specs.HeightMetric.Value > 0;
                    $scope.LineItem.Specs.WidthMetric.Required = $scope.measurementSystem;
                    $scope.LineItem.Specs.HeightMetric.Required = $scope.measurementSystem;
                    $scope.LineItem.Specs.Width.Required = !$scope.measurementSystem;
                    $scope.LineItem.Specs.Height.Required = !$scope.measurementSystem;

                    $scope.$watch('LineItem.Specs', function (n, o) {

                        if ($scope.measurementSystem) {
                            $scope.LineItem.Variant.Specs.Selected_Dimensions.Value = $scope.LineItem.Specs.DisplaySelection.Value + " - W " + $scope.LineItem.Specs.WidthMetric.Value + 'cm - H ' + $scope.LineItem.Specs.HeightMetric.Value + 'cm' + ' - Upload Logo: ' + $scope.LineItem.Specs.Logo.Value;
                        }
                        else {
                            $scope.LineItem.Variant.Specs.Selected_Dimensions.Value = $scope.LineItem.Specs.DisplaySelection.Value + " - W " + $scope.LineItem.Specs.Width.Value + '" - H ' + $scope.LineItem.Specs.Height.Value + '"' + ' - Upload Logo: ' + $scope.LineItem.Specs.Logo.Value;                        
                        }

                        var newTotal = 0;
                        if ($scope.LineItem.Specs.Width.Value > 0 && $scope.LineItem.Specs.Height.Value > 0) {
                            newTotal = (($scope.LineItem.Specs.Width.Value / 12) * ($scope.LineItem.Specs.Height.Value / 12) * parseFloat($scope.LineItem.Product.StaticSpecGroups.StaticCost.Specs.PerSquareFoot.Value) + GraphicServiceCost).toFixed(2);
                        }
                        else if ($scope.LineItem.Specs.WidthMetric.Value > 0 && $scope.LineItem.Specs.HeightMetric.Value > 0) {
                            newTotal = (($scope.LineItem.Specs.WidthMetric.Value / 2.54 / 12) * ($scope.LineItem.Specs.HeightMetric.Value / 2.54 / 12) * parseFloat($scope.LineItem.Product.StaticSpecGroups.StaticCost.Specs.PerSquareFoot.Value) + GraphicServiceCost).toFixed(2);
                        }

                        var paddedTotal = newTotal.toString();

                        if (paddedTotal.split(".")[1] == undefined) {
                            paddedTotal += ".00";
                        }
                        else if (paddedTotal.split(".")[1].length == 1) {
                            paddedTotal += "0";
                        }

                        paddedTotal = numberPadding(paddedTotal, 7);

                        angular.forEach($scope.LineItem.Specs, function (spec) {
                            if (spec.Name == 'Hundredths') {
                                spec.Value = paddedTotal.substr(6, 1);
                            }
                            else if (spec.Name == 'Tenths') {
                                spec.Value = paddedTotal.substr(5, 1);
                            }
                            else if (spec.Name == 'Ones') {
                                spec.Value = paddedTotal.substr(3, 1);
                            }
                            else if (spec.Name == 'Tens') {
                                spec.Value = paddedTotal.substr(2, 1);
                            }
                            else if (spec.Name == 'Hundreds') {
                                spec.Value = paddedTotal.substr(1, 1);
                            }
                            else if (spec.Name == 'Thousands') {
                                spec.Value = paddedTotal.substr(0, 1);
                            }
                            angular.forEach(spec.Options, function (option) {
                                option.Selected = false;
                                if (option.Value == spec.Value) {
                                    option.Selected = true;
                                    spec.SelectedOptionID = option.ID;
                                }
                            });

                        });
                        ProductDisplayService.calculateLineTotal($scope.LineItem);

                    }, true);
                }
                /* End Prograde code */
            });
        }

        $scope.addScrimToOrder = function () {
            Variant.save($scope.LineItem.Variant, function (data) {
                $scope.addToOrder();
            });
        };

        $scope.allowAddToOrder = true;
        $scope.addToOrderText = "Save Line Item";
        $scope.addToOrder = function () {
            if ($scope.lineItemErrors && $scope.lineItemErrors.length) {
                $scope.showAddToCartErrors = true;
                return;
            }
            Order.save($scope.currentOrder, function (o) {
                $scope.currentOrder = o;
                $location.path('/cart' + ($scope.isEditforApproval ? ('/' + o.ID) : ''));
            }, function (ex) {
                console.log(ex);
            });
        }
    }]);
