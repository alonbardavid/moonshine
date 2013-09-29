var moonbridge = angular.module("api.moonbridge",["ngResource",'restangular']);
moonbridge.config(["RestangularProvider",function(RestangularProvider){
    RestangularProvider.setRestangularFields({
        id: "_id"
    });
    RestangularProvider.setBaseUrl("/api/v1/");
}]);
moonbridge.factory('moonbridge', ['Restangular', function (Restangular) {
    return Restangular;
} ]);
