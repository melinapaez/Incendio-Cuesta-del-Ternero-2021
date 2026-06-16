// ==============================================================================
// SCRIPT PARA EL CALCULO DE INDICES
// Años: 2022, 2023 y 2024
// *El 2021 corresponden a los scripts 01_SEVERIDAD_dNBR y 02_INDICES 
// ==============================================================================
 
// Pasos:se utilizan los mismos pasos generados en el scrip 01_SEVERIDAD_dNBR
// 1. ZONA DE ESTUDIO: AOI
// 2. IMÁGENES SENTINEL-2 PRE Y POST FUEGO SELECCIONADAS PARA CADA AÑO
// 3. MÁSCARAS DE AGUA Y VEGETACIÓN
// 4. CALCULO DE INDICES
// 5. EXPORTACION
  
// =====================================================================
// 2. IMÁGENES SENTINEL-2 PRE Y POST FUEGO SELECCIONADAS PARA CADA AÑO
// =====================================================================

// =====================================================================
//AÑO 2022
// =====================================================================

var prefire_2021 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
.filterDate('2021-01-20', '2021-01-21') //imagen de interes 20-01-2021
.filterBounds(ZE)
.mosaic()  // se aplica en caso que haya mas de una imagen en la misma pasada 
.clip(AOI)
//select(['B4','B8','B11'])

print('propiedades',prefire)
 
var posfire_2022 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
.filterDate('2022-03-11', '2022-03-12') //imagen de interes 11-03-2022
.filterBounds(ZE)
.mosaic()
.clip(AOI)


// =====================================================================
//AÑO 2023
// =====================================================================

var prefire_2021 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
.filterDate('2021-01-20', '2021-01-21') //imagen de interes 20-01-2021
.filterBounds(ZE)
.mosaic()  // se aplica en caso que haya mas de una imagen en la misma pasada 
.clip(ZE)
//select(['B4','B8','B11'])

print('propiedades',prefire)
 

var posfire_2023 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
.filterDate('2023-03-11', '2023-03-12') //imagen de interes 11-03-2022
.filterBounds(ZE)
.mosaic()
.clip(ZE)

// =====================================================================
//AÑO 2024
// =====================================================================

var prefire_2021 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
.filterDate('2021-01-20', '2021-01-21') //imagen de interes 20-01-2021
.filterBounds(ZE)
.mosaic()  // se aplica en caso que haya mas de una imagen en la misma pasada 
.clip(ZE)
//select(['B4','B8','B11'])

print('propiedades',prefire)
 

var posfire_2024 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
.filterDate('2024-02-29', '2024-03-01') //imagen de interes 11-03-2022
.filterBounds(ZE)
.mosaic()
.clip(ZE)


// ============================================================
// 3. MÁSCARAS DE AGUA Y VEGETACIÓN: script 01_SEVERIDAD_dNBR
// ============================================================
// GLOBAL SURFACE WATER
var gsw = ee.Image("JRC/GSW1_2/GlobalSurfaceWater")
var waterMask = gsw.select('seasonality').lt(11).unmask(1).clip(AOI) 

//MASCARA DE VEGETACION CON UMBRAL DE NDVI

var NDVIpreF = prefire_2021.normalizedDifference(['B8','B4'])
var vegMask = NDVIpreF.gte(0.15).unmask(1).clip(AOI) 

 
// ============================================================================================================
// CALCULO DE INDICES PARA CADA AÑO: repetir funciones del script 02_INDICES
   NBR_post incendio, dNBR, RdNBR, RBR, NDVI_post incendio, dNDVI, CSI_post incendio, dCSI
// ============================================================================================================
/* IMPORTANTE

   imagen pre incendio seleccionada corresponde a: prefire_2021
   imagen pos incendio seleccionada indicar el año según corresponda: posfire_2022, posfire_2023, posfire_2024
   
*/

// ==================================================================
// 5. EXPORTO IMAGENES AL ASSET Y DRIVE: ver scrip 01_SEVERIDAD_dNBR
// ==================================================================