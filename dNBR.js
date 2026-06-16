// ============================================================
// SCRIPT PARA DETERMINAR SEVERIDAD DE INCENDIO
// Incendio Cuesta del Ternero 2021 - Comarca Andina, Patagonia
// ============================================================
 
// Pasos:
// 1. Definir zona de estudio
// 2. Filtrar imágenes Sentinel-2 pre y post incendio
// 3. Máscaras de vegetación y agua
// 4. Cálculo de NBR y dNBR
// 5. Clasificación de severidad (umbrales USGS)
// 6. Visualización
// 8. Cálculo de superficies
 
 
// ============================================================
// 1. ZONA DE ESTUDIO
// ============================================================
 
// Rectángulo amplio para filtrar y recortar imágenes Sentinel-2
var ZE = ee.FeatureCollection('projects/ee-melinapaez/assets/incendio_Cuesta_Ternero_2021/zona_estudio_4326_shp')
 
// Límite espacial definido por interpretación visual (usado como geometry en la vectorización)
var aoi = ee.FeatureCollection('projects/ee-melinapaez/assets/incendio_Cuesta_Ternero_2021/perimetro_incendio_aoi')
 
// Polígono del área quemada: resultado de la vectorización automática del dNBR (umbral > 0.1)
// filtrado por superficies >= 0.5 ha
var AOI = ee.FeatureCollection('projects/ee-melinapaez/assets/incendio_Cuesta_Ternero_2021/Poligono_Area_Quemada')
 
 
// ============================================================
// 2. IMÁGENES SENTINEL-2 PRE Y POST FUEGO
// Colección: COPERNICUS/S2_SR_HARMONIZED (Nivel 2A, reflectancia en superficie)
// ============================================================
 
var prefire = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
  .filterDate('2021-01-20', '2021-01-21') // imagen pre-incendio: 20-01-2021
  .filterBounds(ZE)
  .mosaic()  // se aplica en caso de más de una imagen en la misma pasada
  .clip(ZE)
 
print('Propiedades imagen pre-incendio', prefire)
 
var posfire = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
  .filterDate('2021-02-24', '2021-02-25') // imagen post-incendio: 24-02-2021
  .filterBounds(ZE)
  .mosaic()
  .clip(ZE)
 
 
// ============================================================
// 3. MÁSCARAS DE AGUA Y VEGETACIÓN
// ============================================================
 
// Máscara de agua: Global Surface Water
// lt(11): presencia de agua menos de 11 meses al año → 0 = agua, 1 = sin agua
var gsw = ee.Image("JRC/GSW1_2/GlobalSurfaceWater")
var waterMask = gsw.select('seasonality').lt(11).unmask(1).clip(aoi)
 
// Máscara de vegetación: NDVI >= 0.15 en imagen pre-incendio
// gte(0.15): zonas con vegetación → 1 = vegetación, 0 = sin vegetación
var NDVIpreF = prefire.normalizedDifference(['B8','B4'])
var vegMask = NDVIpreF.gte(0.15).unmask(1).clip(aoi)
 
 
// ============================================================
// 4. CÁLCULO DE NBR Y dNBR
// ============================================================
 
var NBR_pre = prefire.normalizedDifference(['B8','B12']).updateMask(waterMask).updateMask(vegMask)
var NBR_pos = posfire.normalizedDifference(['B8','B12']).updateMask(waterMask).updateMask(vegMask)
 
// Delta NBR: diferencia entre pre y post incendio
var dNBR = NBR_pre.subtract(NBR_pos).clip(aoi)
 
// ============================================================
// 5. CLASIFICACIÓN DE SEVERIDAD
// Umbrales según Key y Benson (2006) - USGS
// ============================================================
 
var NBRcat = dNBR.where(dNBR.lte(-0.5), 1)
NBRcat = NBRcat.where(dNBR.gt(-0.5).and(dNBR.lte(-0.25)), 2)
NBRcat = NBRcat.where(dNBR.gt(-0.25).and(dNBR.lte(-0.1)), 3)
NBRcat = NBRcat.where(dNBR.gt(-0.1).and(dNBR.lte(0.1)), 4)
NBRcat = NBRcat.where(dNBR.gt(0.1).and(dNBR.lte(0.270)), 5)
NBRcat = NBRcat.where(dNBR.gt(0.270).and(dNBR.lte(0.440)), 6)
NBRcat = NBRcat.where(dNBR.gt(0.440).and(dNBR.lte(0.660)), 7)
NBRcat = NBRcat.where(dNBR.gt(0.660).and(dNBR.lte(2)), 8).int8()
 
 
// ============================================================
// 6. VISUALIZACIÓN
// ============================================================
 
Map.centerObject(ZE, 13)
Map.setOptions('satellite')
 
Map.addLayer(ZE.style({color: 'Yellow', fillColor:'FF000000'}), null, 'Zona de Estudio', false)
Map.addLayer(aoi, {}, 'Límite visual (aoi)', false)

 
Map.addLayer(prefire, pvswir, 'S2 - 20 Enero 2021', false)
Map.addLayer(posfire, pvswir, 'S2 - 24 Febrero 2021', false)
Map.addLayer(waterMask, null, 'Máscara de Agua', false)
Map.addLayer(vegMask, null, 'Máscara Vegetación', false)
 
Map.addLayer(NBR_pre, null, 'NBR - 20 de Enero', false)
Map.addLayer(NBR_pos, null, 'NBR - 24 de Febrero', false)
Map.addLayer(dNBR, null, 'Delta NBR', false)
 
// Mapa de severidad: solo clases quemadas (5 a 8)
Map.addLayer(NBRcat.updateMask(NBRcat.gt(4)).selfMask(),
  {min:4, max:8, palette: ["#0ae042","#fff70b","#ffaf38","#ff641b","#a41fd6"]},
  'Severidad')
 
// Máscara de severidad: valores > 4 (quemado)
Map.addLayer(NBRcat.gt(4).selfMask(), null, 'Máscara Severidad', false)
 
 

// ============================================================
// 8.VECTORIZACIÓN DEL ÁREA QUEMADA
// Este bloque generó  el asset Poligono_Area_Quemada.
// Ya está guardado como asset — no es necesario volver a ejecutarlo.
// ============================================================
 
var zonasQuemadas = NBRcat.gte(5).selfMask()
 
var poligonosQuemados = zonasQuemadas.reduceToVectors({
  geometry: aoi,   // límite espacial definido por interpretación visual
  scale: 20,
  maxPixels: 1e9,
  geometryType: 'polygon',
  bestEffort: true
})
 
var poligonosFiltrados = poligonosQuemados.map(function(feature) {
  var area = feature.geometry().area({'maxError': 1})
  return feature.set({'area_m2': area})
}).filter(ee.Filter.gt('area_m2', 5000))  // elimina polígonos < 0.5 ha
 
Export.table.toDrive({
  collection: poligonosFiltrados,
  description: 'Poligono_Area_Quemada',
  fileFormat: 'SHP'
})
*/

// ============================================================
// 9. CÁLCULO DE SUPERFICIES
// Área afectada por el fuego por clase de severidad (en hectáreas)
// ============================================================
 
var areaFuego = ee.Image.pixelArea().multiply(0.0001).addBands(NBRcat)
  .reduceRegion({
    reducer: ee.Reducer.sum().unweighted().group(1),
    geometry: AOI,
    scale: 20,
    maxPixels: 1e10
  })
 
print('Área afectada por el fuego (ha)', areaFuego)
 
 

 