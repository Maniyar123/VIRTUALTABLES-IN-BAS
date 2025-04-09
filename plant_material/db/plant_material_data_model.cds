// namespace plant_material;
 context plant_material {
  

entity County {
  key C_ID   : String; // Unique ID (e.g., "C001")
  C_Name     : String;
  states     : Composition of many State on states.county = $self;
}

entity State {
  key S_ID   : String; // Unique ID (e.g., "S001")
  S_Name     : String;
  county     : Association to County;
  plants     : Composition of many Plant on plants.state = $self;
}

entity Plant {
  key PU_ID   : Integer; // Numeric ID (e.g., 101, 102)
 
   plantName        : String;
  plantDescr       : String;
  mostSelling      : String;   // Most selling product
  lowestSelling    : String;   // Lowest selling product
  monthlyTurnover  : Decimal(15,2); // Monthly turnover in currency format
  contactNum       : String;   // Contact number for the plant
  salesHead        : String;   // Sales head name
  establishedYear  : Integer;  // Year when the plant was established
  totalEmployees   : Integer;  // Total number of employees
  capacity         : Decimal(10,2); // Production capacity in units
  areaSize         : Decimal(10,2); // Size of the plant in square meters
  address          : String;   // Address of the plant
  operationalStatus: Boolean;  // Whether the plant is active or not
  email           : String;    // Email for business inquiries
  state       : Association to State;
  // branches    : Composition of many Branch on branches.plant = $self;
  branchLinks      : Association to many BranchPlantLink on branchLinks.plant = $self;
}

entity Branch {
  key B_ID    : String;  // Unique Branch ID (e.g., "B001")
  B_Name      : String;
  // plant       : Association to Plant;
  materials   : Composition of many BranchMaterial on materials.branch = $self;
}
entity BranchPlantLink {
  key branch      : Association to Branch;
  key plant       : Association to Plant;
}


entity Material {
 key M_ID          : String;   // Unique Material ID (e.g., "M001")
  m_name           : String;   // Material name
  m_desc           : String;   // Material description
  m_price          : Decimal(10,2); // Material price
  m_quantity       : Integer;  // Available quantity
  m_capacity       : Decimal(10,2); // Maximum storage capacity
  sellingPoint     : String;   // Best-selling location
  costManagement   : String;   // Cost-related strategies
  materialStatus   : String;   // Example: "Available", "Out of Stock", "Discontinued"
  manufacturer     : String;   // Manufacturer name
  warrantyPeriod   : Integer;  // Warranty in months
  weight           : Decimal(10,2); // Weight in kg
  productionDate   : Date;     // Date when the material was produced
  expiryDate       : Date;     // Expiry date if applicable
  storageCondition : String;   // Example: "Dry place, No direct sunlight"
  materialType     : String;   // Example: "Electronics", "Cooling System"
  recyclable       : Boolean;  // Whether the material is recyclable
  usage           : String;    // Purpose of the material
  supplier        : String;    // Supplier name
}

entity BranchMaterial {
  key branch  : Association to Branch;
  key material: Association to Material;
}
}



@cds.persistence.exists
@cds.persistence.table
entity BRANCHPLANTCALVIEW{
   key B_ID:String;
   B_NAME:String;
   PLANT_PU_ID:Integer;
}
@cds.persistence.exists
@cds.persistence.table
entity PLANTCALVIEW{
  key PU_ID:Integer;
  PLANTNAME:String;
  PLANTDESCR:String;
  key S_ID:String;
  S_NAME:String;
  key C_ID:String;
  C_NAME:String;
  OPERATIONALSTATUS:Boolean;
  MOSTSELLING:String;
  LOWESTSELLING:String;
  MONTHLYTURNOVER:Decimal(10,2);
  CONTACTNUM:String;
  SALESHEAD:String;
  ESTABLISHEDYEAR:Integer;
  TOTALEMPLOYEES:Integer;
  CAPACITY:Decimal(10,2); 
  AREASIZE:Decimal(10,2); 
  ADDRESS:String;
  EMAIL:String
}
@cds.persistence.exists
@cds.persistence.table
entity BRANCHMATERIALCALVIEW{
  B_ID:String;
  B_NAME:String;
  key M_ID:String;
  M_NAME:String;
  M_DESC:String;
  SELLINGPOINT:String;
  COSTMANAGEMENT:String;
  MATERIALSTATUS:String;
  MANUFACTURER:String;
  PRODUCTIONDATE:Date;
  EXPIRYDATE:Date;
  STORAGECONDITION:String;
  MATERIALTYPE:String;
  RECYCLABLE:Boolean;
  USAGE:String;
  SUPPLIER:String;
  PLANT_PU_ID:Integer;
  M_PRICE:Decimal(10,2); 
  M_QUANTITY:Integer;
  M_CAPACITY:Decimal(10,2);
  WARRANTYPERIOD:Integer;
  WEIGHT:Decimal(10,2);
}
@cds.persistence.exists
@cds.persistence.table
entity BRANCHPANELVIEW{
  C_ID:String;
  C_NAME:String;
   S_ID:String;
  S_NAME:String;
  PU_ID:Integer;
  PLANTNAME:String;
  B_ID:String;
  B_NAME:String;
  key M_ID:String;
  M_NAME:String;
}