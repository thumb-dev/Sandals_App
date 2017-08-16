four51.app.controller('ProductCtrl', ['$scope', '$routeParams', '$route', '$location', '$451', 'Product', 'ProductDisplayService', 'Order', 'Variant', 'User', 'GraphicServiceCost',
    function ($scope, $routeParams, $route, $location, $451, Product, ProductDisplayService, Order, Variant, User, GraphicServiceCost) {
        $scope.isEditforApproval = $routeParams.orderID && $scope.user.Permissions.contains('EditApprovalOrder');
        if ($scope.isEditforApproval) {
            Order.get($routeParams.orderID, function (order) {
                $scope.currentOrder = order;
            });
        }

 		/* Custom Logic Preventing a Mixed Cart */
        $scope.CartContainsCustomShipperProduct = false;
        $scope.productapp = false;
        $scope.cartapparel = false;
        $scope.ProductHasCustomShipper = false;
        
        if ($scope.currentOrder !== null) {
            angular.forEach($scope.currentOrder.LineItems, function(item) {
                if (item.Product.StaticSpecGroups && item.Product.StaticSpecGroups.isapparel !== undefined) {
                    if (item.Product.StaticSpecGroups.isapparel.Specs['Item'].Value === 'true') {
                        $scope.cartapparel = true;
                        $scope.CartContainsCustomShipperProduct = true;
                    }
                }
            });
        }
        $scope.$watch('LineItem.Product', function (newVal) {
            if (!newVal) return;
            if ($scope.LineItem.Product.StaticSpecGroups && $scope.LineItem.Product.StaticSpecGroups.isapparel !== undefined) {
                if ($scope.LineItem.Product.StaticSpecGroups.isapparel.Specs['Item'].Value === 'true') {
                    $scope.productapp = true;
                    $scope.ProductHasCustomShipper = true;
                }
            }
            $scope.allowProductToBeAdded = (($scope.cartapparel || !$scope.currentOrder) &&  $scope.productapp) ||
                (!$scope.cartapparel && !$scope.productapp);
        });

        //End Custom Logic


        $scope.selected = 1;
        $scope.LineItem = {};
        $scope.addToOrderText = "Add To Cart";
        $scope.loadingIndicator = true;
        $scope.loadingImage = true;
        $scope.searchTerm = null;
        $scope.settings = {
            currentPage: 1,
            pageSize: 10
        };

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

        $scope.calcVariantLineItems = function (i) {
            $scope.variantLineItemsOrderTotal = 0;
            angular.forEach($scope.variantLineItems, function (item) {
                $scope.variantLineItemsOrderTotal += item.LineTotal || 0;
            })
        };
        function setDefaultQty(lineitem) {
            if (lineitem.PriceSchedule && lineitem.PriceSchedule.DefaultQuantity != 0)
                $scope.LineItem.Quantity = lineitem.PriceSchedule.DefaultQuantity;
        }
        function init(searchTerm, callback) {
            ProductDisplayService.getProductAndVariant($routeParams.productInteropID, $routeParams.variantInteropID, function (data) {
                $scope.LineItem.Product = data.product;
                $scope.LineItem.Variant = data.variant;
                ProductDisplayService.setNewLineItemScope($scope);
                ProductDisplayService.setProductViewScope($scope);
                setDefaultQty($scope.LineItem);
                $scope.$broadcast('ProductGetComplete');
                $scope.loadingIndicator = false;
                $scope.setAddToOrderErrors();
                if (angular.isFunction(callback))
                    callback();

                /* Begin Prograde code */
                if ($scope.has($scope, 'LineItem.Product.StaticSpecGroups.StaticCost.Specs.PerSquareFoot')) {
                    $scope.measurementSystem = $scope.LineItem.Specs.WidthMetric.Value > 0 && $scope.LineItem.Specs.HeightMetric.Value > 0;
                    $scope.LineItem.Specs.WidthMetric.Required = $scope.measurementSystem;
                    $scope.LineItem.Specs.HeightMetric.Required = $scope.measurementSystem;
                    $scope.LineItem.Specs.Width.Required = !$scope.measurementSystem;
                    $scope.LineItem.Specs.Height.Required = !$scope.measurementSystem;
                    $scope.$watch('LineItem.Specs', function (n, o) {
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

            }, $scope.settings.currentPage, $scope.settings.pageSize, searchTerm);
        }
        $scope.$watch('settings.currentPage', function (n, o) {
            if (n != o || (n == 1 && o == 1))
                init($scope.searchTerm);
        });

        $scope.searchVariants = function (searchTerm) {
            $scope.searchTerm = searchTerm;
            $scope.settings.currentPage == 1 ?
                init(searchTerm) :
                $scope.settings.currentPage = 1;
        };

        $scope.deleteVariant = function (v, redirect) {
            if (!v.IsMpowerVariant) return;
            // doing this because at times the variant is a large amount of data and not necessary to send all that.
            var d = {
                "ProductInteropID": $scope.LineItem.Product.InteropID,
                "InteropID": v.InteropID
            };
            Variant.delete(d,
                function () {
                    redirect ? $location.path('/product/' + $scope.LineItem.Product.InteropID) : $route.reload();
                },
                function (ex) {
                    if ($scope.lineItemErrors.indexOf(ex.Message) == -1) $scope.lineItemErrors.unshift(ex.Message);
                    $scope.showAddToCartErrors = true;
                }
            );
        }

        /* Begin Prograde Code */
        $scope.addScrimToOrder = function () {
            //Manually check for empty fields since the product display service doesn't check for empty strings. This structure is a bit redundant, but easier to read.
            if ($scope.LineItem.Specs.Width.Required && (!$scope.LineItem.Specs.Width.Value || $scope.LineItem.Specs.Width.Value == "" || $scope.LineItem.Specs.Width.Value == 0)) {
                return;
            }
            if ($scope.LineItem.Specs.Height.Required && (!$scope.LineItem.Specs.Height.Value || $scope.LineItem.Specs.Height.Value == "" || $scope.LineItem.Specs.Height.Value == 0)) {
                return;
            }
            if ($scope.LineItem.Specs.WidthMetric.Required && (!$scope.LineItem.Specs.WidthMetric.Value || $scope.LineItem.Specs.WidthMetric.Value == "" || $scope.LineItem.Specs.WidthMetric.Value == 0)) {
                return;
            }
            if ($scope.LineItem.Specs.HeightMetric.Required && (!$scope.LineItem.Specs.HeightMetric.Value || $scope.LineItem.Specs.HeightMetric.Value == "" || $scope.LineItem.Specs.HeightMetric.Value == 0)) {
                return;
            }
            if ($scope.LineItem.Specs.DisplaySelection.Required && (!$scope.LineItem.Specs.DisplaySelection.Value || $scope.LineItem.Specs.DisplaySelection.Value == "" || $scope.LineItem.Specs.DisplaySelection.Value == 0)) {
                return;
            }
            if(!$scope.LineItem.Quantity || $scope.LineItem.Quantity == "0" || $scope.LineItem.Quantity == ""){
                return;
            }
            $scope.loadingIndicator = true;
            $scope.Variant = {};
            $scope.Variant.ProductInteropID = $scope.LineItem.Product.InteropID;
            $scope.Variant.Specs = {};
            $scope.Variant.Specs.Selected_Dimensions = {};
            if ($scope.measurementSystem) {
                $scope.Variant.Specs.Selected_Dimensions.Value = $scope.LineItem.Specs.DisplaySelection.Value + " - W " + $scope.LineItem.Specs.WidthMetric.Value + 'cm - H ' + $scope.LineItem.Specs.HeightMetric.Value + 'cm' + ' - Upload Logo: ' + $scope.LineItem.Specs.logo_check.Value;
            }
            else {
                $scope.Variant.Specs.Selected_Dimensions.Value = $scope.LineItem.Specs.DisplaySelection.Value + " - W " + $scope.LineItem.Specs.Width.Value + '" - H ' + $scope.LineItem.Specs.Height.Value + '"' + ' - Upload Logo: ' + $scope.LineItem.Specs.logo_check.Value;
            }

            
            Variant.save($scope.Variant, function (data) {
                ProductDisplayService.getProductAndVariant($routeParams.productInteropID, data.InteropID, function (data) {
                    $scope.LineItem.Product = data.product;
                    $scope.LineItem.Variant = data.variant;
                    ProductDisplayService.setNewLineItemScope($scope);
                    ProductDisplayService.setProductViewScope($scope);
                    setDefaultQty($scope.LineItem);
                    $scope.addToOrder();
                });
            });
        };

        /*End Prograde code */

        $scope.addToOrder = function () {
            if ($scope.currentOrder !== null) {
                if ($scope.productapp === false && $scope.cartapparel === true) {
                    alert("Window displays can not be combined with other items.");
                    $location.path('/cart');
                    return;
                }

                if ($scope.productapp === true && $scope.cartapparel === false) {
                    alert("Window displays can not be combined with other items.");
                    $location.path('/cart');
                    return;
                }
            }
            if ($scope.lineItemErrors && $scope.lineItemErrors.length) {
                $scope.showAddToCartErrors = true;
                return;
            }
            if (!$scope.currentOrder) {
                $scope.currentOrder = {};
                $scope.currentOrder.LineItems = [];
            }
            if (!$scope.currentOrder.LineItems)
                $scope.currentOrder.LineItems = [];
            if ($scope.allowAddFromVariantList) {
                angular.forEach($scope.variantLineItems, function (item) {
                    if (item.Quantity > 0) {
                        $scope.currentOrder.LineItems.push(item);
                        $scope.currentOrder.Type = item.PriceSchedule.OrderType;
                    }
                });
            } else {
                $scope.currentOrder.LineItems.push($scope.LineItem);
                $scope.currentOrder.Type = $scope.LineItem.PriceSchedule.OrderType;
            }
            $scope.addToOrderIndicator = true;
            //$scope.currentOrder.Type = (!$scope.LineItem.Product.IsVariantLevelInventory && $scope.variantLineItems) ? $scope.variantLineItems[$scope.LineItem.Product.Variants[0].InteropID].PriceSchedule.OrderType : $scope.LineItem.PriceSchedule.OrderType;
            // shipper rates are not recalcuated when a line item is added. clearing out the shipper to force new selection, like 1.0
            Order.clearshipping($scope.currentOrder).
                save($scope.currentOrder,
                function (o) {
                    $scope.user.CurrentOrderID = o.ID;
                    User.save($scope.user, function () {
                        $scope.addToOrderIndicator = true;
                        $location.path('/cart' + ($scope.isEditforApproval ? '/' + o.ID : ''));
                    });
                },
                function (ex) {
                    //remove the last LineItem added to the cart.
                    $scope.currentOrder.LineItems.pop();
                    $scope.addToOrderIndicator = false;
                    $scope.lineItemErrors.push(ex.Detail);
                    $scope.showAddToCartErrors = true;
                    //$route.reload();
                }
                );
        };

        $scope.setOrderType = function (type) {
            $scope.loadingIndicator = true;
            $scope.currentOrder = { 'Type': type };
            init(null, function () {
                $scope.loadingIndicator = false;
            });
        };

        $scope.$on('event:imageLoaded', function (event, result) {
            $scope.loadingImage = false;
            $scope.$apply();
        });
    }]);
