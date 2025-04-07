sap.ui.define([
    "sap/ui/core/mvc/Controller",
     "sap/ui/model/json/JSONModel"
], (Controller,JSONModel) => {
    "use strict";
    var that;
    return Controller.extend("com.productionplantdata.controller.DetailDetailView", {
        onInit() {
            that = this;
            this.bus = this.getOwnerComponent().getEventBus();
            this.bus.subscribe("flexible", "setDetailDetailPage", this._onBranchSelected, this);
           
           
        },
           
       // Unsubscribe from EventBus to avoid memory leaks
       onExit: function () {
        this.bus.unsubscribe("flexible", "setDetailDetailPage", this._onBranchSelected, this);
    },
    detailDetailHandleClose: function () {
        var oFCL = this.getView().getParent().getParent(); // Get FlexibleColumnLayout
        oFCL.setLayout(sap.f.LayoutType.ThreeColumnsMidExpandedEndHidden); // Collapse detail and show only the master
    },
    
    
    // getData: function (bracnhuniqueId,plantuniqueId) {
    //     var that = this;
    //     var oPlantModel = this.getOwnerComponent().getModel("plantV2Model");
    //     // Fetch Plant Details
    //     oPlantModel.read("/branchmaterialcalview", {
    //         success: function (oData) {
    //             var filteredPlant = oData.results.find(item => item.B_ID === bracnhuniqueId && item.PLANT_PU_ID===plantuniqueId);
    //             if (filteredPlant) {
    //                 var oFilteredPlantModel = new JSONModel(filteredPlant);
    //                 console.log("Filtered Plant Model Data:", oFilteredPlantModel.getData());
    
    //                 // Use "that" to reference the correct context
    //                 this.getView().setModel(oFilteredPlantModel, "PlantDetails");
           
    //             } else {
    //                 console.warn("No plant details found for PU_ID:", plantuniqueId);
    //             }
    //         }.bind(this), // <-- Bind "this" to ensure correct context
    //         error: function (oError) {
    //             console.error("Error fetching plant details:", oError);
    //         }.bind(this) // <-- Bind "this" to ensure correct context
    //     });
    // },

    // onAfterRendering: function () {
    //     var oGModel = this.getOwnerComponent().getModel("globalModel");
    //     var bracnhuniqueId= oGModel.getProperty("/BranchUniqueID");
    //     var plantuniqueId = oGModel.getProperty("/PlantuniqueID");
    //     this.getData(bracnhuniqueId,plantuniqueId); // Pass both the uniqueID and characteristicIDs to getData
    // },
    // _onBranchSelected: function (sChannel, sEvent, oData) {
    //     var brancuniqueId=oData.branchId;
    //     var plantuniqueId = oData.plantId;
    //     var oPlantModel = this.getOwnerComponent().getModel("plantV2Model");
    
    //     oPlantModel.read("/branchmaterialcalview", {
    //         success: function (oData) {
    //             var filteredPlant = oData.results.find(item => item.B_ID === brancuniqueId && item.PLANT_PU_ID===plantuniqueId);
    //             if (filteredPlant) {
    //                 var oFilteredPlantModel = new JSONModel(filteredPlant);
    //                 console.log("Filtered Plant Model Data:", oFilteredPlantModel.getData());
    
    //                 // Use "that" to reference the correct context
    //                 this.getView().setModel(oFilteredPlantModel, "PlantDetails");
                    
           
    //             } else {
    //                 console.warn("No plant details found for PU_ID:", plantuniqueId);
    //             }
    //         }.bind(this), // <-- Bind "this" to ensure correct context
    //         error: function (oError) {
    //             console.error("Error fetching plant details:", oError);
    //         }.bind(this) // <-- Bind "this" to ensure correct context
    //     });
    // }
    getData: function (branchUniqueId, plantUniqueId) {
        var that = this;
        var oPlantModel = this.getOwnerComponent().getModel("plantV2Model");
    
        oPlantModel.read("/branchmaterialcalview", {
            success: function (oData) {
                // Filter all matching records
                var filteredPlants = oData.results.filter(item => item.B_ID === branchUniqueId && item.PLANT_PU_ID === plantUniqueId);
                
                if (filteredPlants.length > 0) {
                    var oFilteredPlantModel = new JSONModel({ results: filteredPlants }); // Store as array
                    console.log("Filtered Plant Model Data:", oFilteredPlantModel.getData());
    
                    // Set model with an array structure
                    this.getView().setModel(oFilteredPlantModel, "PlantDetails");
                } else {
                    console.warn("No plant details found for branch ID:", branchUniqueId, "and plant ID:", plantUniqueId);
                }
            }.bind(this),
            error: function (oError) {
                console.error("Error fetching plant details:", oError);
            }.bind(this)
        });
    },

        // Fetch details when the view is rendered
        onAfterRendering: function () {
            var oGModel = this.getOwnerComponent().getModel("globalModel");
            var branchUniqueId = oGModel.getProperty("/BranchUniqueID");
            var plantUniqueId = oGModel.getProperty("/PlantUniqueID");

            this.getData(branchUniqueId, plantUniqueId);
        },

        // Handle EventBus selection
        _onBranchSelected: function (sChannel, sEvent, oData) {
            var branchUniqueId = oData.branchId;
            var plantUniqueId = oData.plantId;

            this.getData(branchUniqueId, plantUniqueId);
        }
            });
        });