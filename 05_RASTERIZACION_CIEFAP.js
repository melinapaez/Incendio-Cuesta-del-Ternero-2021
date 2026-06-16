// =================================================================================================
//Preparacion de tipos de cobertura vegetal CIEFAP para transformar de shape a raster en GEE//
//IMPORTANTE: Capa del CIEFAP original Posgar 94/ Argentina 1 (EPSG:22181)
//Las capas de ciefap utilizadas son del 2017
// =================================================================================================


//Pre procesamiento en QGIS. Nombre del proyecto 'cobertura_ciefap.gpkg': 
// 1. Verificar si las capas originales de RN (cob_2017_rn_22181) y CH (cob_2017_ch_22181) tienen erorres de geometria,
   con la funcion: vectorial----Herramientas de geometria----Check Validity
// 2. Se corrigieron errores de geometria con: Processing toolbox--selecciono 'Fix geometries' 
// 2.2. Renombrar capas corregidas: cob_ch_22181 y cob_rn_22181
// 3. Hago la union de las dos capas con la funcion 'merge vector layers' y lo guardo con la proyeccion que voy a usar en GEE ( WGS84 EPSG: 4326)
// 3.1. El nombre de la capa resultante se llama cob_ch_rn_4326
// 3.1. Creo una capa recortada a la zona de estudio  (zona_estudio_4326_shp)
// 3.2. Hago un recorte ('click') en la zona de estudio que me interesa (capa resultante: cob_ch_rn_ze_4326)

//Para la clasificion del CIEFAP uso la columna Ley_N2
//con el objetivo de poder rasterizar esta capa en GEE, genero en la tabla de atributos una columna que se llama 'clas_N2 y le asigo un numero a cada clase:

/*CASE
  WHEN "Ley_N2" = 'Arbu Na' THEN 1
  WHEN "Ley_N2" = 'Ci' THEN 2
  WHEN "Ley_N2" = 'Co' THEN 3
  WHEN "Ley_N2" = 'Exot-Artif' THEN 4
  WHEN "Ley_N2" = 'Herb-Subarb' THEN 5
  WHEN "Ley_N2" = 'Humedales' THEN 6
  WHEN "Ley_N2" = 'Le' THEN 7
  WHEN "Ley_N2" = 'Ma' THEN 8
  WHEN "Ley_N2" = 'MMx' THEN 9
  WHEN "Ley_N2" = 'Mx' THEN 10
  WHEN "Ley_N2" = 'Ñi' THEN 11
  WHEN "Ley_N2" = 'Rd' THEN 12
  WHEN "Ley_N2" = 'Rem Dist Rec' THEN 13
  WHEN "Ley_N2" = 'Hie-Nie' THEN 14
  WHEN "Ley_N2" = 'Erial' THEN 15
  WHEN "Ley_N2" = 'Agua' THEN 16
  WHEN "Ley_N2" = 'Ch' THEN 17
  WHEN "Ley_N2" = 'Al' THEN 18
  WHEN "Ley_N2" = 'Cg' THEN 19
  WHEN "Ley_N2" = 'Mr' THEN 20
		  -- Añade más clases según sea necesario
  ELSE 0
END*/

//Hago lo mismo con la categoria Ley_N1 que es de tipos de tierras: 
/*CASE
WHEN "Ley_N1" = 'OFL' THEN 1
WHEN "Ley_N1" = 'OT' THEN 2
WHEN "Ley_N1" = 'TF' THEN 3
ESLE 0
END*/


//El shape ya esta listo para subir a GEE: nombre del shape cob_rn_ch_4326

/////////////////////////////////Script para pasar de formato shape a raster////////////////////////////////////////////////////////////

//creo el objeto zona de estudio
var ZE = ee.FeatureCollection ('projects/ee-mbpaez/assets/incendio_Cuesta_Ternero/zona_estudio_4326_shp')

//creo el objeto tipo de cobertura vegetal de Ciefap recortada por la zona de estudio
var ciefap = ee.FeatureCollection ('projects/ee-mbpaez/assets/incendio_Cuesta_Ternero/cob_rn_ch_ze_4326')


//Rasterizo el shape ciefap por el atrivuto 'clas_N2'
var ClasRaster = ciefap.reduceToImage({properties: ['clas_N2'],reducer: ee.Reducer.first()}).int8()
var ClasRaster2 = ClasRaster.select([0],['Clase'])

//Parametro de visualizacion para tipo de cobertura vegetal
var pv = {"opacity":1,"bands":["Clase"],"min":1,"max":17,"palette":["428f41","a5fb57","d2f73d","ff200a","4644c8","8accc6","f9620a","ffcfa7","ecef1a","ffa15e","f160ed","763164","fbbaff","ffffff","c2c2c2","9cd5ea","000000"]};


//visualizo las capas 
Map.addLayer(ciefap, null, "Clasificación Vector", false)   
Map.addLayer(ClasRaster2, pv, "Clasificación Rasterizada", false)
Map.addLayer(ZE.style({color: 'black', fillColor: 'FF000000'}), null, "Area Export", false)

Map.setOptions('satellite')
Map.centerObject(ZE)


//Exporto al raster al Asset
Export.image.toAsset({image:ClasRaster2, 
description:"ClasCobCiefap_RN_CH", 
assetId:"ClasCobCiefap_RN_CH", 
region: ZE, 
scale: 10, 
pyramidingPolicy: 'MODE',
maxPixels: 1e13,
crs:'EPSG:4326' // crs: 'EPSG: 4326'
})


//////////////////////////////////////// LEYENDA //////////////////////////////////////////

//////////////////////LEYENDA///////////////////////////////  
var colors = ["428f41","a5fb57","d2f73d","ff200a","4644c8","8accc6","f9620a","ffcfa7","ecef1a","ffa15e","f160ed","763164","fbbaff","ffffff","c2c2c2","9cd5ea","000000"]
 
 
var names = ['Arbustal Nativo [1]','Cipres [2]','Coihue [3]','Exotico Artificial [4]',
'Herbacea Subarbustiva [5]', 'Humedales [6]', 'Lenga [7]', 'Maiten [8]', 'Matorral Mixto [9]',
'Mixto [10]', 'Ñire [11]', 'Radal [12]', 'Rem [13]', 'Hielo-Nieve [14]', 'Erial [15]' ,
'Agua [16]', 'Ch [17]'];

var legend = ui.Panel({
  style: {
    position: 'bottom-left',
    padding: '8px 15px'
  }
});

// Create and add the legend title.
var legendTitle = ui.Label({
  value: 'Clases',
  style: {
    fontWeight: 'bold',
    fontSize: '16px',
    margin: '0 0 4px 0',
    padding: '0'
  }
});

legend.add(legendTitle);

// var loading = ui.Label('Legend:', {margin: '2px 0 4px 0'});
// legend.add(loading);

var makeRow = function(color, name) {
  // Create the label that is actually the colored box.
  var colorBox = ui.Label({
    style: {
      backgroundColor: '#' + color,
      // Use padding to give the box height and width.
      padding: '8px',
      margin: '0 0 4px 0'
    }
  });

  // Create the label filled with the description text.
  var description = ui.Label({
    value: name,
    style: {margin: '0 0 4px 6px'}
  });

  return ui.Panel({
    widgets: [colorBox, description],
    layout: ui.Panel.Layout.Flow('horizontal')
  });
};

for (var i = 0; i < names.length; i++){
legend.add(makeRow(colors[i], names[i]));
}

Map.add(legend)




