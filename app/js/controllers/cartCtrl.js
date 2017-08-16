four51.app.controller('CartViewCtrl', ['$scope', '$routeParams', '$location', '$451', 'Order', 'OrderConfig', 'User',
function ($scope, $routeParams, $location, $451, Order, OrderConfig, User) {
	$scope.isEditforApproval = $routeParams.id != null && $scope.user.Permissions.contains('EditApprovalOrder');
	if ($scope.isEditforApproval) {
		Order.get($routeParams.id, function(order) {
			$scope.currentOrder = order;
			// add cost center if it doesn't exists for the approving user
			var exists = false;
			angular.forEach(order.LineItems, function(li) {
				angular.forEach($scope.user.CostCenters, function(cc) {
					if (exists) return;
					exists = cc == li.CostCenter;
				});
				if (!exists) {
					$scope.user.CostCenters.push({
						'Name': li.CostCenter
					});
				}
			});
		});
	}

	var cartCC = false;

    console.log($scope.currentOrder);
    console.log($scope.currentOrder.LineItems.length);
    //console.log($scope.currentOrder.LineItems[0].Product.StaticSpecGroups);

    for (var i = $scope.currentOrder.LineItems.length - 1; i >= 0; i--) {
         if($scope.currentOrder.LineItems[i].Product.StaticSpecGroups !== null && $scope.currentOrder.LineItems[i].Product.StaticSpecGroups.isapparel != null){
            var staticSpe = $scope.currentOrder.LineItems[i].Product.StaticSpecGroups.isapparel.Specs.Item.Value;
            console.log(staticSpe);
         }


        if(staticSpe === "true"){
            cartCC = true;
            break;
        }else{
            cartCC = false;
     	    break;
        }
    }
   $scope.cartCC = cartCC;
   console.log($scope.cartCC + ' Apparel item? ');

	$scope.currentDate = new Date();
	$scope.errorMessage = null;
	$scope.continueShopping = function() {
		if (!$scope.cart.$invalid) {
			if (confirm('Do you want to save changes to your order before continuing?') == true)
				$scope.saveChanges(function() { $location.path('catalog') });
		}
		else
			$location.path('catalog');
	};

	$scope.cancelOrder = function() {
		if (confirm('Are you sure you wish to cancel your order?') == true) {
			$scope.displayLoadingIndicator = true;
			$scope.actionMessage = null;
			Order.delete($scope.currentOrder,
				function(){
					$scope.currentOrder = null;
					$scope.user.CurrentOrderID = null;
					User.save($scope.user, function(){
						$location.path('catalog');
					});
					$scope.displayLoadingIndicator = false;
					$scope.actionMessage = 'Your Changes Have Been Saved';
				},
				function(ex) {
					$scope.actionMessage = 'An error occurred: ' + ex.Message;
					$scope.displayLoadingIndicator = false;
				}
			);
		}
	};

	$scope.saveChanges = function(callback) {
		$scope.actionMessage = null;
		$scope.errorMessage = null;
		if($scope.currentOrder.LineItems.length == $451.filter($scope.currentOrder.LineItems, {Property:'Selected', Value: true}).length) {
			$scope.cancelOrder();
		}
		else {
			$scope.displayLoadingIndicator = true;
			OrderConfig.address($scope.currentOrder, $scope.user);
			Order.save($scope.currentOrder,
				function(data) {
					$scope.currentOrder = data;
					$scope.displayLoadingIndicator = false;
					if (callback) callback();
					$scope.actionMessage = 'Your Changes Have Been Saved';
				},
				function(ex) {
					$scope.errorMessage = ex.Message;
					$scope.displayLoadingIndicator = false;
				}
			);
		}
	};

	$scope.removeItem = function(item) {
		if (confirm('Are you sure you wish to remove this item from your cart?') == true) {
			Order.deletelineitem($scope.currentOrder.ID, item.ID,
				function(order) {
					$scope.currentOrder = order;
					Order.clearshipping($scope.currentOrder);
					if (!order) {
						$scope.user.CurrentOrderID = null;
						User.save($scope.user, function(){
							$location.path('catalog');
						});
					}
					$scope.displayLoadingIndicator = false;
					$scope.actionMessage = 'Your Changes Have Been Saved';
				},
				function (ex) {
					$scope.errorMessage = ex.Message.replace(/\<<Approval Page>>/g, 'Approval Page');
					$scope.displayLoadingIndicator = false;
				}
			);
		}
	}


	$scope.checkOut = function() {
		if($scope.cartCC == true || staticSpe == undefined){
		$scope.displayLoadingIndicator = true;
		if (!$scope.isEditforApproval)
			OrderConfig.address($scope.currentOrder, $scope.user);

				Order.save($scope.currentOrder,
					function(data) {
						$scope.currentOrder = data;
		                $location.path($scope.isEditforApproval ? 'checkout/' + $routeParams.id : 'checkout');
						$scope.displayLoadingIndicator = false;
					},
					function(ex) {
						$scope.errorMessage = ex.Message;
						$scope.displayLoadingIndicator = false;
					}
				);

		}else{
				alert('Your cart contains both window displays and print or promo items. Start a new cart for window displays and proceed to checkout.');
				return;
			}
	};


	$scope.$watch('currentOrder.LineItems', function(newval) {
		var newTotal = 0;
		if (!$scope.currentOrder) return newTotal;
		angular.forEach($scope.currentOrder.LineItems, function(item){
			if (item.IsKitParent)
				$scope.cart.$setValidity('kitValidation', !item.KitIsInvalid);
			newTotal += item.LineTotal;
		});
		$scope.currentOrder.Subtotal = newTotal;
	}, true);

	$scope.copyAddressToAll = function() {
		angular.forEach($scope.currentOrder.LineItems, function(n) {
			n.DateNeeded = $scope.currentOrder.LineItems[0].DateNeeded;
		});
	};

	$scope.copyCostCenterToAll = function() {
		angular.forEach($scope.currentOrder.LineItems, function(n) {
			n.CostCenter = $scope.currentOrder.LineItems[0].CostCenter;
		});
	};

	$scope.onPrint = function()  {
		window.print();
	};

	$scope.cancelEdit = function() {
		$location.path('order');
	};

    $scope.downloadProof = function(item) {
        window.location = item.Variant.ProofUrl;
    };
}]);
