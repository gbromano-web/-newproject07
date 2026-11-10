/* Gilbros catalogue data: branches, categories and products.
   Prices are stored before 12% VAT. Replace with your real price list. */
const BRANCHES = [
  {id:'qc', name:'Commonwealth Ave., Quezon City', short:'Quezon City', hours:'7 AM – 6 PM', phone:'(02) 8000 1100'},
  {id:'pasig', name:'C. Raymundo Ave., Pasig City', short:'Pasig', hours:'7 AM – 6 PM', phone:'(02) 8000 1200'},
  {id:'cainta', name:'Ortigas Ave. Ext., Cainta, Rizal', short:'Cainta', hours:'7 AM – 6 PM', phone:'(02) 8000 1300'},
  {id:'bacoor', name:'Aguinaldo Hwy., Bacoor, Cavite', short:'Bacoor', hours:'7:30 AM – 5:30 PM', phone:'(046) 000 1400'}
];
const CATS = [
  {id:'power-tools', name:'Power Tools', icon:'drill', count:1240, subs:{'Drilling':['Hammer drills','Rotary hammers','Impact drivers','Magnetic drills'],'Cutting':['Angle grinders 4"','Circular saws 7-1/4"','Cut-off machines 14"','Tile cutters'],'Measuring':['Line lasers','Rotary lasers','Laser distance meters'],'Batteries':['18V platform','Chargers','Battery kits']}},
  {id:'building-materials', name:'Building Materials', icon:'brick', count:1680, subs:{'Cement & aggregates':['Portland cement Type 1','Masonry cement','Sand & gravel','Tile adhesive'],'Masonry':['CHB 4"','CHB 5"','CHB 6"'],'Steel':['Deformed bars Grade 33/40','Tie wire #16','Angle bars','C-purlins'],'Boards & roofing':['Marine plywood','Fiber cement board','Long-span roofing','Gutters & flashing']}},
  {id:'electrical', name:'Electrical', icon:'bolt', count:2150, subs:{'Wire & cable':['THHN wire','Royal cord','Flat cord','Service drop'],'Panels & breakers':['Panel boards','Plug-in breakers','Safety switches'],'Lighting':['LED bulbs','Floodlights','Emergency lights'],'Wiring devices':['Outlets & switches','PVC conduit','Junction & utility boxes']}},
  {id:'plumbing', name:'Plumbing', icon:'pipe', count:1720, subs:{'Pipe & fittings':['PVC sanitary (orange)','PVC pressure (blue)','PPR pipe','PE hose'],'Fixtures':['Water closets','Lavatories','Faucets & showers'],'Valves':['Gate valves','Ball valves','Float valves'],'Pumps & tanks':['Shallow-well pumps','Booster pumps','Water tanks']}},
  {id:'safety', name:'Safety & PPE', icon:'helmet', count:640, subs:{'Head & face':['Hard hats','Face shields','Ear muffs'],'Footwear':['Safety shoes','Rubber boots'],'Hi-vis':['Reflective vests','Rain coats'],'Site safety':['Caution tape','Safety signage','First aid kits']}},
  {id:'fasteners', name:'Fasteners & Fixings', icon:'anchor', count:1310, subs:{'Anchors':['Expansion bolts','Chemical anchors','Tox & screws'],'Screws':['Tekscrews','Gypsum screws','Wood screws'],'Nails & bolts':['Common wire nails','Concrete nails','Umbrella nails','Hex bolts']}}
];
const P = [
  {id:'dr1820', sku:'GB-DRL-18V-2041', cat:'power-tools', name:'18V Brushless Hammer Drill Kit, 2 × 5.0Ah Batteries', brand:'Proline', price:13348, unit:'set', volt:'18V', app:['Concrete','Masonry','Wood','Metal'], tiers:[[1,0],[5,.08],[10,.15]], stock:{qc:12,pasig:5,cainta:0,bacoor:3}, icon:'drill',
    specs:{'Voltage':'18 V Li-ion','Motor':'Brushless','No-load speed':'0–550 / 0–2,100 rpm','Impact rate':'0–31,500 bpm','Max torque':'135 Nm','Chuck':'13 mm keyless','Drilling capacity (masonry)':'16 mm','Weight (with battery)':'2.1 kg','Kit contents':'2 × 5.0Ah battery, charger (220 V), case','Warranty':'1 year (service center: Quezon City)'}},
  {id:'rh2640', sku:'GB-RHM-220-2640', cat:'power-tools', name:'SDS-Plus Rotary Hammer 26 mm, 800 W', brand:'Proline', price:6964, unit:'pc', volt:'220V corded', app:['Concrete','Masonry'], tiers:[[1,0],[5,.07],[10,.12]], stock:{qc:18,pasig:9,cainta:4,bacoor:7}, icon:'drill',
    specs:{'Input power':'800 W, 220 V / 60 Hz','Impact energy':'2.7 J','Max drilling (concrete)':'26 mm','Modes':'Drill, hammer drill, chisel','Chuck':'SDS-Plus','Weight':'2.9 kg','Warranty':'1 year'}},
  {id:'ag100', sku:'GB-AGR-100-850', cat:'power-tools', name:'Angle Grinder 4" (100 mm), 850 W, Slide Switch', brand:'Kraftwerk', price:1964, unit:'pc', volt:'220V corded', app:['Metal','Masonry'], tiers:[[1,0],[10,.1],[25,.16]], stock:{qc:44,pasig:20,cainta:15,bacoor:22}, icon:'drill',
    specs:{'Input power':'850 W, 220 V / 60 Hz','Disc diameter':'100 mm (4")','No-load speed':'11,000 rpm','Spindle thread':'M10','Weight':'1.8 kg','Includes':'Side handle, guard, wrench','Warranty':'6 months'}},
  {id:'cs185', sku:'GB-CSW-185-1400', cat:'power-tools', name:'Circular Saw 7-1/4" (185 mm), 1,400 W', brand:'Kraftwerk', price:5348, unit:'pc', volt:'220V corded', app:['Wood'], tiers:[[1,0],[5,.06],[10,.11]], stock:{qc:3,pasig:0,cainta:2,bacoor:0}, icon:'drill',
    specs:{'Input power':'1,400 W, 220 V / 60 Hz','Blade':'185 mm (7-1/4"), 20 mm bore','Max cut depth 90°':'63 mm','Bevel':'0–45°','No-load speed':'5,200 rpm','Weight':'4.1 kg','Warranty':'1 year'}},
  {id:'im1890', sku:'GB-IMP-18V-1890', cat:'power-tools', name:'18V Brushless Impact Driver, 1/4" Hex (Tool Only)', brand:'Proline', price:5348, unit:'pc', volt:'18V', app:['Wood','Metal'], tiers:[[1,0],[5,.08],[10,.15]], stock:{qc:0,pasig:0,cainta:0,bacoor:0}, icon:'drill',
    specs:{'Voltage':'18 V Li-ion','Max torque':'205 Nm','Impact rate':'0–3,800 ipm','Chuck':'1/4" hex quick-release','Weight (tool only)':'1.2 kg','Warranty':'1 year'}},
  {id:'ll360', sku:'GB-LSR-3D-0360', cat:'power-tools', name:'3D Green-Beam Line Laser, 12 Lines, with Tripod', brand:'Geomark', price:7580, unit:'set', volt:'Battery', app:['Levelling'], tiers:[[1,0],[3,.05]], stock:{qc:6,pasig:2,cainta:0,bacoor:1}, icon:'level',
    specs:{'Lines':'3 × 360° (12 lines)','Beam':'Green, 520 nm','Accuracy':'±0.3 mm/m','Range':'30 m (60 m with receiver)','Self-levelling':'±4°','Protection':'IP54','Kit contents':'Laser, 2 batteries, tripod, wall bracket, case'}},
  {id:'cem40', sku:'GB-CEM-T1-40', cat:'building-materials', name:'Portland Cement Type 1, 40 kg Bag', brand:'Isla Cement', price:232, unit:'bag', volt:null, app:['Concrete','Masonry'], tiers:[[1,0],[50,.04],[200,.08]], stock:{qc:1600,pasig:900,cainta:2200,bacoor:1400}, icon:'brick', heavy:true,
    specs:{'Standard':'PNS 07 / ASTM C150 Type I','Bag weight':'40 kg','Truckload':'400 bags (10-wheeler)','Initial setting time':'≥ 45 min','Storage':'Dry, raised off the floor, use within 60 days','Certification':'BPS PS mark'}},
  {id:'rb10', sku:'GB-RBR-G40-10', cat:'building-materials', name:'Deformed Bar Grade 40, 10 mm × 6 m', brand:'Luzon Steel', price:158, unit:'pc', volt:null, app:['Concrete'], tiers:[[1,0],[100,.04],[500,.08]], stock:{qc:800,pasig:350,cainta:1200,bacoor:950}, icon:'brick', heavy:true,
    specs:{'Grade':'Grade 40 (Grade 275), PNS 49:2020','Diameter':'10 mm','Length':'6 m','Unit weight':'0.616 kg/m (3.70 kg/pc)','Marking':'Mill mark + grade on every bar','Certification':'BPS PS mark; mill certificate per delivery'}},
  {id:'chb4', sku:'GB-CHB-4IN', cat:'building-materials', name:'Concrete Hollow Block (CHB) 4" × 8" × 16"', brand:'Rizal Blocks', price:14.3, unit:'pc', volt:null, app:['Masonry'], tiers:[[1,0],[500,.05],[2000,.1]], stock:{qc:6000,pasig:0,cainta:15000,bacoor:9000}, icon:'brick', heavy:true,
    specs:{'Size':'100 × 200 × 400 mm (4" × 8" × 16")','Compressive strength':'≥ 350 psi (load-bearing on request)','Weight':'9 kg approx.','Per m² of wall':'12.5 pcs','Delivery':'Boom truck or elf truck, minimum 500 pcs'}},
  {id:'ply34', sku:'GB-PLY-MAR-34', cat:'building-materials', name:'Marine Plywood 3/4" (18 mm), 4 × 8 ft', brand:'Visayan Wood', price:1295, unit:'sheet', volt:null, app:['Formwork','Wood'], tiers:[[1,0],[20,.05],[100,.1]], stock:{qc:140,pasig:60,cainta:90,bacoor:75}, icon:'brick',
    specs:{'Thickness':'18 mm (3/4")','Size':'1,220 × 2,440 mm (4 × 8 ft)','Grade':'Marine, phenolic glue (WBP)','Uses':'Formwork, cabinetry, exterior','Weight':'28 kg approx.'}},
  {id:'ls04', sku:'GB-RFG-LS-04', cat:'building-materials', name:'Pre-painted Long-Span Roofing 0.4 mm, Rib Type, per Linear Metre', brand:'Metro Roofing', price:330, unit:'m', volt:null, app:['Roofing'], tiers:[[1,0],[100,.05],[300,.09]], stock:{qc:2400,pasig:0,cainta:1800,bacoor:1200}, icon:'brick', heavy:true,
    specs:{'Thickness':'0.4 mm (BMT)','Effective width':'1,000 mm','Coating':'Aluminium-zinc, pre-painted','Colours':'Spanish red, forest green, royal blue, terracotta','Length':'Cut to order, up to 12 m','Lead time':'Roll-formed in 1–2 working days'}},
  {id:'thhn35', sku:'GB-THHN-35-150', cat:'electrical', name:'THHN Stranded Wire 3.5 mm², 150 m Box, Red', brand:'Pinoy Cables', price:4420, unit:'box', volt:'600V', app:['Wiring'], tiers:[[1,0],[5,.05],[20,.1]], stock:{qc:85,pasig:40,cainta:30,bacoor:46}, icon:'bolt',
    specs:{'Conductor':'Stranded annealed copper','Cross-section':'3.5 mm²','Insulation':'PVC with nylon jacket, 600 V, 90 °C dry','Standard':'PNS 35 / UL 83','Length':'150 m','Certification':'BPS PS mark'}},
  {id:'pb8', sku:'GB-PNL-8B-PLG', cat:'electrical', name:'Plug-in Panel Board, 8 Branches with 60 A Main', brand:'Voltline', price:2545, unit:'pc', volt:'230V', app:['Wiring'], tiers:[[1,0],[5,.06],[20,.12]], stock:{qc:14,pasig:6,cainta:9,bacoor:0}, icon:'bolt',
    specs:{'Branches':'8 single-pole','Main breaker':'60 A, 2-pole','Bus rating':'100 A','Enclosure':'Powder-coated steel, NEMA 1','Mounting':'Surface or flush','Standard':'Philippine Electrical Code compliant'}},
  {id:'pvc4', sku:'GB-PVC-SAN-4', cat:'plumbing', name:'PVC Sanitary Pipe 4" × 3 m, Orange, Series 1000', brand:'AquaLine', price:375, unit:'length', volt:null, app:['Drainage'], tiers:[[1,0],[20,.06],[100,.12]], stock:{qc:320,pasig:150,cainta:260,bacoor:180}, icon:'pipe',
    specs:{'Size':'4" (110 mm OD)','Length':'3 m','Wall':'Series 1000','Joint':'Solvent cement, bell end','Use':'Sanitary and storm drainage','Standard':'PNS 65'}},
  {id:'ppr20', sku:'GB-PPR-PN20-20', cat:'plumbing', name:'PPR Pipe PN20, 20 mm (1/2") × 4 m', brand:'AquaLine', price:165, unit:'length', volt:null, app:['Water supply'], tiers:[[1,0],[50,.08],[200,.14]], stock:{qc:700,pasig:380,cainta:420,bacoor:510}, icon:'pipe',
    specs:{'Material':'PP-R 80','Pressure rating':'PN20 (20 bar at 20 °C)','Outside diameter':'20 mm (1/2")','Length':'4 m','Joining':'Socket fusion','Use':'Hot and cold water lines'}},
  {id:'hm01', sku:'GB-PPE-HAT-01', cat:'safety', name:'Safety Hard Hat with Ratchet Suspension, White', brand:'SiteGuard', price:312, unit:'pc', volt:null, app:['PPE'], tiers:[[1,0],[20,.1],[100,.18]], stock:{qc:420,pasig:180,cainta:240,bacoor:200}, icon:'helmet',
    specs:{'Standard':'ANSI Z89.1 Type I Class E','Shell':'HDPE, UV stabilised','Suspension':'4-point ratchet','Accessory slots':'Yes, for ear muffs & visor','Weight':'340 g'}},
  {id:'ss01', sku:'GB-PPE-SHOE-S1', cat:'safety', name:'Safety Shoes, Steel Toe, Slip-Resistant Sole', brand:'SiteGuard', price:1515, unit:'pair', volt:null, app:['PPE'], tiers:[[1,0],[10,.08],[50,.15]], stock:{qc:9,pasig:14,cainta:6,bacoor:11}, icon:'helmet',
    specs:{'Toe cap':'Steel, 200 J','Upper':'Split leather','Sole':'PU/rubber, oil and slip resistant','Sizes':'38–46','Weight':'720 g (size 42)'}},
  {id:'eb12', sku:'GB-FIX-EXP-12', cat:'fasteners', name:'Expansion Bolt 1/2" × 4", Zinc Plated, Box of 25', brand:'Fixmaster', price:705, unit:'box', volt:null, app:['Concrete'], tiers:[[1,0],[10,.1],[40,.18]], stock:{qc:110,pasig:70,cainta:55,bacoor:60}, icon:'anchor',
    specs:{'Size':'1/2" × 4" (12 × 100 mm)','Drill hole':'16 mm','Min. embedment':'60 mm','Finish':'Electro-zinc','Contents':'25 sets: bolt, sleeve, washer, nut'}}
];
const DOCS = id => {
  const p = byId(id); const d = [['Technical data sheet','0.8 MB · English']];
  if (['building-materials','plumbing'].includes(p.cat)) d.unshift(['Safety data sheet (SDS)','1.2 MB · English · Rev. 04']);
  if (['electrical','plumbing','building-materials'].includes(p.cat)) d.push(['BPS PS / ICC certificate','0.4 MB · Product certification']);
  if (p.cat==='power-tools') d.push(['User manual','3.6 MB · English / Filipino'],['Warranty card & service centers','0.2 MB']);
  return d;
};
