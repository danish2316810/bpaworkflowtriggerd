sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("app.bpaui.controller.SoView", {
        onInit() {
        },
        onPress:function(){
            // Step 1: Get values from input fields
    var salesOrderId = this.byId("idSalesOr").getValue();
    var salesOrderValue = this.byId("idSOVal").getValue();
         salesOrderValue=parseInt(salesOrderValue)
    var currency = this.byId("idCurr").getValue();

    // Step 2: Build the payload
    var payload = {
        salesorderid: salesOrderId,
        salesOrderValue: salesOrderValue,
        currency: currency
    };

    // Step 3: Make the AJAX POST call
    $.ajax({
        url: "/odata/v4/bpaservcie/BPA", // <-- replace with your actual endpoint
        type: "POST",
        contentType: "application/json",  // telling the backend we're sending JSON
        data: JSON.stringify(payload),    // convert JS object to JSON string
        success: function (response) {
            sap.m.MessageToast.show("Data saved successfully!");
        },
        error: function (xhr, status, error) {
            sap.m.MessageBox.error("Error: " + error);
        }
    });
        }




    });
});