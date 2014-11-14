var mSelect = angular.module('mSelect', []);

mSelect.controller('mSelectCtrl', [
    '$scope',
    function ($scope) {

    }
]);

mSelect.directive('mSelect',
    [   '$compile', '$controller', '$timeout', '$rootScope',
        function ($compile, $controller, $timeout, $rootScope) {
            return {
                restrict: 'E',
                link: function (parentScope, domEle, iAttrs) {


                    var item_template_dom_element = $(domEle).children('m-item')
                    var item_template_html;
                    if(item_template_dom_element.length == 0){
                        item_template_html = '<span ng-bind="$item"></span>'
                    }
                    else{
                        item_template_html =  item_template_dom_element.html();
                    }
                    var item_template = '<div>' + item_template_html + '</div>'

                    var selected_item_template = '<div ng-show="$selected">' + item_template_html.replace(/\$item/g, '$selected') + '</div>';

                    var seperator_template_dom_element = $(domEle).children('m-seperator')
                    var seperator_html = ''
                    if(seperator_template_dom_element.length != 0){
                        seperator_html = '<li>' + seperator_template_dom_element.html() + '</li>'
                    }

                    var null_template_dom_element = $(domEle).children('m-null')
                    var null_html = '';
                    var null_selected_html = '';
                    if(null_template_dom_element.length != 0){
                        null_html = '<li ng-click="set_null()">' + null_template_dom_element.html() + '</li>'
                        null_selected_html = '<div ng-show="!$selected">' + null_template_dom_element.html() + '</div>'
                    }


                    var scope = parentScope.$new()

                    var class_string = ''

                    if (iAttrs.mClass) {
                        class_string = iAttrs.mClass
                    }

                    scope.reverse = false;
                    if(iAttrs.mReverse != undefined){
                        scope.reverse = true;
                        class_string += " reverse"
                    }


                    scope.$selected = null;
                    scope.assign_to_model = function ($item) {
                        var value;
                        if (iAttrs.mValue) {
                            var attr = iAttrs.mValue.replace('$item.', '')
                            value = $item[attr]
                        }
                        else {
                            value = $item
                        }
                        parentScope.$eval(function (parentScope) {
                            parentScope[iAttrs.mModel] = value;
                        })
                        scope.$selected = $item;
                        if (iAttrs.mOnselectCallback) {
                            if (iAttrs.mOnselectCallback) {
                                parentScope.$eval(iAttrs.mOnselectCallback, {$item: $item})
                            }
                        }
                    }

                    scope.set_null = function(){
                        parentScope.$eval(function (parentScope) {
                            parentScope[iAttrs.mModel] = null;
                        })
                        scope.$selected = null;
                        if (iAttrs.mOnselectCallback) {
                            if (iAttrs.mOnselectCallback) {
                                parentScope.$eval(iAttrs.mOnselectCallback, {$item: null})
                            }
                        }
                    }

                    $controller('mSelectCtrl',
                        {$scope: scope}
                    )


                    function render() {

                        $(domEle).empty()

                        var template =
                            '<div class="mselect ' + class_string + '">' +
                            '<div class="ms_selected" ng-class="{highlight: !$selected}">' +
                            selected_item_template +
                            null_selected_html +
                            '</div>' +
                            '<input class="ms_hiddencb" type="checkbox">' +
                            '<label class="ms_button">' +
                            '<i class="fa" ng-class="{false: \'fa-chevron-down\', true: \'fa-chevron-up\'}[reverse]">' +
                            '</i></label>' +
                            '<div class="ms_selection">' +
                            '<ul>' +
                             null_html +
                             seperator_html +
                            '<li ng-repeat="$item in ' + iAttrs.mRepeat +'" ng-click="assign_to_model($item)">' +
                            item_template +
                            '</li>' +
                            '</ul>' +
                            '</div>' +
                            '</div>'
                        $(domEle).append($compile(template)(scope))

                        var checkbox = domEle.find('.ms_hiddencb').first();
                        checkbox.prop('checked', false);
                        domEle.click(function () {
                            checkbox.prop('checked', !checkbox.prop('checked'));
                        })
                    }
                    var find_model_value_and_set = function(){
                        var model_current_val = parentScope.$eval(iAttrs.mModel);
                        var iterable = parentScope.$eval(iAttrs.mRepeat)
                        for(var i = 0; i < iterable.length; i++){
                            var item = iterable[i];
                            var value;
                            if(iAttrs.mValue){
                                var attr = iAttrs.mValue.replace('$item.', '');
                                value = item[attr];
                            }
                            else{
                                value = item;
                            }
                            if (model_current_val == value) {
                                scope.$selected = item;
                                break;
                            }
                        }
                    }

                    iAttrs.$observe('mRepeat', function () {
                        render()
                        find_model_value_and_set()
                    })

                    parentScope.$watch(iAttrs.mModel, function () {
                        find_model_value_and_set()
                    })
                }
            }
        }
    ]
)