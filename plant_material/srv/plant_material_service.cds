using { plant_material } from '../db/plant_material_data_model';
using { PLANTCALVIEW } from '../db/plant_material_data_model';
using { BRANCHPLANTCALVIEW } from '../db/plant_material_data_model';

using { BRANCHMATERIALCALVIEW } from '../db/plant_material_data_model';
 using { BRANCHPANELVIEW } from '../db/plant_material_data_model';




service CatlogService1 {

    entity COUNTRIES as projection on plant_material.County;
    entity STATES    as projection on plant_material.State;
    entity Branches  as projection on plant_material.Branch;
    entity PLANTS    as projection on plant_material.Plant;
    entity MATERIALS as projection on plant_material.Material;
   entity BRANCHMATERIAL as projection on plant_material.BranchMaterial;
   entity BRANCHPLANT as projection on plant_material.BranchPlantLink;
   entity branchplantcalview as projection on BRANCHPLANTCALVIEW;
   entity plantcalviewS as projection on PLANTCALVIEW;
 entity branchmaterialcalview as projection on BRANCHMATERIALCALVIEW;
  entity branchpanelview as projection on BRANCHPANELVIEW;
}
