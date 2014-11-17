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
                    var is_multi = false;
                    var class_string = '';
                    if (iAttrs.mMulti != undefined) {
                        is_multi = true;
                        class_string = "multi ";
                    }

                    var item_template_dom_element = $(domEle).children('m-item')
                    var item_template_html;
                    if(item_template_dom_element.length == 0){
                        item_template_html = '<span ng-bind="$item"></span>'
                    }
                    else{
                        item_template_html =  item_template_dom_element.html();
                    }
                    var item_template = '<div>' + item_template_html + '</div>'

                    var selected_item_template;
                    var item_selected_class_string;
                    if(is_multi){
                        selected_item_template = '<div ng-repeat="$sitem in $selected" ng-show="$selected.length > 0">' +
                            item_template_html.replace(/\$item/g, '$sitem') + '</div>';
                        item_selected_class_string = 'ng-class="{selected: $selected.indexOf($item) != -1}">'
                    }
                    else{
                        selected_item_template = '<div ng-show="$selected">' + item_template_html.replace(/\$item/g, '$selected') + '</div>';
                        item_selected_class_string = 'ng-class="{selected: $item == $selected}">';
                    }



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


                    if (iAttrs.mClass) {
                        class_string = iAttrs.mClass
                    }

                    scope.reverse = false;
                    if(iAttrs.mReverse != undefined){
                        scope.reverse = true;
                        class_string += " reverse"
                    }

                    if(is_multi){
                        scope.$selected = [];
                    }
                    else{
                        scope.$selected = null;
                    }

                    var assign_to_model = function(value){
                        var model = $parse(iAttrs.mModel);
                        model.assign(parentScope, value)
                    }

                    var get_current_model_value = function(){
                        return parentScope.$eval(iAttrs.mModel);
                    }



                    scope.handle_item_click = function ($item) {
                        var value;
                        if (iAttrs.mValue) {
                            var attr = iAttrs.mValue.replace('$item.', '')
                            value = $item[attr]
                        }
                        else {
                            value = $item
                        }
                        if(!is_multi){
                            scope.$selected = $item;
                            assign_to_model(value)
                        }
                        else{
                            if (scope.$selected.indexOf($item) == -1) {
                                scope.$selected.push($item)
                            }
                            else {
                                scope.$selected = $.grep(scope.$selected, function ($i) {
                                    return $i != $item;
                                })
                            }

                            var current_val = get_current_model_value()
                            if (current_val.indexOf(value) == -1) {
                                current_val.push(value)
                            }
                            else{
                                current_val = $.grep(current_val, function(v){ return v != value;})
                            }

                            assign_to_model(current_val)
                        }

                        if (iAttrs.mOnselectCallback) {
                            if (iAttrs.mOnselectCallback) {
                                parentScope.$eval(iAttrs.mOnselectCallback, {$item: $item})
                            }
                        }
                    }

                    scope.set_null = function(){
                        if(is_multi){
                            assign_to_model([])
                            scope.$selected = [];

                        }
                        else{
                            assign_to_model(null)
                            scope.$selected = null;
                        }

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
                            '<li ng-repeat="$item in ' + iAttrs.mRepeat +'" ng-click="handle_item_click($item)" ' +
                                item_selected_class_string +
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
                        // close the drop down. Else the body event handler will simply ignore the event

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
                        var model_current_val = get_current_model_value()
                        if(!model_current_val){
                            if(is_multi){
                                scope.$selected = [];
                                assign_to_model([])
                            }
                            else{
                                scope.$selected = null;
                            }

                        }
                        else{
                            var iterable = parentScope.$eval(iAttrs.mRepeat);
                            if(is_multi){
                                scope.$selected = []
                            }
                            else{
                                scope.selected = null;
                            }

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
                                if(!is_multi){
                                    if (model_current_val == value) {
                                        scope.$selected = item;
                                        break;
                                    }
                                }
                                else{
                                    if(model_current_val.indexOf(value) != -1){
                                        scope.$selected.push(item)
                                    }
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