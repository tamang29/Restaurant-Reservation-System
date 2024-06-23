sap.ui.define(
    ["reservation030/controller/BaseController",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */

    function (Controller){
        "use-strict";

        return Controller.extend("reservation030.controller.ReservationDetails", {

            onInit: function() {
                this.getOwnerComponent()
                    .getRouter()
                    .getRoute("reservations")
                    .attachPatternMatched(this._onRouteMatched, this);

            },
            getRouter: function(){
                return sap.ui.core.UIComponent.getRouterFor(this);
            },
            _getBundle: function(){
                return this.getView().getModel("i18n").getResourceBundle();
            },

            _onRouteMatched: function(oEvent){
                //get the reservation id which was navigated to (from MainController reservationId)
                let sReservationId = oEvent.getParameter("arguments").reservationId;
                //get the table data which we clicked ps. does not check to DB
                let oModel = this.getOwnerComponent().getModel();
                //the oData service we are trying to retrieve
                let sEntityPath = "/ReservationSet('" + sReservationId + "')";
                let oView = this.getView();

                //this part of code should not matter to retrieve the data from oData service
                oModel.read(sEntityPath, {
                    success: function(oData) {
                        // Data successfully loaded
                        console.log("Data loaded:", oData);
                    },
                    error: function(oError) {
                        // Error handling
                        console.error("Error loading data:", oError);
                    }
                });
                oView.bindElement(sEntityPath);

            },
            onDeleteReservationPress: function(oEvent){
                let oModel = this.getOwnerComponent().getModel();
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                async function deleteTable() {
                    try {
                        await sap.ui.controller("reservation030.controller.ReservationList").onDeleteReservationPress(oEvent, oModel);
                        console.log("Deletion Success");
                        oRouter.navTo("reservationList")
                         // Navigate to the home route after successful deletion
                    } catch (error) {
                        console.error("Deletion Error:", error);
                        // Handle deletion error if needed
                    }
                }
                deleteTable();

            }
        })
    }
)