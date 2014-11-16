var mSelect = angular.module('mSelect', []);

mSelect.controller('mSelectCtrl', [
    '$scope',
    function ($scope) {

    }
]);

mSelect.directive('mSelect',
    [   '$compile', '$controller', '$timeout', '$rootScope', '$parse',
        function ($compile, $controller, $timeout, $rootScope, $parse) {
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

                        var model = $parse(iAttrs.mModel);
                        model.assign(parentScope, value)

                        scope.$selected = $item;
                        if (iAttrs.mOnselectCallback) {
                            if (iAttrs.mOnselectCallback) {
                                parentScope.$eval(iAttrs.mOnselectCallback, {$item: $item})
                            }
                        }
                    }

                    scope.set_null = function(){
                        scope.$selected = null;

                        var model = $parse(iAttrs.mModel);
                        model.assign(parentScope, null)

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
                            '<li ng-repeat="$item in ' + iAttrs.mRepeat +'" ng-click="assign_to_model($item)" ' +
                                'ng-class="{selected: $item == $selected}">' +
                            item_template +
                            '</li>' +
                            '</ul>' +
                            '</div>' +
                            '</div>'
                        $(domEle).append($compile(template)(scope))

                        var checkbox = domEle.find('.ms_hiddencb').first();
                        checkbox.prop('checked', false);
                        var dropdown_open = false;

                        var mselect_id = 1 + Math.floor(Math.random() * 10000); //do not want zero


                        // When the directive's contents are clicked, the body click handler ignores the click event
                        // this is done by making adding an attribute called mselect_id to thr original event
                        // if this is not present or if it is not equal to the current mselect_id body event handler will
                        // close the dropdown. Else the body event handler will simply ignore the event

                        var directive_click_handler = function(event){
                            dropdown_open = !dropdown_open;
                            checkbox.prop('checked', dropdown_open);

                            if(dropdown_open){
                                $('html').bind('click', body_click_handler)
                            }
                            else{
                                $('html').unbind('click', body_click_handler)
                            }
                            event.originalEvent.mselect_id = mselect_id;
                        }

                        var body_click_handler = function(event){
                            if(event.originalEvent.mselect_id != mselect_id){
                                dropdown_open = false;
                                checkbox.prop('checked', dropdown_open);
                                $('html').unbind('click', body_click_handler)
                            }
                        }

                        domEle.bind('click', directive_click_handler)

                    }
                    var find_model_value_and_set = function(){
                        var model_current_val = parentScope.$eval(iAttrs.mModel);
                        if(model_current_val === null){
                            scope.$selected = null;
                        }
                        else{
                            var iterable = parentScope.$eval(iAttrs.mRepeat);

                            for (var i = 0; i < iterable.length; i++) {
                                var item = iterable[i];
                                var value;
                                if (iAttrs.mValue) {
                                    var attr = iAttrs.mValue.replace('$item.', '');
                                    value = item[attr];
                                }
                                else {
                                    value = item;
                                }
                                if (model_current_val == value) {
                                    scope.$selected = item;
                                    break;
                                }
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