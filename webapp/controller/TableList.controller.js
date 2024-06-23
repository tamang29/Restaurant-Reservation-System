sap.ui.define([
    "reservation030/controller/BaseController"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("reservation030.controller.TableList", {
            onInit: function () {
            },
            getRouter: function(){
                return sap.ui.core.UIComponent.getRouterFor(this);
            },
            onNavigateHome: function(){
                this.getRouter().navTo("home");
            },
            onNavigateTable: function(){
                this.getRouter().navTo("tableList");
            },
            onNavigateReservation: function(){
                this.getRouter().navTo("reservationList");
            },
            handleLineItemPress: function(oEvent){
                var context = oEvent.getSource().getBindingContext();
                this.getRouter().navTo("tables", {
                    tableId: context.getProperty("TableId"),
                });
            },
            _getBundle: function(){
                return this.getView().getModel("i18n").getResourceBundle();
            },

            onCreateNewTablePress: function(oModel){
                var oModel = this.getView().getModel();
                // let that = this;

                let cancelButton = new sap.m.Button({
                    text: this._getBundle().getText("cancel"),
                    type: sap.m.ButtonType.Reject,
                    press: function(){
                        sap.ui.getCore().byId("Popup").destroy();
                    }
                });
                let saveButton = new sap.m.Button({
                    text: this._getBundle().getText('save'),
                    type: sap.m.ButtonType.Accept,
                    press:function(){
                        let oNewTable = {
                            AssignedNo: sap.ui.getCore().byId("AssignedNo").getValue(),
                            NoOfSeats: parseInt(sap.ui.getCore().byId("NoOfSeats").getSelectedKey(), 10),
                            Location: sap.ui.getCore().byId("Location").getSelectedKey(),
                            Decoration: sap.ui.getCore().byId("Decoration").getSelectedKey(),
                        };
                        if(!oNewTable.AssignedNo|| !oNewTable.NoOfSeats|| !oNewTable.Location || !oNewTable.Decoration){
                            sap.m.MessageToast.show(
                                "Please fill the mandatory(*) areas."
                            );
                        }else{

                            let busyDialog = new sap.m.BusyDialog("Loading",{
                                text: "Creating Table"
                            })
                            busyDialog.open()

                            oModel.create('/TableSet', oNewTable,{
                                success: function(response){
                                    sap.m.MessageToast.show(
                                        "Table Creation Success"
                                    );
                                    oModel.refresh();
                                    sap.ui.getCore().byId("Loading").destroy();
                                    sap.ui.getCore().byId("Popup").destroy();

                                },
                                error: function(oError){
                                    var xmlString = oError.responseText;
                                    // Parse the XML string
                                    var parser = new DOMParser();
                                    var xmlDoc = parser.parseFromString(xmlString, 'text/xml');

                                    // Extract the value of the message tag
                                    var message = xmlDoc.getElementsByTagName('message')[0].textContent;

                                    console.log(message); // Output: Assigned number already exists.

                                    sap.m.MessageToast.show(
                                        message
                                    );
                                },
                            })
                    }
                    }

                })
                let oDialog = new sap.m.Dialog("Popup",{
                    title: this._getBundle().getText("createNewTable"),
                    contentWidth: "20rem",
                    buttons: [saveButton, cancelButton],
                    content:[
                        new sap.m.Label({text: this._getBundle().getText("inputAssignedNo")}),
                        new sap.m.Input({
                            maxLength: 40,
                            id: "AssignedNo",
                            placeholder: "Assign table number.",
                        }),
                        new sap.m.Label({text: this._getBundle().getText("inputNoOfSeats")}),
                        new sap.m.Select({
                            width:"100%",
                            id: "NoOfSeats",
                            items: [
                                new sap.ui.core.Item({ key: "2", text: "2" }),
                                new sap.ui.core.Item({ key: "4", text: "4" }),
                                new sap.ui.core.Item({ key: "6", text: "6" }),
                            ]
                        }),
                        new sap.m.Label({text: this._getBundle().getText("location")}),
                        new sap.m.Select({
                            width: "100%",
                            id: "Location",
                            items: [
                                new sap.ui.core.Item({ key: "inside", text: "Inside" }),
                                new sap.ui.core.Item({ key: "outside", text: "Outside" })
                            ]
                        }),
                        new sap.m.Label({text: this._getBundle().getText("decoration")}),
                        new sap.m.Select({
                            width:"100%",
                            id: "Decoration",
                            items: [
                                new sap.ui.core.Item({ key: "flower", text: "Flower" }),
                                new sap.ui.core.Item({ key: "candle", text: "Candle" })
                            ]
                        }),

                    ],
                })
                oDialog.open();
            },
            onDeleteTablePress: function(oEvent, oModel){
                if(!oModel){
                    var oModel = this.getView().getModel();
                    }
                return new Promise((resolve, reject) => {
                var context = oEvent.getSource().getBindingContext();
                var sTableId = context.getProperty("TableId");
                console.log(sTableId)
                // Get the OData model instance

                // Construct the entity URI for the table to be deleted
                var sEntityPath = "/TableSet('" + sTableId + "')";

                // Confirm deletion with a dialog or directly delete the record
                 sap.m.MessageBox.confirm("Are you sure you want to delete this table?", {
                    title: "Confirm Deletion",
                    onClose: function(oAction) {
                        if (oAction === sap.m.MessageBox.Action.OK) {
                            // Delete the table record from the OData service
                            oModel.remove(sEntityPath, {
                                success: function() {
                                    // Handle successful deletion
                                    sap.m.MessageToast.show("Table deleted successfully");
                                    resolve();
                                },
                                error: function(oError) {
                                    // Handle deletion error
                                    sap.m.MessageToast.show("Error deleting table: " + oError.responseText);
                                    reject(oError);
                                }
                            });
                        }
                        else{
                            reject("Deletion cancelled");
                        }
                    }
                });
            });
            },
            onEditTablePress: function(oEvent, oModel){
                if(!oModel){
                    var oModel = this.getView().getModel();
                }
                //get the table record binded with the button
                var oContext = oEvent.getSource().getBindingContext();

                // Get the data associated with the context
                var oData = oContext.getObject();
                //pressed table id
                let sTableId = oData.TableId;
                //update oData service
                let sEntityPath = "/TableSet('" + sTableId + "')";

                let cancelButton = new sap.m.Button({
                    text: this._getBundle().getText("cancel"),
                    type: sap.m.ButtonType.Reject,
                    press: function(){
                        sap.ui.getCore().byId("Popup").destroy();
                    }
                });
                let saveButton = new sap.m.Button({
                    text: this._getBundle().getText('save'),
                    type: sap.m.ButtonType.Accept,
                    press:function(){
                        let oUpdateTable = {
                            AssignedNo: sap.ui.getCore().byId("AssignedNo").getValue(),
                            NoOfSeats: parseInt(sap.ui.getCore().byId("NoOfSeats").getSelectedKey(), 10),
                            Location: sap.ui.getCore().byId("Location").getSelectedKey(),
                            Decoration: sap.ui.getCore().byId("Decoration").getSelectedKey(),

                        };
                        if(!oUpdateTable.AssignedNo|| !oUpdateTable.NoOfSeats|| !oUpdateTable.Location || !oUpdateTable.Decoration){
                            sap.m.MessageToast.show(
                                "Please fill the mandatory(*) areas."
                            );
                        }else{
                            let busyDialog = new sap.m.BusyDialog("Loading",{
                                text: "Updating Table"
                            })
                            busyDialog.open()
                        oModel.update(sEntityPath, oUpdateTable,{
                            success: function(response){
                                sap.m.MessageToast.show(
                                    "Table Update Success"
                                );
                                oModel.refresh();
                                sap.ui.getCore().byId("Loading").destroy();
                                sap.ui.getCore().byId("Popup").destroy();
                            },
                            error: function(oError){
                                console.log(oError)
                                sap.m.MessageToast.show(
                                    oError
                                );
                            },
                        })
                    }
                    }

                })
                let oDialog = new sap.m.Dialog("Popup",{
                    title: this._getBundle().getText("updateTableForm"),
                    contentWidth: "20rem",
                    buttons: [saveButton, cancelButton],
                    content:[
                        new sap.m.Label({text: this._getBundle().getText("inputAssignedNo")}),
                        new sap.m.Input({
                            maxLength: 40,
                            id: "AssignedNo",
                            placeholder: "Assign table number.",
                            value: oData.AssignedNo
                        }),
                        new sap.m.Label({text: this._getBundle().getText("inputNoOfSeats")}),
                        new sap.m.Select({
                            width:"100%",
                            id: "NoOfSeats",
                            selectedKey: oData.NoOfSeats,
                            items: [
                                new sap.ui.core.Item({ key: "2", text: "2" }),
                                new sap.ui.core.Item({ key: "4", text: "4" }),
                                new sap.ui.core.Item({ key: "6", text: "6" }),
                            ]
                        }),
                        new sap.m.Label({text: this._getBundle().getText("location")}),
                        new sap.m.Select({
                            width: "100%",
                            id: "Location",
                            selectedKey: oData.Location,
                            items: [
                                new sap.ui.core.Item({ key: "inside", text: "Inside" }),
                                new sap.ui.core.Item({ key: "outside", text: "Outside" })
                            ]
                        }),
                        new sap.m.Label({text: this._getBundle().getText("decoration")}),
                        new sap.m.Select({
                            width:"100%",
                            id: "Decoration",
                            selectedKey: oData.Decoration,
                            items: [
                                new sap.ui.core.Item({ key: "flower", text: "Flower" }),
                                new sap.ui.core.Item({ key: "candle", text: "Candle" })
                            ]
                        }),

                    ],
                })
                oDialog.open();
            }

        });
    });
