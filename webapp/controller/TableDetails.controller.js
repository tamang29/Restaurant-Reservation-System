sap.ui.define(
    ["reservation030/controller/BaseController",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */

    function (Controller){
        "use-strict";

        return Controller.extend("reservation030.controller.TableDetails", {

            onInit: function() {
                this.getOwnerComponent()
                    .getRouter()
                    .getRoute("tables")
                    .attachPatternMatched(this._onRouteMatched, this);

            },
            getRouter: function(){
                return sap.ui.core.UIComponent.getRouterFor(this);
            },
            _getBundle: function(){
                return this.getView().getModel("i18n").getResourceBundle();
            },

            _onRouteMatched: function(oEvent){
                //get the table id which was navigated to (from MainController tableId)
                let sTableId = oEvent.getParameter("arguments").tableId;
                //get the table data which we clicked ps. does not check to DB
                let oModel = this.getOwnerComponent().getModel();
                //the oData service we are trying to retrieve
                let sEntityPath = "/TableSet('" + sTableId + "')";
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
            onDeleteTablePress: function(oEvent){
                let oModel = this.getOwnerComponent().getModel();
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                async function deleteTable() {
                    try {
                        await sap.ui.controller("reservation030.controller.TableList").onDeleteTablePress(oEvent, oModel);
                        console.log("Deletion Success");
                        oRouter.navTo("tableList")
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