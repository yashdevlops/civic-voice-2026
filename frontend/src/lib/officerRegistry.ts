import { MunicipalDeptCode } from './grievance';

export interface FieldCrewUnit {
  id: string;
  unitCode: string;
  name: string;
  specialization: string;
  teamLead: string;
  crewSize: number;
  contact: string;
  equipment: string;
  status: 'AVAILABLE' | 'ON_FIELD' | 'STANDBY';
}

export interface DepartmentLeadEngineer {
  id: string;
  name: string;
  designation: string;
  officialId: string;
  departmentCode: MunicipalDeptCode;
  email: string;
  contact: string;
  officeLocation: string;
}

export interface DepartmentHierarchy {
  departmentCode: MunicipalDeptCode;
  departmentName: string;
  leadEngineer: DepartmentLeadEngineer;
  crews: FieldCrewUnit[];
}

export const MUNICIPAL_DEPARTMENT_REGISTRY: Record<MunicipalDeptCode, DepartmentHierarchy> = {
  roads_potholes: {
    departmentCode: 'roads_potholes',
    departmentName: 'BMC Directorate of Roads & Civil Infrastructure',
    leadEngineer: {
      id: 'ENG-RD-01',
      name: 'Er. Alok Sharma',
      designation: 'Assistant Executive Engineer (Civil Infrastructure)',
      officialId: 'BMC-ENG-701',
      departmentCode: 'roads_potholes',
      email: 'aee.roads@bmc.gov.in',
      contact: '+91 94370 12001',
      officeLocation: 'BMC Division 1, Sahid Nagar'
    },
    crews: [
      {
        id: 'CRW-RD-01',
        unitCode: 'RD-RAPID-01',
        name: 'Road Rapid Patchwork Unit 1',
        specialization: 'Hot-Mix Asphalt & Emergency Pothole Filling',
        teamLead: 'Debashis Nayak (Senior Road Mason)',
        crewSize: 6,
        contact: '+91 94370 12011',
        equipment: 'Mobile Asphalt Mixer, Compactor Roller, Road Cutter',
        status: 'AVAILABLE'
      },
      {
        id: 'CRW-RD-02',
        unitCode: 'RD-JET-02',
        name: 'Jet-Patcher Mechanical Unit 2',
        specialization: 'High-Velocity Emulsion Injection & Crack Sealing',
        teamLead: 'Ranjan Mahapatra (Operator Lead)',
        crewSize: 4,
        contact: '+91 94370 12012',
        equipment: 'Automated Velocity Jet Patcher Truck',
        status: 'AVAILABLE'
      },
      {
        id: 'CRW-RD-03',
        unitCode: 'RD-PAVE-03',
        name: 'Pedestrian & Paver Block Squad 3',
        specialization: 'Sidewalks, Kerb Stones & Footpath Realignment',
        teamLead: 'Pradeep Jena (Mason Lead)',
        crewSize: 5,
        contact: '+91 94370 12013',
        equipment: 'Stone Cutting Bench, Vibratory Plate Compactor',
        status: 'AVAILABLE'
      },
      {
        id: 'CRW-RD-04',
        unitCode: 'RD-RESURF-04',
        name: 'Heavy Resurfacing & Milling Unit 4',
        specialization: 'Large-Scale Arterial Road Overlay & Milling',
        teamLead: 'Tapan Das (Site Foreman)',
        crewSize: 8,
        contact: '+91 94370 12014',
        equipment: 'Cold Milling Machine, Paver Finisher, Tandem Roller',
        status: 'STANDBY'
      },
      {
        id: 'CRW-RD-05',
        unitCode: 'RD-STRUCT-05',
        name: 'Bridge & Divider Structural Squad 5',
        specialization: 'Concrete Medians, Guardrails & Culvert Repairs',
        teamLead: 'Bikram Keshari Sahoo (Structural Lead)',
        crewSize: 6,
        contact: '+91 94370 12015',
        equipment: 'Concrete Breaker, Rebar Bender, Hydro-Cutter',
        status: 'AVAILABLE'
      }
    ]
  },

  water_supply: {
    departmentCode: 'water_supply',
    departmentName: 'BMC Water Works & Sewerage Management Directorate',
    leadEngineer: {
      id: 'ENG-WS-01',
      name: 'Er. Smruti Snigdha Rout',
      designation: 'Executive Engineer (Water Supply & Drainage)',
      officialId: 'BMC-WAT-802',
      departmentCode: 'water_supply',
      email: 'ee.water@bmc.gov.in',
      contact: '+91 94370 22001',
      officeLocation: 'BMC Public Health Office, Unit 2'
    },
    crews: [
      {
        id: 'CRW-WS-01',
        unitCode: 'WS-BURST-01',
        name: 'Mainline Pipeline Burst Emergency Squad 1',
        specialization: 'High-Pressure Cast Iron & HDPE Pipeline Welding',
        teamLead: 'Subhashish Behera (Master Plumber)',
        crewSize: 5,
        contact: '+91 94370 22011',
        equipment: 'Butt-Fusion Welding Unit, Dewatering Pump, Trench Shield',
        status: 'AVAILABLE'
      },
      {
        id: 'CRW-WS-02',
        unitCode: 'WS-SUCKER-02',
        name: 'Super-Sucker & Hydro-Jetting Unit 2',
        specialization: 'Underground Sewer Line De-silting & High-Pressure Jetting',
        teamLead: 'Kishore Samal (Heavy Fleet Operator)',
        crewSize: 4,
        contact: '+91 94370 22012',
        equipment: '10,000L Super Sucker Tanker, Hydraulic Jetting Hose',
        status: 'AVAILABLE'
      },
      {
        id: 'CRW-WS-03',
        unitCode: 'WS-CONTAM-03',
        name: 'Drinking Water Contamination Taskforce 3',
        specialization: 'Chlorination, Quality Testing & Cross-Contamination Tracing',
        teamLead: 'Dr. Ananya Mishra (Quality Chemist Lead)',
        crewSize: 3,
        contact: '+91 94370 22013',
        equipment: 'Digital Turbidity & pH Analyzer, Mobile Chlorination Dosing Kit',
        status: 'AVAILABLE'
      },
      {
        id: 'CRW-WS-04',
        unitCode: 'WS-DRAIN-04',
        name: 'Stormwater Open Drain Desilting Unit 4',
        specialization: 'Heavy Monsoon Channel Clearance & Silt Evacuation',
        teamLead: 'Santosh Dalai (Drainage Foreman)',
        crewSize: 7,
        contact: '+91 94370 22014',
        equipment: 'Mini Tracked Excavator, Sludge Carrier Trucks',
        status: 'AVAILABLE'
      },
      {
        id: 'CRW-WS-05',
        unitCode: 'WS-TANKER-05',
        name: 'Emergency Relief Mobile Tanker Fleet 5',
        specialization: 'Potable Drinking Water Logistics for Scarcity Areas',
        teamLead: 'Prakash Mohanty (Logistics Supervisor)',
        crewSize: 6,
        contact: '+91 94370 22015',
        equipment: '6x Stainless Steel 6000L Potable Water Tankers',
        status: 'AVAILABLE'
      }
    ]
  },

  cleanliness: {
    departmentCode: 'cleanliness',
    departmentName: 'BMC Solid Waste Management & Sanitation Wing',
    leadEngineer: {
      id: 'ENG-CL-01',
      name: 'Er. Manoj Kumar Nayak',
      designation: 'Chief Sanitary Inspector / Environmental Engineer',
      officialId: 'BMC-SAN-903',
      departmentCode: 'cleanliness',
      email: 'csi.sanitation@bmc.gov.in',
      contact: '+91 94370 32001',
      officeLocation: 'BMC Sanitation Headquarters, Old Town'
    },
    crews: [
      {
        id: 'CRW-CL-01',
        unitCode: 'CL-CLEAR-01',
        name: 'Secondary Dump Rapid Clearance Squad 1',
        specialization: 'Heavy Garbage Spot Clearance & Compactor Evacuation',
        teamLead: 'Bimal Senapati (Sanitary Supervisor)',
        crewSize: 8,
        contact: '+91 94370 32011',
        equipment: 'Hydraulic Refuse Compactor, Front-End Skid Loader',
        status: 'AVAILABLE'
      },
      {
        id: 'CRW-CL-02',
        unitCode: 'CL-VECTOR-02',
        name: 'Anti-Larval & Thermal Fogging Unit 2',
        specialization: 'Mosquito Breeding Neutralization & Chemical Fogging',
        teamLead: 'Ramesh Chhotray (Vector Control Lead)',
        crewSize: 5,
        contact: '+91 94370 32012',
        equipment: 'Vehicle-Mounted Pulse-Jet Fogger, Knapsack Sprayers',
        status: 'AVAILABLE'
      },
      {
        id: 'CRW-CL-03',
        unitCode: 'CL-NIGHT-03',
        name: 'Commercial Market Night Sweeping Squad 3',
        specialization: 'Deep Street Washing, Disinfection & Market Sanitization',
        teamLead: 'Sarat Chandra Barik (Night Shift Head)',
        crewSize: 10,
        contact: '+91 94370 32013',
        equipment: 'Mechanical Road Sweeper Truck, Pressure Washer',
        status: 'AVAILABLE'
      },
      {
        id: 'CRW-CL-04',
        unitCode: 'CL-HAZARD-04',
        name: 'Bio-Medical & Hazardous Waste Squad 4',
        specialization: 'Safe Medical Litter, Carcass & Dangerous Waste Removal',
        teamLead: 'Dr. G. C. Pradhan (Health Safety Officer)',
        crewSize: 4,
        contact: '+91 94370 32014',
        equipment: 'Bio-Hazard Sealed Transport Van, PPE & Autoclave Containers',
        status: 'AVAILABLE'
      },
      {
        id: 'CRW-CL-05',
        unitCode: 'CL-MICRO-05',
        name: 'Micro-Composting & Segregation Support Unit 5',
        specialization: 'Wet Waste MCC Processing & Illegal Dumping Surveillance',
        teamLead: 'Namita Parida (MCC Field Lead)',
        crewSize: 6,
        contact: '+91 94370 32015',
        equipment: 'Waste Shredder, Electric Battery Vehicles (BOV)',
        status: 'AVAILABLE'
      }
    ]
  },

  street_lights: {
    departmentCode: 'street_lights',
    departmentName: 'BMC Electrical & Public Illumination Wing',
    leadEngineer: {
      id: 'ENG-SL-01',
      name: 'Er. Deepak Mohapatra',
      designation: 'Assistant Executive Engineer (Electrical Systems)',
      officialId: 'BMC-ELE-404',
      departmentCode: 'street_lights',
      email: 'aee.electrical@bmc.gov.in',
      contact: '+91 94370 42001',
      officeLocation: 'BMC Central Electrical Depot, Rasulgarh'
    },
    crews: [
      {
        id: 'CRW-SL-01',
        unitCode: 'SL-BUCKET-01',
        name: 'Hydraulic Bucket Crane High-Mast Unit 1',
        specialization: 'High-Mast Tower Lights & Arterial Pole Maintenance',
        teamLead: 'Sanjaya Mohanty (Senior Linesman)',
        crewSize: 4,
        contact: '+91 94370 42011',
        equipment: '18-Meter Insulated Telescopic Aerial Bucket Crane',
        status: 'AVAILABLE'
      },
      {
        id: 'CRW-SL-02',
        unitCode: 'SL-SMART-02',
        name: 'LED Smart Lighting & Luminaire Squad 2',
        specialization: 'Ward-Level LED Fixture Replacement & CCMS Troubleshooting',
        teamLead: 'Trilochan Sethi (Lighting Tech Lead)',
        crewSize: 3,
        contact: '+91 94370 42012',
        equipment: 'Digital Lux Meter, 50x 40W/90W Philips LED Luminaires',
        status: 'AVAILABLE'
      },
      {
        id: 'CRW-SL-03',
        unitCode: 'SL-CABLE-03',
        name: 'Underground Cable Fault Diagnostic Taskforce 3',
        specialization: 'Buried Armoured Cable Short-Circuit & Earth Fault Thumping',
        teamLead: 'Prasant Pattnaik (Cable Testing Specialist)',
        crewSize: 4,
        contact: '+91 94370 42013',
        equipment: 'Acoustic Cable Fault Locator & Megger Insulation Tester',
        status: 'AVAILABLE'
      },
      {
        id: 'CRW-SL-04',
        unitCode: 'SL-PILLAR-04',
        name: 'Feeder Pillar & Automated Timer Calibration Unit 4',
        specialization: 'Three-Phase Distribution Panels, Relays & Contactors',
        teamLead: 'Basanta Kar (Switchgear Tech)',
        crewSize: 3,
        contact: '+91 94370 42014',
        equipment: 'Automatic Astronomical Timer Kits, Current Clamp Testers',
        status: 'AVAILABLE'
      },
      {
        id: 'CRW-SL-05',
        unitCode: 'SL-SOLAR-05',
        name: 'Solar Streetlight & LiFePO4 Battery Squad 5',
        specialization: 'Off-Grid Solar Streetlights, Inverters & PV Panel Cleaning',
        teamLead: 'Abhinash Rout (Solar Systems Tech)',
        crewSize: 4,
        contact: '+91 94370 42015',
        equipment: 'Solar Panel Efficiency Tester, Battery Conditioning Unit',
        status: 'AVAILABLE'
      }
    ]
  },

  public_safety: {
    departmentCode: 'public_safety',
    departmentName: 'BMC Public Safety, Disaster Cell & Enforcement Wing',
    leadEngineer: {
      id: 'ENG-PS-01',
      name: 'Er. Rajesh Kumar Jena',
      designation: 'Chief Enforcement Officer & Disaster Mitigation Head',
      officialId: 'BMC-ENF-505',
      departmentCode: 'public_safety',
      email: 'enf.safety@bmc.gov.in',
      contact: '+91 94370 52001',
      officeLocation: 'BMC Enforcement Directorate, Kalpana Square'
    },
    crews: [
      {
        id: 'CRW-PS-01',
        unitCode: 'PS-ENCROACH-01',
        name: 'Anti-Encroachment & Demolition Taskforce 1',
        specialization: 'Public Footpath Reclamation & Illegal Construction Removal',
        teamLead: 'Inspector D. K. Patnaik (Enforcement Officer)',
        crewSize: 12,
        contact: '+91 94370 52011',
        equipment: 'JCB 3DX Backhoe Loader, Hydraulic Breakers, Tow Trucks',
        status: 'AVAILABLE'
      },
      {
        id: 'CRW-PS-02',
        unitCode: 'PS-CATTLE-02',
        name: 'Stray Cattle & Animal Control Squad 2',
        specialization: 'Urban Bovine Catching, Relocation to Kanjia House & Rabies Control',
        teamLead: 'Bhagaban Das (Senior Cattle Handler)',
        crewSize: 6,
        contact: '+91 94370 52012',
        equipment: 'Hydraulic Cattle Catcher Truck, Animal Restraint Nets',
        status: 'AVAILABLE'
      },
      {
        id: 'CRW-PS-03',
        unitCode: 'PS-STRUCT-03',
        name: 'Hazardous Structure Safety & Evacuation Squad 3',
        specialization: 'Dilapidated Wall Demolition & Emergency Structural Shoring',
        teamLead: 'Er. Bhabani Shankar Dash (Safety Inspector)',
        crewSize: 7,
        contact: '+91 94370 52013',
        equipment: 'Heavy-Duty Hydraulic Props, Acoustic Laser Rangefinders',
        status: 'AVAILABLE'
      },
      {
        id: 'CRW-PS-04',
        unitCode: 'PS-DISASTER-04',
        name: 'Monsoon Inundation & Disaster Response Unit 4',
        specialization: 'Urban Flash Flood Relief, Evacuation & Tree Fall Clearance',
        teamLead: 'Commander S. K. Murmu (Civil Defence)',
        crewSize: 10,
        contact: '+91 94370 52014',
        equipment: 'Inflatable Rescue Boats, 150HP Sludge Pumps, Petrol Chainsaws',
        status: 'AVAILABLE'
      },
      {
        id: 'CRW-PS-05',
        unitCode: 'PS-HOARD-05',
        name: 'Illegal Hoarding & Visual Hazard Clearance Team 5',
        specialization: 'Hazardous Billboard Dismantling & Traffic Obstruction Clearing',
        teamLead: 'Kalyan Mohapatra (Enforcement Inspector)',
        crewSize: 5,
        contact: '+91 94370 52015',
        equipment: 'Gas Plasma Cutters, Industrial Crane Hoists',
        status: 'AVAILABLE'
      }
    ]
  },

  parks_recreation: {
    departmentCode: 'parks_recreation',
    departmentName: 'BMC Horticulture, Urban Forestry & Parks Directorate',
    leadEngineer: {
      id: 'ENG-PR-01',
      name: 'Er. Sunita Tripathy',
      designation: 'Assistant Director (Urban Forestry & Horticulture)',
      officialId: 'BMC-HOR-606',
      departmentCode: 'parks_recreation',
      email: 'ad.horticulture@bmc.gov.in',
      contact: '+91 94370 62001',
      officeLocation: 'BMC Forest & Parks Depot, Ekamra Kanan'
    },
    crews: [
      {
        id: 'CRW-PR-01',
        unitCode: 'PR-TREE-01',
        name: 'Emergency Tree Trimming & Arborist Unit 1',
        specialization: 'Overhanging High-Voltage Branch Clearance & Hazardous Tree Felling',
        teamLead: 'Gagan Bihari Swain (Certified Arborist Lead)',
        crewSize: 6,
        contact: '+91 94370 62011',
        equipment: 'Stihl Heavy Chainsaws, Wood Chipper Truck, Crane Bucket',
        status: 'AVAILABLE'
      },
      {
        id: 'CRW-PR-02',
        unitCode: 'PR-PARK-02',
        name: 'Municipal Park Maintenance & Landscaping Squad 2',
        specialization: 'Lawn Restoration, Pruning, Soil Aeration & Green Cover Care',
        teamLead: 'Manjula Nayak (Head Horticulturist)',
        crewSize: 8,
        contact: '+91 94370 62012',
        equipment: 'Ride-On Rotary Lawn Mowers, Motorized Hedge Trimmers',
        status: 'AVAILABLE'
      },
      {
        id: 'CRW-PR-03',
        unitCode: 'PR-PLAY-03',
        name: 'Playground Equipment & Open Gym Safety Crew 3',
        specialization: 'Swing & Slide Structural Welding, Outdoor Gym Rigging & Safety Padding',
        teamLead: 'Rajat Kuanr (Mechanical Maintenance Tech)',
        crewSize: 4,
        contact: '+91 94370 62013',
        equipment: 'Portable Arc Welder, High-Density Rubber Impact Tile Kits',
        status: 'AVAILABLE'
      },
      {
        id: 'CRW-PR-04',
        unitCode: 'PR-MEDIAN-04',
        name: 'Avenue Plantation & Median Sprinkler Squad 4',
        specialization: 'Central Divider Greenery Irrigation & Tree Guard Restoration',
        teamLead: 'Akshaya Behera (Irrigation Tech)',
        crewSize: 5,
        contact: '+91 94370 62014',
        equipment: 'Mobile Water Mist Sprayer, Heavy Steel Tree Guard Welder',
        status: 'AVAILABLE'
      },
      {
        id: 'CRW-PR-05',
        unitCode: 'PR-FOUNT-05',
        name: 'Urban Waterbody & Park Illumination Unit 5',
        specialization: 'Musical Fountain Hydraulics, Submersible Pumps & Landscape Lighting',
        teamLead: 'Soumya Ranjan Das (Aquatic Systems Specialist)',
        crewSize: 4,
        contact: '+91 94370 62015',
        equipment: 'Submersible Pump Puller, Underwater LED Repair Rig',
        status: 'AVAILABLE'
      }
    ]
  }
};
