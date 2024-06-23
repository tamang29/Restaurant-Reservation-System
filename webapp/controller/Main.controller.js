sap.ui.define([
    "reservation030/controller/BaseController"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("reservation030.controller.Main", {
            onInit: function () {
                var oToday = new Date();
                this.getView().byId("calendar").setMinDate(oToday);
                this.getView().byId("StartTime").setDateValue(oToday);
            },
            getRouter: function(){
                return sap.ui.core.UIComponent.getRouterFor(this);
            },
            _getBundle: function(){
                return this.getView().getModel("i18n").getResourceBundle();
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
            onTimeChange: function(oEvent){
                var oTimePicker = oEvent.getSource();
                var oSelectedTime = oTimePicker.getDateValue();
                var oSelectedDate = this.byId("calendar").getSelectedDates()[0].getStartDate();
                // Get the current time
                console.log(oSelectedDate)
                var oCurrentTime = new Date();
                // Check if the selected time is before the current time
                if(oSelectedDate < oCurrentTime){
                if (oSelectedTime.getHours() == oCurrentTime.getHours()){
                    if(oSelectedTime.getMinutes() < oCurrentTime.getMinutes()){
                        new sap.m.MessageToast.show(
                            "Please select future date and time."
                        );
                    }
                }
                else if(oSelectedTime.getHours() < oCurrentTime.getHours() ) {
                    // If the selected time is before the current time, reset the TimePicker value to the current time
                    oTimePicker.setDateValue(oCurrentTime);
                    new sap.m.MessageToast.show(
                        "Please select future date and time."
                    );
                }
            }
            var oButton = this.byId("SelectTime");
                oButton.setEnabled();
            },
            onSelectTimePress: function(oEvent){
            var oModel = this.getView().getModel();
            var oRouter = this.getRouter();

               let oCheckData = {
                NoOfGuests: this.byId("NoOfGuests").getValue(),
                ReserveDate: this.byId("calendar").getSelectedDates()[0].getStartDate(),
                StartTime: this.byId("StartTime").getValue()
               }
               if(!oCheckData.NoOfGuests || !oCheckData.ReserveDate || !oCheckData.StartTime){
                new sap.m.MessageBox.show(
                    "Please fill all the fields.",  {
                        icon: sap.m.MessageBox.Icon.ERROR,
                        title: "Please try again.",
                        actions: [sap.m.MessageBox.Action.OK]
                    }
                )
               }else{
                var oCell = this.byId("tableSelectCell");
                oCell.removeAllContent();
                var oList = [];
                var selectedBox = [];
                var selectButton = new sap.m.Button({
                    text: "Select Table",
                    press: function(oEvent){

                        var aCheckboxes = oCell.getContent().filter(function(oContent) {
                            return oContent instanceof sap.m.CheckBox;
                        });
                        aCheckboxes.forEach(function(oCheckbox) {
                            if (oCheckbox.getSelected()) {
                                var checkboxId = oCheckbox.getId();
                                selectedBox.push(checkboxId)
                                oList.push(oCheckbox.getCustomData()[0].getValue());
                            }
                        });
                        
                        //customer seat requirement < table seats
                        var totalCapacity = oList.reduce(function(total, current) {
                            return total + current;
                        }, 0);

                        if(totalCapacity < oCheckData.NoOfGuests){
                            new sap.m.MessageBox.show(
                                "You require more Tables.",  {
                                    icon: sap.m.MessageBox.Icon.ERROR,
                                    title: "Please select more.",
                                    actions: [sap.m.MessageBox.Action.OK]
                                }
                            )
                        }
                        let oNewReservation = {

                            NoOfGuest: parseInt(oCheckData.NoOfGuests, 10),
                            ReservationName: sap.ui.getCore().byId("ReservationName").getValue(),
                            Email: sap.ui.getCore().byId("Email").getValue(),
                            Phone: sap.ui.getCore().byId("Phone").getValue(),
                            Freetext: sap.ui.getCore().byId("Freetext").getValue(),
                            ReserveDate: oCheckData.ReserveDate,
                            StartTime: oCheckData.StartTime,
                            TableId: selectedBox.join(", ")
                        };
                        console.log(oNewReservation)
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
                                    sap.ui.getCore().byId("Loading").destroy();
                                    sap.m.MessageToast.show(
                                        "Reservation Creation Success"
                                    );
                                    oModel.refresh();
                                    location.reload();
                                    oRouter.navTo("reservationList");
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
                                    selectedBox = [];
                                    sap.ui.getCore().byId("Loading").destroy();
                                },
                            })
                    }

                    }
                })
                var tableLayout = new sap.ui.layout.VerticalLayout
                oModel.read('/TableSet', {
                    success: function(oData){
                        oData.results.forEach(function(sTable){
                            var oCheckBox = new sap.m.CheckBox({
                                text: "Table No:" +sTable.AssignedNo +"\n Capacity:"+sTable.NoOfSeats,
                                id: sTable.TableId,
                                customData: new sap.ui.core.CustomData({
                                    key: "capacity",
                                    value: sTable.NoOfSeats // Custom value associated with the checkbox
                                })
                            });
                            oCell.addContent(oCheckBox);
                        })

                        oCell.addContent(selectButton)
                    },
                    error: function(oError){
                        console.log(oError)
                    }
                })

                var oVerticalLayout = new sap.m.VBox({
                    items: [
                        new sap.m.Label({ text: this._getBundle().getText("inputReservationName") }),
                        new sap.m.Input({
                            maxLength: 40,
                            id: "ReservationName",
                            required: true,
                            placeholder: "Enter full name...."
                        }),
                        new sap.m.Label({ text: this._getBundle().getText("inputEmail") }),
                        new sap.m.Input({
                            maxLength: 40,
                            id: "Email",
                            required: true,
                            placeholder: "Enter email address...."
                        }),
                        new sap.m.Label({ text: this._getBundle().getText("inputPhone") }),
                        new sap.m.Input({
                            maxLength: 40,
                            id: "Phone",
                            required: true,
                            placeholder: "Enter phone number...."
                        }),
                        new sap.m.Label({ text: this._getBundle().getText("inputFreetext") }),
                        new sap.m.Input({
                            maxLength: 255,
                            id: "Freetext",
                            placeholder: "Special request...."
                        })
                    ]
                });
                oCell.addContent(oVerticalLayout)
               }

               
            }
        });
    });
