sap.ui.define([
    "reservation030/controller/BaseController"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("reservation030.controller.ReservationList", {
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
                this.getRouter().navTo("reservation");
            },
            handleLineItemPress: function(oEvent){
                var context = oEvent.getSource().getBindingContext();
                this.getRouter().navTo("reservations", {
                    reservationId: context.getProperty("ReservationId"),
                });
            },
            _getBundle: function(){
                return this.getView().getModel("i18n").getResourceBundle();
            },

            onCreateNewReservationPress: function(oModel){
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
                        let oNewReservation = {

                            NoOfGuest: parseInt(sap.ui.getCore().byId("NoOfGuest").getValue(),10),
                            ReservationName: sap.ui.getCore().byId("ReservationName").getValue(),
                            Email: sap.ui.getCore().byId("Email").getValue(),
                            Phone: sap.ui.getCore().byId("Phone").getValue(),
                            Freetext: sap.ui.getCore().byId("Freetext").getValue(),
                            ReserveDate: sap.ui.getCore().byId("ReserveDate").getValue(),
                            StartTime: sap.ui.getCore().byId("StartTime").getValue(),
                            TableId: sap.ui.getCore().byId("TableId").getValue(),
                        };
                        if(!oNewReservation.NoOfGuest || !oNewReservation.ReservationName || !oNewReservation.Email|| !oNewReservation.Phone|| !oNewReservation.ReserveDate|| !oNewReservation.StartTime || !oNewReservation.TableId){
                            sap.m.MessageToast.show(
                                "Please fill the mandatory(*) areas."
                            );
                        }else{
                            let busyDialog = new sap.m.BusyDialog("Loading",{
                                text: "Creating Reservation"
                            })
                            busyDialog.open()
                            oModel.create('/ReservationSet', oNewReservation,{
                                success: function(response){
                                    sap.m.MessageToast.show(
                                        "Reservation Creation Success"
                                    );
                                    oModel.refresh();
                                    sap.ui.getCore().byId("Loading").destroy();
                                    sap.ui.getCore().byId("Popup").destroy();
                                },
                                error: function(oError){
                                    console.log(oError); // Output: Assigned number already exists.

                                    sap.m.MessageToast.show(
                                        "Please try again."
                                    );
                                },
                            })
                    }
                }

                })

                let oDialog = new sap.m.Dialog("Popup",{
                    title: this._getBundle().getText("createNewReservation"),
                    contentWidth: "20rem",
                    buttons: [saveButton, cancelButton],
                    content:[
                        new sap.m.Label({text: this._getBundle().getText("inputNoOfGuest")}),
                        new sap.m.Input({
                            maxLength: 40,
                            id: "NoOfGuest",
                            required: true,
                            placeholder: "Number of people....",
                        }),
                        new sap.m.Label({text: this._getBundle().getText("inputReservationName")}),
                        new sap.m.Input({
                            maxLength: 40,
                            id: "ReservationName",
                            required: true,
                            placeholder:"Enter full name...."
                        }),
                        new sap.m.Label({text: this._getBundle().getText("inputEmail")}),
                        new sap.m.Input({
                            maxLength: 40,
                            id: "Email",
                            required: true,
                            placeholder:"Enter email address...."
                        }),
                        new sap.m.Label({text: this._getBundle().getText("inputPhone")}),
                        new sap.m.Input({
                            maxLength: 40,
                            id: "Phone",
                            required: true,
                            placeholder:"Enter phone number...."
                        }),
                        new sap.m.Label({text: this._getBundle().getText("inputFreetext")}),
                        new sap.m.Input({
                            maxLength: 255,
                            id: "Freetext",
                            placeholder: "Special request...."
                        }),
                        new sap.m.Label({text: this._getBundle().getText("inputReserveDate")}),
                        new sap.m.DatePicker({
                            id: "ReserveDate",
                            minDate: new Date(),
                            required: true,
                            valueFormat:"yyyy-MM-dd'T'HH:mm:ss"
                        }),
                        new sap.m.Label({text: this._getBundle().getText("inputReserveTime")}),
                        new sap.m.TimePicker({
                            width:"100%",
                            id: "StartTime",
                            displayFormat:"HH:mm",
                            valueFormat: "PTHH'H'mm'M'",
                            minutesStep: 15,
                            secondsStep: 60,
                            value:"PT11H00M",

                        }),
                        new sap.m.Label({text: this._getBundle().getText("inputTableId")}),
                        new sap.m.Input({
                            maxLength: 40,
                            id: "TableId",
                            placeholder: "Choose Table",
                            required: true,
                        }),
                    ],
                })
                oDialog.open();
            },
            onDeleteReservationPress: function(oEvent, oModel){
                if(!oModel){
                    var oModel = this.getView().getModel();
                    }
                return new Promise((resolve, reject) => {
                var context = oEvent.getSource().getBindingContext();
                var sReservationId = context.getProperty("ReservationId");
                console.log(sReservationId)
                // Get the OData model instance

                // Construct the entity URI for the reservation to be deleted
                var sEntityPath = "/ReservationSet('" + sReservationId + "')";

                // Confirm deletion with a dialog or directly delete the record
                 sap.m.MessageBox.confirm("Are you sure you want to delete this table?", {
                    title: "Confirm Deletion",
                    onClose: function(oAction) {
                        if (oAction === sap.m.MessageBox.Action.OK) {
                            // Delete the table record from the OData service
                            oModel.remove(sEntityPath, {
                                success: function() {
                                    // Handle successful deletion
                                    sap.m.MessageToast.show("Reservation deleted successfully");
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
            onEditReservationPress: function(oEvent, oModel){
                if(!oModel){
                    var oModel = this.getView().getModel();
                }
                //get the table record binded with the button
                var oContext = oEvent.getSource().getBindingContext();

                // Get the data associated with the context
                var oData = oContext.getObject();
                console.log(oData.StartTime)
                //pressed table id
                let sReservationId = oData.ReservationId;
                //update oData service
                let sEntityPath = "/ReservationSet('" + sReservationId + "')";

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
                        let oUpdateReservation = {
                            NoOfGuest: parseInt(sap.ui.getCore().byId("NoOfGuest").getValue(),10),
                            ReservationName: sap.ui.getCore().byId("ReservationName").getValue(),
                            Email: sap.ui.getCore().byId("Email").getValue(),
                            Phone: sap.ui.getCore().byId("Phone").getValue(),
                            Freetext: sap.ui.getCore().byId("Freetext").getValue(),
                            ReserveDate: sap.ui.getCore().byId("ReserveDate").getValue(),
                            StartTime: sap.ui.getCore().byId("StartTime").getValue(),
                            TableId: sap.ui.getCore().byId("TableId").getValue(),
                        };
                        if(!oUpdateReservation.NoOfGuest || !oUpdateReservation.ReservationName || !oUpdateReservation.Email|| !oUpdateReservation.Phone|| !oUpdateReservation.ReserveDate|| !oUpdateReservation.StartTime || !oUpdateReservation.TableId){
                            sap.m.MessageToast.show(
                                "Please fill the mandatory(*) areas."
                            );
                        }else{
                            let busyDialog = new sap.m.BusyDialog("Loading",{
                                text: "Creating Reservation"
                            })
                            busyDialog.open()
                        oModel.update(sEntityPath, oUpdateReservation,{
                            success: function(response){
                                sap.m.MessageToast.show(
                                    "Reservation Update Success"
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
                    title: this._getBundle().getText("updateReservation"),
                    contentWidth: "20rem",
                    buttons: [saveButton, cancelButton],
                    content:[
                        new sap.m.Label({text: this._getBundle().getText("inputNoOfGuest")}),
                        new sap.m.Input({
                            maxLength: 40,
                            id: "NoOfGuest",
                            required: true,
                            placeholder: "Number of people....",
                            value: oData.NoOfGuest
                        }),
                        new sap.m.Label({text: this._getBundle().getText("inputReservationName")}),
                        new sap.m.Input({
                            maxLength: 40,
                            id: "ReservationName",
                            required: true,
                            placeholder:"Enter full name....",
                            value: oData.ReservationName
                        }),
                        new sap.m.Label({text: this._getBundle().getText("inputEmail")}),
                        new sap.m.Input({
                            maxLength: 40,
                            id: "Email",
                            required: true,
                            placeholder:"Enter email address....",
                            value: oData.Email
                        }),
                        new sap.m.Label({text: this._getBundle().getText("inputPhone")}),
                        new sap.m.Input({
                            maxLength: 40,
                            id: "Phone",
                            required: true,
                            placeholder:"Enter phone number....",
                            value: oData.Phone
                        }),
                        new sap.m.Label({text: this._getBundle().getText("inputFreetext")}),
                        new sap.m.Input({
                            maxLength: 255,
                            id: "Freetext",
                            placeholder: "Special request....",
                            value: oData.Freetext
                        }),
                        new sap.m.Label({text: this._getBundle().getText("inputReserveDate")}),
                        new sap.m.DatePicker({
                            id: "ReserveDate",
                            minDate: new Date(oData.ReserveDate),
                            valueFormat:"yyyy-MM-dd'T'HH:mm:ss",
                            dateValue: new Date(oData.ReserveDate),
                            value: {path: '/ReserveDate',
                             type: 'sap.ui.model.odata.type.Date'},
                        }),
                        new sap.m.Label({text: this._getBundle().getText("inputReserveTime")}),
                        new sap.m.TimePicker({
                            width:"100%",
                            id: "StartTime",
                            displayFormat:"HH:mm",
                            valueFormat: "PTHH'H'mm'M'",
                            minutesStep: 15,
                            secondsStep: 60,
                            dateValue: new Date(oData.StartTime.ms + (new Date(oData.StartTime.ms).getTimezoneOffset() * 60000))
                        }),
                        new sap.m.Label({text: this._getBundle().getText("inputTableId")}),
                        new sap.m.Input({
                            maxLength: 40,
                            id: "TableId",
                            placeholder: "Choose Table",
                            required: true,
                            value: oData.TableId
                        }),
                    ],
                })
                oDialog.open();
            }

        });
    });
