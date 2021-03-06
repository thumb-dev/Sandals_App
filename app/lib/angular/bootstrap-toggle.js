! function() {
    "use strict";
    angular.module("ui.toggle", []).value("$toggleSuppressError", !1).constant("toggleConfig", {
        on: "On",
        off: "Off",
        size: "",
        onstyle: "btn-primary",
        offstyle: "btn-default",
        style: ""
    }).controller("ToggleController", ["$scope", "$attrs", "$interpolate", "$log", "toggleConfig", "$toggleSuppressError", function(e, t, n, l, o) {
        var s = this,
            a = {
                $setViewValue: angular.noop
            };
        angular.forEach(["on", "off", "size", "onstyle", "offstyle", "style"], function(l, a) {
            s[l] = angular.isDefined(t[l]) ? 6 > a ? n(t[l])(e.$parent) : e.$parent.$eval(t[l]) : o[l]
        }), this.init = function(n) {
            a = n, s.computeStyle(), a.$render = function() {
                s.toggle()
            }, a.$viewChangeListeners.push(function() {
                e.$eval(t.ngChange)
            })
        }, this.computeStyle = function() {
            var t = s.element.find("label");
            angular.element(t[0]).html(s.on), angular.element(t[1]).html(s.off);
            var n = s.element.find("span"),
                l = s.width || Math.max(t[0].offsetWidth, t[1].offsetWidth) + n[0].offsetWidth / 2,
                o = s.height || Math.max(t[0].offsetHeight, t[1].offsetHeight),
                a = s.element.find("div"),
                i = a[0].offsetWidth,
                r = a[1].offsetHeight;
            e.wrapperStyle = {}, e.wrapperStyle.width = l > i ? l + "px" : i + "px", e.wrapperStyle.height = o > r && "btn-xs" !== s.size && "btn-sm" !== s.size ? o + "px" : r + "px", e.onClass = [s.onstyle, s.size, "toggle-on"], e.offClass = [s.offstyle, s.size, "toggle-off"], e.handleClass = [s.size, "toggle-handle"]
        }, this.toggle = function() {
            this.isOn = angular.isDefined(a.$viewValue) ? a.$viewValue : !1, e.wrapperClass = this.isOn ? [s.onstyle, s.size, s.style] : [s.offstyle, "off ", s.size, s.style]
        }, e.onSwitch = function() {
            a.$setViewValue(!a.$viewValue), a.$render()
        }, angular.forEach(["ngModel"], function(n) {
            var l = e.$parent.$watch(t[n], function() {
                a.$render()
            });
            e.$parent.$on("$destroy", function() {
                l()
            })
        }), angular.forEach(["on", "off", "size", "onstyle", "offstyle", "style"], function(e) {
            t.$observe(e, function(t) {
                s[e] !== t && (s[e] = t, s.computeStyle())
            })
        })
    }]).directive("toggle", function() {
        return {
            restrict: "E",
            transclude: !0,
            template: '<div class="toggle btn toggleWrapper" ng-class="wrapperClass" ng-style="wrapperStyle" ng-click="onSwitch()"><div class="toggle-group"><label class="btn toggleCM" ng-class="onClass"></label><label class="btn active toggleInches" ng-class="offClass"></label><span class="btn btn-default" ng-class="handleClass"></span></div></div>',
            scope: {
                bindModel: "=ngModel"
            },
            require: ["toggle", "ngModel"],
            controller: "ToggleController",
            controllerAs: "toggle",
            compile: function() {
                return {
                    pre: function(e, t, n, l) {
                        var o = l[0],
                            s = l[1];
                        o.element = t, o.init(s)
                    },
                    post: function() {}
                }
            }
        }
    })
}();