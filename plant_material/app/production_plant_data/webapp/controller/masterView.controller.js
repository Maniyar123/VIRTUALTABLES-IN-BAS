sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast"
], (Controller,JSONModel,Fragment,MessageToast) => {
    "use strict";

    return Controller.extend("com.productionplantdata.controller.masterView", {
        onInit() {
            var that = this;
            var oModel = this.getOwnerComponent().getModel("plantV2Model");
            this.getView().setModel(oModel);
            this.bus = this.getOwnerComponent().getEventBus();
             // Attach a global click listener to the document
        //    document.addEventListener("mousedown", this._onDocumentClick.bind(this));
             // Fetch data from the OData entity
             oModel.read("/plantcalviewS", {
                success: function(oData) {
                    var oJSONModel = new JSONModel(oData);
                    that.getView().setModel(oJSONModel, "PlantData"); // Bind to JSONModel
                },
                error: function(oError) {
                    console.error("Error fetching plant data:", oError);
                },
              
            });
        },
        // _onDocumentClick: function (oEvent) {
        //     var oSearchField = this.byId("searchField");
        
        //     if (oSearchField) {
        //         // Check if the clicked element is outside the search field
        //         var oSearchFieldDomRef = oSearchField.getDomRef();
        //         if (oSearchFieldDomRef && !oSearchFieldDomRef.contains(oEvent.target)) {
        //             // Clear the value and trigger search with empty string
        //             oSearchField.setValue("");
        //             this.onSearch({ getParameter: function () { return ""; } });
        //         }
        //     }
        // },
        
        
        onPressRow:function(oEvent){
            // var oEventBus = this.getOwnerComponent().getEventBus();
            // oEventBus.publish("flexible", "setDetailPage", {
            // });
            // Get the selected item from the event
            var oSelectedItem = oEvent.getSource();
            var oContext = oSelectedItem.getBindingContext("PlantData");

            // Ensure the binding context is valid
            if (!oContext) {
                MessageBox.error("No product context found.");
                return;
            }

            // Get the unique ID and status of the selected product
            var plantuniqueId = oContext.getProperty("PU_ID"); // Assuming the binding path has "uniqueID"
            var status = oContext.getProperty("OPERATIONALSTATUS"); // Adjust according to your model property

            // Check if the product is inactive
            if (status === "false") {
                MessageBox.warning("Cannot view details for inactive Plant: " + plantuniqueId + ".");
                // Prevent navigation if the product is inactive
                return;
            }

            // Now fetch and filter the characteristics data based on the selected uniqueID
            this._fetchCharacteristicsData(plantuniqueId);
        },
        
        _fetchCharacteristicsData: function (plantuniqueId) {
            var oModel = this.getOwnerComponent().getModel("plantV2Model");
            var oGModel = this.getOwnerComponent().getModel("globalModel");

            // Read data from the OData service
            oModel.read("/plantcalviewS", {
                success: function (oData) {
                    // Ensure the 'results' field exists and contains the data
                    if (!oData || !oData.results) {
                        MessageBox.error("No characteristics data found for the selected product.");
                        return;
                    }

                    // Filter results based on uniqueID
                    var filteredData = oData.results.filter(function (item) {
                        return item.PU_ID === plantuniqueId;  // Adjust if needed
                    });

                    if (filteredData.length === 0) {
                        MessageBox.warning("No characteristics data found for the selected uniqueID.");
                        return;
                    }

                  
                   
                    oGModel.setProperty("/PlantuniqueID", plantuniqueId);  // Set uniqueID
                   

                    // Publish the event with uniqueID and characteristic IDs
                    var oEventBus = this.getOwnerComponent().getEventBus();
                    oEventBus.publish("flexible", "setDetailPage", {
                        PlantuniqueID: plantuniqueId,
                        
                    });
                }.bind(this),
                error: function (oError) {
                    MessageBox.error("Error fetching characteristics data: " + oError.message);
                }
            });
        },
        onSwitchChange: function (oEvent) { 
            var oSwitch = oEvent.getSource(); // Get the Switch control that triggered the event
        
            // Get the binding context of the switch to access the Plant ID
            var oBindingContext = oSwitch.getBindingContext(); // Uses default model
        
            // Ensure the binding context is valid
            if (!oBindingContext) {
                MessageBox.error("No plant context found.");
                return;
            }
        
            // Retrieve the Plant ID from the binding context
            var plantID = oBindingContext.getProperty("PU_ID"); // Ensure this matches the actual property name in your model
        
            // Get the OData model
            var oModel = this.getOwnerComponent().getModel("plantV2Model");
        
            // Fetch the current status and toggle it
            var currentStatus = oBindingContext.getProperty("OPERATIONALSTATUS"); // `true` or `false`
            var newStatus = !currentStatus; // Toggle `true` -> `false` or `false` -> `true`
        
            // Create the payload for the update
            var payload = {
                OPERATIONALSTATUS: newStatus
            };
        
            // Construct the path to the specific plant entity using Plant ID
            var sPath = "/plantcalviewS('" + plantID + "')"; // Adjust this path according to your OData service structure
        
            // Update the status in the OData model
            oModel.update(sPath, payload, {
                success: function () {
                    // Show a success message based on the new status including the Plant ID
                    if (newStatus) {
                        MessageBox.success("Plant with ID " + plantID + " is now operational (true).");
                    } else {
                        MessageBox.success("Plant with ID " + plantID + " is now non-operational (false).");
                    }
                },
                error: function () {
                    MessageBox.error("Failed to update status for Plant with ID " + plantID + ".");
                }
            });
        },
        


        // onSearch: function (oEvent) {
        //     // Get the value from the search field
        //     var sQuery = oEvent.getParameter("newValue");
        
        //     // Create an array of filters
        //     var aFilters = [];
        
        //     if (sQuery && sQuery.length > 0) {
        //         // Check if the query is numeric for PU_ID filtering
        //         if (!isNaN(sQuery)) {
        //             // If the query is numeric, apply an equality filter for PU_ID
        //             var oPU_IDFilter = new sap.ui.model.Filter("PU_ID", sap.ui.model.FilterOperator.EQ, parseInt(sQuery, 10));
        //             aFilters.push(oPU_IDFilter);
        //         } else {
        //              // If not numeric, apply a filter for PLANTNAME (search by first letter only)
        //     var oPlantNameFilter = new sap.ui.model.Filter("PLANTNAME", sap.ui.model.FilterOperator.StartsWith, sQuery);
        //     aFilters.push(oPlantNameFilter);
        //         }
        //     }
        
        //     // Get the table and its binding
        //     var oTable = this.byId("plantTable");
        //     var oBinding = oTable.getBinding("items");
        
        //     // Apply the filters
        //     oBinding.filter(aFilters, "Application");
        // },
    
       
        onCountryValueHelp: function () {
            var that = this; 
            this.selectedCountryID = null;
        
            // Create value help dialog if it doesn't exist
            if (!this._countryValueHelpDialog) {
                this._countryValueHelpDialog = sap.ui.xmlfragment(
                    "com.productionplantdata.valuehelp.CountryDialog",
                    this
                );
                this.getView().addDependent(this._countryValueHelpDialog);
            }
        
            // Fetch country data using the OData model
            var oModel = this.getView().getModel("plantV2Model");
            oModel.read("/plantcalviewS", {
                success: function (oData) {
                    var oUniqueCountries = {};
                    oData.results.forEach(function (entry) {
                        if (!oUniqueCountries[entry.C_ID]) {
                            oUniqueCountries[entry.C_ID] = {
                                C_ID: entry.C_ID,
                                C_NAME: entry.C_NAME
                            };
                        }
                    });
        
                    // Convert the unique country map to an array
                    var aUniqueCountries = Object.values(oUniqueCountries);
        
                    // Set data to a JSON model
                    var oUniqueCountryModel = new sap.ui.model.json.JSONModel();
                    oUniqueCountryModel.setData({ countries: aUniqueCountries });
        
                    // Bind data to dialog
                    that._countryValueHelpDialog.setModel(oUniqueCountryModel, "uniqueCountryModel");
        
                    // Open dialog
                    that._countryValueHelpDialog.open();
                },
                error: function () {
                    sap.m.MessageToast.show("Failed to fetch country data.");
                }
            });
        },
        onSelectCountry: function (oEvent) { 
            var oSelectedItem = oEvent.getSource();
            var oContext = oSelectedItem.getBindingContext("uniqueCountryModel");
        
            if (!oContext) {
                console.error("No binding context found for the selected item");
                return;
            }
        
            var oCountry = oContext.getObject();
            if (oCountry) {
                var sCountryName = oCountry.C_NAME;
                var sCountryID = oCountry.C_ID;
        
                // Set country name to input
                this.getView().byId("countryInput").setValue(sCountryName);
        
                // Save selected ID to controller property
                this.selectedCountryID = sCountryID;
        
                // Save selected country to model
                var oModel = this.getView().getModel("plantV2Model");
                oModel.setProperty("/selectedCountry", {
                    C_ID: sCountryID,
                    C_NAME: sCountryName
                });
        
               
                this._applyTableFilters();
            }
        
            // Close the dialog
            this._countryValueHelpDialog.close();
        },
        
        onPlantValueHelp: function () {
            var that = this;
            this.selectedPlantID = null;
          
            if (!this._plantValueHelpDialog) {
              this._plantValueHelpDialog = sap.ui.xmlfragment(
                "com.productionplantdata.valuehelp.PlantUniSearch",
                this
              );
              this.getView().addDependent(this._plantValueHelpDialog);
            }
          
            // Fetch unique plants
            var oModel = this.getView().getModel("plantV2Model");
            oModel.read("/plantcalviewS", {
              success: function (oData) {
                var oUniquePlants = {};
                oData.results.forEach(function (entry) {
                  if (!oUniquePlants[entry.PU_ID]) {
                    oUniquePlants[entry.PU_ID] = {
                      PU_ID: entry.PU_ID,
                      PLANTNAME: entry.PLANTNAME
                    };
                  }
                });
          
                var aUniquePlants = Object.values(oUniquePlants);
                var oPlantModel = new sap.ui.model.json.JSONModel({ plants: aUniquePlants });
          
                that._plantValueHelpDialog.setModel(oPlantModel, "plantModel");
                that._plantValueHelpDialog.open();
              },
              error: function () {
                sap.m.MessageToast.show("Failed to fetch plant data.");
              }
            });
          },
          
          onSelectPlant: function (oEvent) {
            var oSelectedItem = oEvent.getSource();
            var oContext = oSelectedItem.getBindingContext("plantModel");
          
            if (!oContext) {
              console.error("No binding context found for the selected plant");
              return;
            }
          
            var oPlant = oContext.getObject();
            if (oPlant) {
              var sPU_ID = oPlant.PU_ID;
              var sPlantName = oPlant.PLANTNAME;
          
              this.getView().byId("plantSearchInput").setValue(sPU_ID);
              this.selectedPlantID = sPU_ID;
          
              var oModel = this.getView().getModel("plantV2Model");
              oModel.setProperty("/selectedPlant", {
                PU_ID: sPU_ID,
                PLANTNAME: sPlantName
              });
          
              this._applyTableFilters();
            }
          
            this._plantValueHelpDialog.close();
          },
          
        
        onStateValueHelp: function () {
            var that = this; 
            this.selectedStateID = null;
        
            // Create value help dialog if it doesn't exist
            if (!this._stateValueHelpDialog) {
                this._stateValueHelpDialog = sap.ui.xmlfragment(
                    "com.productionplantdata.valuehelp.StateDialog",
                    this
                );
                this.getView().addDependent(this._stateValueHelpDialog);
            }
        
            // Fetch state data using the OData model
            var oModel = this.getView().getModel("plantV2Model");
            oModel.read("/plantcalviewS", {
                success: function (oData) {
                    var oUniqueStates = {};
                    oData.results.forEach(function (entry) {
                        if (!oUniqueStates[entry.S_ID]) {
                            oUniqueStates[entry.S_ID] = {
                                S_ID: entry.S_ID,
                                S_NAME: entry.S_NAME
                            };
                        }
                    });
        
                    // Convert the unique state map to an array
                    var aUniqueStates = Object.values(oUniqueStates);
        
                    // Set data to a JSON model
                    var oUniqueStateModel = new sap.ui.model.json.JSONModel();
                    oUniqueStateModel.setData({ states: aUniqueStates });
        
                    // Bind data to dialog
                    that._stateValueHelpDialog.setModel(oUniqueStateModel, "uniqueStateModel");
        
                    // Open dialog
                    that._stateValueHelpDialog.open();
                },
                error: function () {
                    sap.m.MessageToast.show("Failed to fetch state data.");
                }
            });
        },
        
      
        onSelectState: function (oEvent) { 
            var oSelectedItem = oEvent.getSource();
            var oContext = oSelectedItem.getBindingContext("uniqueStateModel");
        
            if (!oContext) {
                console.error("No binding context found for the selected item");
                return;
            }
        
            var oState = oContext.getObject();
            if (oState) {
                var sStateName = oState.S_NAME;
                var sStateID = oState.S_ID;
        
                this.getView().byId("stateInput").setValue(sStateName);
                this.selectedStateID = sStateID;
        
                var oModel = this.getView().getModel("plantV2Model");
                oModel.setProperty("/selectedState", {
                    S_ID: sStateID,
                    S_NAME: sStateName
                });
            }
        
            this._stateValueHelpDialog.close();
            this._applyTableFilters();
        },
        
        _applyTableFilters: function () {
            var aFilters = [];
        
            if (this.selectedCountryID) {
                aFilters.push(new sap.ui.model.Filter("C_ID", sap.ui.model.FilterOperator.EQ, this.selectedCountryID));
            }
        
            if (this.selectedStateID) {
                aFilters.push(new sap.ui.model.Filter("S_ID", sap.ui.model.FilterOperator.EQ, this.selectedStateID));
            }
        
            if (this.selectedPlantID && this.selectedPlantID !== "") {
                aFilters.push(new sap.ui.model.Filter("PU_ID", sap.ui.model.FilterOperator.EQ, this.selectedPlantID));
            }
        
            var oTable = this.getView().byId("plantTable");
            if (oTable) {
                var oBinding = oTable.getBinding("items");
                if (oBinding) {
                    oBinding.filter(aFilters); // AND by default
                }
            }
        },
        
        onCountryInputChange: function (oEvent) {
            var sValue = oEvent.getParameter("value").trim();
            if (!sValue) {
                this.selectedCountryID = null;
        
                var oModel = this.getView().getModel("plantV2Model");
                oModel.setProperty("/selectedCountry", {
                    C_ID: null,
                    C_NAME: ""
                });
        
                this._applyTableFilters(); // Refresh table
            }
        },
        
        onStateInputChange: function (oEvent) {
            var sValue = oEvent.getParameter("value").trim();
            if (!sValue) {
                this.selectedStateID = null;
        
                var oModel = this.getView().getModel("plantV2Model");
                oModel.setProperty("/selectedState", {
                    S_ID: null,
                    S_NAME: ""
                });
        
                this._applyTableFilters(); // Refresh table
            }
        },
        onPlantInputChange:function(oEvent){
            var sValue = oEvent.getParameter("value").trim();
            if (!sValue) {
                this.selectedPlantID = null;
        
                var oModel = this.getView().getModel("plantV2Model");
                oModel.setProperty("/selectedPlant", {
                    PU_ID: null,
                    PLANTNAME: ""
                });
        
                this._applyTableFilters(); // Refresh table
            }
        },
        
        onValueHelpDialogClose: function () {
            if (this._countryValueHelpDialog) {
                this._countryValueHelpDialog.close();
            }
            if (this._stateValueHelpDialog) {
                this._stateValueHelpDialog.close();
            }
        },
        onClosePlantDialog: function () {
            this._plantValueHelpDialog.close();
          },
          
          onCreate: function () {
            var that = this;
        
            // Get the selected Plant ID from the value help
            var sPlantID = this.selectedPlantID;
        
            if (!sPlantID) {
                sap.m.MessageToast.show("Please select a Plant ID first.");
                return;
            }
        
            var oModel = this.getView().getModel("plantV2Model");
        
            oModel.read("/PLANTS(" + sPlantID + ")", {
                success: function (oData) {
                    if (!that._pCreatePlantDialog) {
                        that._pCreatePlantDialog = Fragment.load({
                            id: "createDialog",
                            name: "com.productionplantdata.fragments.CreatePlantFragment",
                            controller: that
                        }).then(function (oDialog) {
                            that.getView().addDependent(oDialog);
                            return oDialog;
                        });
                    }
        
                    that._pCreatePlantDialog.then(function (oDialog) {
                        // Only prefill plant name and disable it
                        var oPlantNameInput = Fragment.byId("createDialog", "inputPlantName");
                        if (oPlantNameInput) {
                            oPlantNameInput.setValue(oData.plantName);
                            oPlantNameInput.setEnabled(false);
                        }
        
                        oDialog.open();
                    });
                },
                error: function () {
                    sap.m.MessageToast.show("Failed to load plant data.");
                }
            });
        },
        onButtonPress: function () {//---------onButtonPress functionality is chnageing the buttons from Add charactericts to save ------
            // Use Fragment.byId to reference the button inside the fragment
            var oAddButton = Fragment.byId("createDialog", "addBranchesButton");

            // Check if the button was found
            if (!oAddButton) {
                console.error("Button with id 'addBranchesButton' is not found.");
                return;
            }

            var sButtonText = oAddButton.getText();

            if (sButtonText === "Add Branches") {
                // Perform Add Characteristic logic
                this._showBranchForm();

                // Change the button text and icon to Save
                oAddButton.setText("Save");
                oAddButton.setIcon("sap-icon://save");

            } else if (sButtonText === "Save") {
                // Perform Save logic
                this._saveProductAndCharacteristics();

            }
        },
        
        _showBranchForm: function () {// --------Function to show the characteristic form when clciking the + icon -------
            var oVBox = Fragment.byId("createDialog", "branchesFormVBox");

            // Load the characteristic creation fragment if not already loaded
            if (!this._oCharacteristicCreateFragment) {
                this._oCharacteristicCreateFragment = sap.ui.xmlfragment(
                     "com.productionplantdata.fragments.BranchesCreateFreagmnet", this
                );
                oVBox.addItem(this._oCharacteristicCreateFragment);
            }

            // Make the VBox visible
            oVBox.setVisible(true);
            
        },
      
        onAddBranches: function () {
            if (!this.oFragment) {
                this.oFragment = sap.ui.xmlfragment("com.productionplantdata.fragments.SelectionPanelFragmnet", this);
                this.getView().addDependent(this.oFragment);
                this.oFragment.attachAfterOpen(this.loadData.bind(this));
            }
            this.oFragment.open();
        },
        
        loadData: function () {
            var oModel = this.getOwnerComponent().getModel("plantV2Model");
            oModel.read("/branchpanelview", {
                success: this.onDataLoaded.bind(this),
                error: function () {
                    MessageToast.show("Failed to load data");
                }
            });
        },
        
        onDataLoaded: function (oData) {
            const oVBox = sap.ui.getCore().byId("myVBox");
            if (!oVBox) {
                console.error("VBox not found in fragment!");
                return;
            }
        
            oVBox.removeAllItems();
        
            const aCleanData = this._transformData(oData.results);
        
            aCleanData.forEach(oCountry => {
                const oCountryPanel = new sap.m.Panel({
                    headerText: oCountry.C_NAME,
                    expandable: true,
                    expanded: false,
                    customData: [
                        new sap.ui.core.CustomData({
                            key: "c_id",
                            value: oCountry.C_ID
                        })
                    ],
                    expand: function (oCountryEvent) {
                        const oCountryPanel = oCountryEvent.getSource();
                        const isExpanded = oCountryEvent.getParameter("expand");
        
                        if (isExpanded && oCountryPanel.getContent().length === 0) {
                            const oStateVBox = new sap.m.VBox();
        
                            oCountry.nodes.forEach(oState => {
                                const oStatePanel = new sap.m.Panel({
                                    headerText: oState.S_NAME,
                                    expandable: true,
                                    expanded: false,
                                    customData: [
                                        new sap.ui.core.CustomData({
                                            key: "s_id",
                                            value: oState.S_ID
                                        })
                                    ],
                                    expand: function (oStateEvent) {
                                        const oStatePanel = oStateEvent.getSource();
                                        const isStateExpanded = oStateEvent.getParameter("expand");
        
                                        if (isStateExpanded && oStatePanel.getContent().length === 0) {
                                            const oPlantVBox = new sap.m.VBox();
        
                                            oState.nodes.forEach(oPlant => {
                                                const oPlantPanel = new sap.m.Panel({
                                                    headerText: oPlant.PLANTNAME,
                                                    expandable: true,
                                                    expanded: false,
                                                    customData: [
                                                        new sap.ui.core.CustomData({
                                                            key: "pu_id",
                                                            value: oPlant.PU_ID
                                                        })
                                                    ],
                                                    expand: function (oPlantEvent) {
                                                        const oPlantPanel = oPlantEvent.getSource();
                                                        const isPlantExpanded = oPlantEvent.getParameter("expand");
        
                                                        if (isPlantExpanded && oPlantPanel.getContent().length === 0) {
                                                            const oBranchVBox = new sap.m.VBox();
        
                                                            oPlant.nodes.forEach(oBranch => {
                                                                const oBranchPanel = new sap.m.Panel({
                                                                    headerText: oBranch.B_NAME,
                                                                    expandable: true,
                                                                    expanded: false,  customData: [
                                                                        new sap.ui.core.CustomData({
                                                                            key: "branchId",
                                                                            value: oBranch.B_ID
                                                                        })
                                                                    ],
                                                                    expand: function (oBranchEvent) {
                                                                        const oBranchPanel = oBranchEvent.getSource();
                                                                        const isBranchExpanded = oBranchEvent.getParameter("expand");
        
                                                                        if (isBranchExpanded && oBranchPanel.getContent().length === 0) {
                                                                            const oMaterialVBox = new sap.m.VBox();
        
                                                                            oBranch.nodes.forEach(oMaterial => {
                                                                                const oCheckbox = new sap.m.CheckBox({
                                                                                    text: oMaterial.M_NAME,
                                                                                    selected: false,
                                                                                    customData: [
                                                                                        new sap.ui.core.CustomData({
                                                                                            key: "m_id",
                                                                                            value: oMaterial.M_ID
                                                                                        })
                                                                                    ]
                                                                                });
                                                                                oMaterialVBox.addItem(oCheckbox);
                                                                            });
        
                                                                            oBranchPanel.addContent(oMaterialVBox);
                                                                        }
                                                                    }
                                                                });
                                                                oBranchVBox.addItem(oBranchPanel);
                                                            });
        
                                                            oPlantPanel.addContent(oBranchVBox);
                                                        }
                                                    }
                                                });
                                                oPlantVBox.addItem(oPlantPanel);
                                            });
        
                                            oStatePanel.addContent(oPlantVBox);
                                        }
                                    }
                                });
                                oStateVBox.addItem(oStatePanel);
                            });
        
                            oCountryPanel.addContent(oStateVBox);
                        }
                    }
                });
        
                oVBox.addItem(oCountryPanel);
            });
        
            this.oFragment.rerender();
        },
        
        _transformData: function (aResults) {
            const oCountryMap = {};
        
            aResults.forEach(item => {
                if (!item.C_ID || !item.C_NAME) return;
        
                if (!oCountryMap[item.C_ID]) {
                    oCountryMap[item.C_ID] = {
                        C_ID: item.C_ID,
                        C_NAME: item.C_NAME,
                        nodes: []
                    };
                }
        
                const oCountry = oCountryMap[item.C_ID];
        
                if (!item.S_ID || !item.S_NAME) return;
        
                let oState = oCountry.nodes.find(s => s.S_ID === item.S_ID);
                if (!oState) {
                    oState = {
                        S_ID: item.S_ID,
                        S_NAME: item.S_NAME,
                        nodes: []
                    };
                    oCountry.nodes.push(oState);
                }
        
                if (!item.PU_ID || !item.PLANTNAME) return;
        
                let oPlant = oState.nodes.find(p => p.PU_ID === item.PU_ID);
                if (!oPlant) {
                    oPlant = {
                        PU_ID: item.PU_ID,
                        PLANTNAME: item.PLANTNAME,
                        nodes: []
                    };
                    oState.nodes.push(oPlant);
                }
        
                if (!item.B_ID || !item.B_NAME) return;
        
                let oBranch = oPlant.nodes.find(b => b.B_ID === item.B_ID);
                if (!oBranch) {
                    oBranch = {
                        B_ID: item.B_ID,
                        B_NAME: item.B_NAME,
                        nodes: []
                    };
                    oPlant.nodes.push(oBranch);
                }
        
                if (item.M_ID && item.M_NAME) {
                    oBranch.nodes.push({
                        M_ID: item.M_ID,
                        M_NAME: item.M_NAME
                    });
                }
            });
        
            return Object.values(oCountryMap);
        },
        
        
    //     onSubmitBranchVal: function () {
    //         const oVBox = sap.ui.getCore().byId("myVBox");
    //         if (!oVBox) {
    //             console.error("VBox not found!");
    //             return;
    //         }
        
    //         const aSelectedBranches = []; // Array to store selected branches
    //         const oBranchIdSet = new Set(); // Set to avoid duplicate branches
        
    //         // Traverse Country > State > Plant > Branch Panels
    //         oVBox.getItems().forEach(oCountryPanel => {
    //             oCountryPanel.getContent().forEach(oStateVBox => {
    //                 oStateVBox.getItems().forEach(oStatePanel => {
    //                     oStatePanel.getContent().forEach(oPlantVBox => {
    //                         oPlantVBox.getItems().forEach(oPlantPanel => {
    //                             oPlantPanel.getContent().forEach(oBranchVBox => {
    //                                 oBranchVBox.getItems().forEach(oBranchPanel => {
    //                                     const branchId = oBranchPanel.data("branchId");
    //                                     const branchName = oBranchPanel.getHeaderText();
    //                                     let materialSelected = false;
        
    //                                     oBranchPanel.getContent().forEach(oMaterialVBox => {
    //                                         oMaterialVBox.getItems().forEach(oCheckbox => {
    //                                             if (oCheckbox.getSelected()) {
    //                                                 materialSelected = true;
    //                                             }
    //                                         });
    //                                     });
        
    //                                     // If any material is selected under the branch, add the branch
    //                                     if (materialSelected && !oBranchIdSet.has(branchId)) {
    //                                         aSelectedBranches.push({
    //                                             B_ID: branchId,
    //                                             B_Name: branchName
    //                                         });
    //                                         oBranchIdSet.add(branchId);
    //                                     }
    //                                 });
    //                             });
    //                         });
    //                     });
    //                 });
    //             });
    //         });
        
    //         if (aSelectedBranches.length === 0) {
    //             MessageToast.show("Please select at least one material.");
    //             return;
    //         }
        
    //         // Bind selected branches to the table in another fragment
    //         const oBranchTable = sap.ui.getCore().byId("branchTable"); // Make sure 'branchTable' is the ID inside the fragment
    //         if (oBranchTable) {
    //             const oExistingModel = oBranchTable.getModel("selectedBranchModel");
    //             let aExistingBranches = oExistingModel ? oExistingModel.getData() : [];
        
    //             // Add only new branches to avoid duplicates
    //             aSelectedBranches.forEach(oNewBranch => {
    //                 const exists = aExistingBranches.some(
    //                     oExisting => oExisting.B_ID === oNewBranch.B_ID
    //                 );
    //                 if (!exists) {
    //                     aExistingBranches.push(oNewBranch);
    //                 }
    //             });
    //               // Log to console
    // console.log("Selected Branch Data:", JSON.stringify(aExistingBranches, null, 2));
    //             const oModel = new sap.ui.model.json.JSONModel(aExistingBranches);
    //             oBranchTable.setModel(oModel, "selectedBranchModel");
               
    //         }
        
    //         // Close the material selection dialog
    //         if (this.oFragment) {
    //             this.oFragment.close();
    //         }
            
    //     }
        
    onSubmitBranchVal: function () {
        const oVBox = sap.ui.getCore().byId("myVBox");
        if (!oVBox) {
            console.error("VBox not found!");
            return;
        }
    
        const aSelectedBranches = [];
        const oBranchMaterialSet = new Set(); // To avoid duplicate (B_ID + M_ID)
    
        oVBox.getItems().forEach(oCountryPanel => {
            const cId = oCountryPanel.data("c_id");
            const cName = oCountryPanel.getHeaderText();
    
            oCountryPanel.getContent().forEach(oStateVBox => {
                oStateVBox.getItems().forEach(oStatePanel => {
                    const sId = oStatePanel.data("s_id");
                    const sName = oStatePanel.getHeaderText();
    
                    oStatePanel.getContent().forEach(oPlantVBox => {
                        oPlantVBox.getItems().forEach(oPlantPanel => {
                            const puId = oPlantPanel.data("pu_id");
                            const plantName = oPlantPanel.getHeaderText();
    
                            oPlantPanel.getContent().forEach(oBranchVBox => {
                                oBranchVBox.getItems().forEach(oBranchPanel => {
                                    const bId = oBranchPanel.data("branchId");
                                    const bName = oBranchPanel.getHeaderText();
    
                                    oBranchPanel.getContent().forEach(oMaterialVBox => {
                                        oMaterialVBox.getItems().forEach(oCheckbox => {
                                            if (oCheckbox.getSelected()) {
                                                const mId = oCheckbox.data("m_id");
                                                const mName = oCheckbox.getText();
                                                const uniqueKey = `${bId}_${mId}`;
    
                                                if (!oBranchMaterialSet.has(uniqueKey)) {
                                                    aSelectedBranches.push({
                                                        C_ID: cId,
                                                        C_NAME: cName,
                                                        S_ID: sId,
                                                        S_NAME: sName,
                                                        PU_ID: puId,
                                                        PLANTNAME: plantName,
                                                        B_ID: bId,
                                                        B_NAME: bName,
                                                        M_ID: mId,
                                                        M_NAME: mName
                                                    });
                                                    oBranchMaterialSet.add(uniqueKey);
                                                }
                                            }
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    
        if (aSelectedBranches.length === 0) {
            MessageToast.show("Please select at least one material.");
            return;
        }
    
        const oBranchTable = sap.ui.getCore().byId("branchTable");
        if (oBranchTable) {
            const oExistingModel = oBranchTable.getModel("selectedBranchModel");
            let aExistingBranches = oExistingModel ? oExistingModel.getData() : [];
    
            const aTableBranchIds = aExistingBranches.map(b => b.B_ID);
    
            aSelectedBranches.forEach(oNewBranch => {
                const bId = oNewBranch.B_ID;
                const mId = oNewBranch.M_ID;
                const mName = oNewBranch.M_NAME;
                const bName = oNewBranch.B_NAME;
    
                const branchAlreadyExists = aTableBranchIds.includes(bId);
                const materialAlreadyExists = aExistingBranches.some(entry => entry.B_ID === bId && entry.M_ID === mId);
    
                if (materialAlreadyExists) {
                    MessageToast.show(`Material '${mName}' (M_ID: ${mId}) is already added to Branch '${bName}' (B_ID: ${bId}).`);
                } else if (branchAlreadyExists) {
                    MessageToast.show(`Material '${mName}' (M_ID: ${mId}) is added to existing Branch '${bName}' (B_ID: ${bId}).`);
                    // Don't add to table, just notify
                } else {
                    // First time this B_ID is being added → show in table
                    aExistingBranches.push(oNewBranch);
                }
            });
    
            const oModel = new sap.ui.model.json.JSONModel(aExistingBranches);
            oBranchTable.setModel(oModel, "selectedBranchModel");
        }
    
        if (this.oFragment) {
            this.oFragment.close();
        }
    },


    _saveProductAndCharacteristics: async function () {
        const oModel = this.getView().getModel("plantV2Model"); // ODataModel v2
        const oCore = sap.ui.getCore();
    
        // Collect input values
        const oPayload = {
            plantName: oCore.byId("inputPlantName").getValue(),
            address: oCore.byId("inputAddress").getValue(),
            email: oCore.byId("inputEmail").getValue(),
            contactNum: oCore.byId("inputContactNum").getValue(),
            areaSize: oCore.byId("inputAreaSize").getValue(),
            capacity: oCore.byId("inputCapacity").getValue(),
            monthlyTurnover: oCore.byId("inputTurnover").getValue(),
            totalEmployees: oCore.byId("inputTotalEmployees").getValue(),
            plantDescr: oCore.byId("inputPlantDescr").getValue(),
            salesHead: oCore.byId("inputSalesHead").getValue(),
            establishedYear: parseInt(oCore.byId("inputEstablishedYear").getValue()),
            mostSelling: oCore.byId("inputMostSelling").getValue(),
            lowestSelling: oCore.byId("inputLowestSelling").getValue(),
            operationalStatus: oCore.byId("switchOperational").getValue().toLowerCase() === "true",
            state_S_ID: this._getSelectedStateID() // Assuming you implement this method to fetch state ID from selected branch
        };
    
        // 1. Create Plant Entity
        try {
            const oResponse = await new Promise((resolve, reject) => {
                oModel.create("/PLANTS", oPayload, {
                    success: resolve,
                    error: reject
                });
            });
    
            const puId = oResponse.PU_ID; // Auto-generated Plant ID
    
            // 2. Save BranchPlant and BranchMaterial
            this._saveBranchAndMaterials(puId);
    
            MessageToast.show("Plant and related data saved successfully!");
            oCore.byId("createDialog").close();
    
        } catch (err) {
            MessageBox.error("Error saving plant: " + err.message);
        }
    },
    
    _saveBranchAndMaterials: async function (puId) {
        const oModel = this.getView().getModel("mainService");
        const oTable = sap.ui.getCore().byId("branchTable");
        const aBranchData = oTable.getModel("selectedBranchModel").getData();
    
        const aBranchPlantPayloads = new Set();
        const aBranchMaterialPayloads = [];
    
        for (const oBranch of aBranchData) {
            // Step 2.1: Save to BRANCHPLANT
            const branchKey = `${oBranch.B_ID}_${puId}`;
            if (!aBranchPlantPayloads.has(branchKey)) {
                aBranchPlantPayloads.add(branchKey);
                try {
                    await new Promise((resolve, reject) => {
                        oModel.create("/BRANCHPLANT", {
                            "branch_B_ID": oBranch.B_ID,
                            "plant_PU_ID": puId
                        }, {
                            success: resolve,
                            error: reject
                        });
                    });
                } catch (err) {
                    console.error("Failed to create BRANCHPLANT:", err);
                }
            }
    
            // Step 2.2: Save to BRANCHMATERIAL (after checking for duplicates)
            const bId = oBranch.B_ID;
            const mId = oBranch.M_ID;
    
            const exists = await new Promise((resolve) => {
                oModel.read(`/BRANCHMATERIAL(branch_B_ID='${bId}',material_M_ID='${mId}')`, {
                    success: () => resolve(true),
                    error: () => resolve(false)
                });
            });
    
            if (!exists) {
                try {
                    await new Promise((resolve, reject) => {
                        oModel.create("/BRANCHMATERIAL", {
                            "branch_B_ID": bId,
                            "material_M_ID": mId
                        }, {
                            success: resolve,
                            error: reject
                        });
                    });
                } catch (err) {
                    console.error("Failed to create BRANCHMATERIAL:", err);
                }
            } else {
                MessageToast.show(`Material '${oBranch.M_NAME}' already exists for Branch '${oBranch.B_NAME}'`);
            }
        }
    },
    _getSelectedStateID: function () {
        const oBranchTable = sap.ui.getCore().byId("branchTable");
        const aData = oBranchTable.getModel("selectedBranchModel").getData();
        return aData.length > 0 ? aData[0].S_ID : null;
    }
    
    
        
        
        
    });
});