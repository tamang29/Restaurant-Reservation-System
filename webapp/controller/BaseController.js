sap.ui.define(
    ["sap/ui/core/mvc/Controller"],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function(Controller, History){
        "use strict";
        return Controller.extend("reservation030.controller.BaseController", {
            /**
             * @override
             */

            onInit: function () {},

            getRouter: function(){
                return sap.ui.core.UIComponent.getRouterFor(this);
            }
        });
    }
)