sap.ui.define([
    "sap/ui/core/mvc/Controller",
     "sap/ui/model/json/JSONModel"
], (Controller,JSONModel) => {
    "use strict";
    var that;
    return Controller.extend("com.productionplantdata.controller.DetailView", {
        onInit() {
            that = this;
            this.bus = this.getOwnerComponent().getEventBus();
            this.bus.subscribe("flexible", "setDetailPage", this._onPlantSelected, this);
        },
        handleClose: function () {
            var oFCL = this.getView().getParent().getParent(); // Get FlexibleColumnLayout
            oFCL.setLayout(sap.f.LayoutType.OneColumn); // Collapse detail and show only the master
        },
        
        
        
        getData: function (plantuniqueId) {
            var that = this;
            var oPlantModel = this.getOwnerComponent().getModel("plantV2Model");
            // Fetch Plant Details
            oPlantModel.read("/plantcalviewS", {
                success: function (oData) {
                    var filteredPlant = oData.results.find(item => item.PU_ID === plantuniqueId);
                    if (filteredPlant) {
                        var oFilteredPlantModel = new JSONModel(filteredPlant);
                        console.log("Filtered Plant Model Data:", oFilteredPlantModel.getData());
        
                        // Use "that" to reference the correct context
                        this.getView().setModel(oFilteredPlantModel, "PlantDetails");
                        
                
               
                    } else {
                        console.warn("No plant details found for PU_ID:", plantuniqueId);
                    }
                }.bind(this), // <-- Bind "this" to ensure correct context
                error: function (oError) {
                    console.error("Error fetching plant details:", oError);
                }.bind(this) // <-- Bind "this" to ensure correct context
            });
        
            // Fetch Material Details
            oPlantModel.read("/branchplantcalview", {
                success: function (oData) {
                    var filteredMaterials = oData.results.filter(item => item.PLANT_PU_ID === plantuniqueId);
                    if (filteredMaterials.length > 0) {
                        var oFilteredMaterialsModel = new JSONModel({ Materials: filteredMaterials });
                        console.log("Filtered Material Model Data:", oFilteredMaterialsModel.getData());
        
                        this.getView().setModel(oFilteredMaterialsModel, "MaterialDetails");
                         
                    } else {
                        console.warn("No materials found for PU_ID:", plantuniqueId);
                    }
                }.bind(this), // <-- Bind "this" to ensure correct context
                error: function (oError) {
                    console.error("Error fetching material details:", oError);
                }.bind(this) // <-- Bind "this" to ensure correct context
            });
        },
        
        onAfterRendering: function () {
            var oGModel = this.getOwnerComponent().getModel("globalModel");
            var plantuniqueId = oGModel.getProperty("/PlantuniqueID");
          
            this.getData(plantuniqueId); // Pass both the uniqueID and characteristicIDs to getData
        },



        _onPlantSelected: function (sChannel, sEvent, oData) {
            var plantuniqueId = oData.PlantuniqueID;
            var oPlantModel = this.getOwnerComponent().getModel("plantV2Model");
        
            oPlantModel.read("/plantcalviewS", {
                success: function (oData) {
                    var filteredPlant = oData.results.find(item => item.PU_ID === plantuniqueId);
                    if (filteredPlant) {
                        var oFilteredPlantModel = new JSONModel(filteredPlant);
                        console.log("Filtered Plant Model Data:", oFilteredPlantModel.getData());
        
                        // Use "that" to reference the correct context
                        this.getView().setModel(oFilteredPlantModel, "PlantDetails");
                        
               
                    } else {
                        console.warn("No plant details found for PU_ID:", plantuniqueId);
                    }
                }.bind(this), // <-- Bind "this" to ensure correct context
                error: function (oError) {
                    console.error("Error fetching plant details:", oError);
                }.bind(this) // <-- Bind "this" to ensure correct context
            });
        
            // Fetch Material Details
            oPlantModel.read("/branchplantcalview", {
                success: function (oData) {
                    var filteredMaterials = oData.results.filter(item => item.PLANT_PU_ID === plantuniqueId);
                    if (filteredMaterials.length > 0) {
                        var oFilteredMaterialsModel = new JSONModel({ Materials: filteredMaterials });
                        console.log("Filtered Material Model Data:", oFilteredMaterialsModel.getData());
        
                        this.getView().setModel(oFilteredMaterialsModel, "MaterialDetails");
                        
                    } else {
                        console.warn("No materials found for PU_ID:", plantuniqueId);
                    }
                }.bind(this), // <-- Bind "this" to ensure correct context
                error: function (oError) {
                    console.error("Error fetching material details:", oError);
                }.bind(this) // <-- Bind "this" to ensure correct context
            });
        },

          
       // Unsubscribe from EventBus to avoid memory leaks
       onExit: function () {
        this.bus.unsubscribe("flexible", "setDetailPage", this._onPlantSelected, this);
    },

    onDetailPressRow: function (oEvent) {
        // var oFCL = this.getView().getParent().getParent(); // Get FlexibleColumnLayout
        // oFCL.setLayout(sap.f.LayoutType.TwoColumnsEndExpanded); // Collapse detail and show only the master
        // Get the selected item from the event
        var oSelectedItem = oEvent.getParameter("listItem"); // Alternative way to get selected item
        if (!oSelectedItem) {
            console.error("No selected item found");
            return;
        }
    
        var oContext = oSelectedItem.getBindingContext("MaterialDetails");
        console.log("Binding Context:", oContext);
    
        // Get Branch and Plant Unique IDs
        var branchUniqueId = oContext.getProperty("B_ID"); // Branch ID
        var plantUniqueId = oContext.getProperty("PLANT_PU_ID"); // Plant ID
    
        // Now fetch and filter the characteristics data based on selected Branch and Plant
        this._fetchCharacteristicsData(branchUniqueId, plantUniqueId);
       
    },
    
    _fetchCharacteristicsData: function (branchUniqueId, plantUniqueId) {
        var oModel = this.getOwnerComponent().getModel("plantV2Model"); // OData Model for Branch
        var oGModel = this.getOwnerComponent().getModel("globalModel"); // Global Model
    
        // Read data from the OData service
        oModel.read("/branchplantcalview", {
            success: function (oData) {
                // Ensure the 'results' field exists and contains data
                if (!oData || !oData.results) {
                    MessageBox.error("No material data found for the selected branch.");
                    return;
                }
    
                // Filter results based on B_ID and PLANT_PU_ID
                var filteredData = oData.results.filter(function (item) {
                    return item.B_ID === branchUniqueId && item.PLANT_PU_ID === plantUniqueId;
                });
    
                if (filteredData.length === 0) {
                    MessageBox.warning("No material data found for the selected branch and plant.");
                    return;
                }
    
                // Set properties in the Global Model
                oGModel.setProperty("/BranchUniqueID", branchUniqueId);
                oGModel.setProperty("/PlantUniqueID", plantUniqueId);
               
                var oEventBus = this.getOwnerComponent().getEventBus();
                oEventBus.publish("flexible", "setDetailDetailPage", {
                    branchId: branchUniqueId,
                    plantId: plantUniqueId
                    
                });
            }.bind(this),
            error: function (oError) {
                MessageBox.error("Error fetching material data: " + oError.message);
            }
            
        });

    },
   
    
    });
});