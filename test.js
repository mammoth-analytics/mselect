/**
 * Created by mammoth2 on 12/11/14.
 */


angular.module('testApp', ['mSelect']).controller('testCtrl', [
    '$scope',
    function($scope){
        $scope.iterable_1 = [1, 2, 3, 4, 5];
        $scope.model_1 = null;


        $scope.iterable_2 = [
            {display: 'apple', value: 'A'},
            {display: 'banana', value: 'B'},
            {display: 'cherry', value: 'C'},
            {display: 'date', value: 'D'}
        ]
        $scope.model_2 = null;
        $scope.model_3 = 'C';
        $scope.model_5 = null;
        $scope.model_6 = null;
        $scope.model_7 = null;

        $scope.model_13 = {
            value: 'X'
        }
        $scope.model_15 = null;
        $scope.model_16 = ['A']


        $scope.callback_4 = function(value){
            alert(value.display + ' selected')
        }

        $scope.click_default = function(){
            alert('default clicked')
        }
    }
])