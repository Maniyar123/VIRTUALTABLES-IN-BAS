sap.ui.define([
  "sap/f/library",
  "sap/m/SplitContainer",
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/mvc/XMLView"
], (fioriLibrary, SplitContainer, Controller, XMLView) => {
  "use strict";
  var LayoutType = fioriLibrary.LayoutType;
  return Controller.extend("com.productionplantdata.controller.App", {
      onInit() {
        this.bus = this.getOwnerComponent().getEventBus();
        this.bus.subscribe("flexible", "setDetailPage", this.setDetailPage, this);
        this.bus.subscribe("flexible", "setDetailDetailPage", this.setDetailDetailPage, this);
  
        this.oFlexibleColumnLayout = this.byId("fcl");
      },
      onExit: function () {
        this.bus.unsubscribe("flexible", "setDetailPage", this.setDetailPage, this);
        this.bus.unsubscribe("flexible", "setDetailDetailPage", this.setDetailDetailPage, this);
      },
      setDetailPage: function () {
        this._loadView({
          id: "midView",
          viewName: "com.productionplantdata.view.DetailView"
        }).then(function (detailView) {
          this.oFlexibleColumnLayout.addMidColumnPage(detailView);
          this.oFlexibleColumnLayout.setLayout(LayoutType.TwoColumnsMidExpanded);
        }.bind(this));
      },
      // Lazy loader for the end page - only on demand (when the user clicks)
    setDetailDetailPage: function () {
     
      this._loadView({
        id: "endView",
        viewName: "com.productionplantdata.view.DetailDetailView"
      }).then(function (detailDetailView) {
        this.oFlexibleColumnLayout.addEndColumnPage(detailDetailView);
        this.oFlexibleColumnLayout.setLayout(LayoutType.ThreeColumnsEndExpanded);
      }.bind(this));
    },
      _loadView: function (options) {
        var mViews = this._mViews = this._mViews || Object.create(null);
        if (!mViews[options.id]) {
          mViews[options.id] = this.getOwnerComponent().runAsOwner(function () {
            return XMLView.create(options);
          });
        }
        return mViews[options.id];
      }
  });
});