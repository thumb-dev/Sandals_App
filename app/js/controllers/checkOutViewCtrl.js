four51.app.controller('CheckOutViewCtrl', ['$scope', '$routeParams', '$location', '$filter', '$rootScope', '$451', 'User', 'Order', 'OrderConfig', 'FavoriteOrder', 'AddressList', 'GoogleAnalytics',
function ($scope, $routeParams, $location, $filter, $rootScope, $451, User, Order, OrderConfig, FavoriteOrder, AddressList, GoogleAnalytics) {
	$scope.errorSection = 'open';

	$scope.isEditforApproval = $routeParams.id != null && $scope.user.Permissions.contains('EditApprovalOrder');
	if ($scope.isEditforApproval) {
		Order.get($routeParams.id, function(order) {
			$scope.currentOrder = order;
		});
	}

	if (!$scope.currentOrder) {
        $location.path('catalog');
    }

    var cartCC = false;

    for (var i = $scope.currentOrder.LineItems.length - 1; i >= 0; i--) {
         if($scope.currentOrder.LineItems[i].Product.StaticSpecGroups != null && $scope.currentOrder.LineItems[i].Product.StaticSpecGroups.isapparel != null){
            var staticSpe = $scope.currentOrder.LineItems[i].Product.StaticSpecGroups.isapparel.Specs.Item.Value;
            console.log(staticSpe);
         };


        if(staticSpe === "true"){
            cartCC = true;
            break;
        }else{
            cartCC = false;
     	    break;
        };
    };

   $scope.cartCC = cartCC;
   console.log($scope.cartCC + ' Apparel item? ');

   
   	if (!$scope.currentOrder) {
           $location.path('catalog');
       }

       var stationeryDetails = false;

       for (var i = $scope.currentOrder.LineItems.length - 1; i >= 0; i--) {
            if($scope.currentOrder.LineItems[i].Product.StaticSpecGroups != null && $scope.currentOrder.LineItems[i].Product.StaticSpecGroups.stationspecs != null){
               var staticSpecs = $scope.currentOrder.LineItems[i].Product.StaticSpecGroups.stationspecs.Specs.Item.Value;
               console.log(staticSpecs);
            };


           if(staticSpecs === "true"){
               stationeryDetails = true;
               break;
           }else{
               stationeryDetails = false;
        	    break;
           };
       };

      $scope.stationeryDetails = stationeryDetails;
      console.log($scope.stationeryDetails + ' Stationery Category? ');

	 		angular.element(document).ready(function() {
	 				 angular.element(".purchaseOrderBtn").trigger("click"); 
	 			 }); 
				 
	$scope.hasOrderConfig = OrderConfig.hasConfig($scope.currentOrder, $scope.user);
	$scope.checkOutSection = $scope.hasOrderConfig ? 'order' : 'shipping';

	$scope.sandalsOrderFields = {};
	angular.forEach($scope.currentOrder.OrderFields, function(field){
		$scope.sandalsOrderFields[field.Name] = field;
	});


    function submitOrder() {
	    $scope.displayLoadingIndicator = true;
	    $scope.errorMessage = null;
        Order.submit($scope.currentOrder,
	        function(data) {
				if ($scope.user.Company.GoogleAnalyticsCode) {
					GoogleAnalytics.ecommerce(data, $scope.user);
				}
				$scope.user.CurrentOrderID = null;
				User.save($scope.user, function(data) {
			        $scope.user = data;
	                $scope.displayLoadingIndicator = false;
		        });
		        $scope.currentOrder = null;
		        $location.path('/order/' + data.ID);
	        },
	        function(ex) {
		        $scope.errorMessage = ex.Message;
		        $scope.displayLoadingIndicator = false;
		        $scope.shippingUpdatingIndicator = false;
		        $scope.shippingFetchIndicator = false;
	        }
        );
    };

	$scope.$watch('currentOrder.CostCenter', function() {
		OrderConfig.address($scope.currentOrder, $scope.user);
	});

    function saveChanges(callback) {
	    $scope.displayLoadingIndicator = true;
	    $scope.errorMessage = null;
	    $scope.actionMessage = null;
	    var auto = $scope.currentOrder.autoID;
	    Order.save($scope.currentOrder,
	        function(data) {
		        $scope.currentOrder = data;
		        if (auto) {
			        $scope.currentOrder.autoID = true;
			        $scope.currentOrder.ExternalID = 'auto';
		        }
		        $scope.displayLoadingIndicator = false;
		        if (callback) callback($scope.currentOrder);
	            $scope.actionMessage = "Your changes have been saved";
	        },
	        function(ex) {
		        $scope.currentOrder.ExternalID = null;
		        $scope.errorMessage = ex.Message;
		        $scope.displayLoadingIndicator = false;
		        $scope.shippingUpdatingIndicator = false;
		        $scope.shippingFetchIndicator = false;
	        }
        );
    };

    $scope.continueShopping = function() {
	    if (confirm('Do you want to save changes to your order before continuing?') == true)
	        saveChanges(function() { $location.path('catalog') });
        else
		    $location.path('catalog');
    };

    $scope.cancelOrder = function() {
	    if (confirm('Are you sure you wish to cancel your order?') == true) {
		    $scope.displayLoadingIndicator = true;
	        Order.delete($scope.currentOrder,
		        function() {
		            $scope.user.CurrentOrderID = null;
		            $scope.currentOrder = null;
			        User.save($scope.user, function(data) {
				        $scope.user = data;
				        $scope.displayLoadingIndicator = false;
				        $location.path('catalog');
			        });
		        },
		        function(ex) {
			        $scope.actionMessage = ex.Message;
			        $scope.displayLoadingIndicator = false;
		        }
	        );
	    }
    };

    $scope.saveChanges = function() {
        saveChanges();
    };

    $scope.submitOrder = function() {
       submitOrder();
    };

    $scope.saveFavorite = function() {
        FavoriteOrder.save($scope.currentOrder);
    };

	$scope.cancelEdit = function() {
		$location.path('order');
	};
	
}]);