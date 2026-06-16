// ============================================================
// SCRIPT PARA EL CALCULO DE INDICES
// Incendio Cuesta del Ternero 2021 - Comarca Andina, Patagonia
// ============================================================
 
// Pasos:se utilizan los mismos productos generados en el scrip 01_SEVERIDAD_dNBR
// 1. ZONA DE ESTUDIO: AOI
// 2. IMÁGENES SENTINEL-2 PRE Y POST FUEGO
// 3. MÁSCARAS DE AGUA Y VEGETACIÓN
// 4. CALCULO DE INDICES
// 5. EXPORTACION
  
// ============================================================
// 4. CÁLCULO DE INDICES
// ============================================================

// ===============================================================================================
// RdNBR: se calcula a partir del dNBR generado en 01_SEVERIDAD_dNBR
// ===============================================================================================

var NBR_pre = prefire.normalizedDifference(['B8','B12']).updateMask(waterMask).updateMask(vegMask)
var NBR_pos = posfire.normalizedDifference(['B8','B12']).updateMask(waterMask).updateMask(vegMask)
var dNBR = NBR_pre.subtract(NBR_pos).clip(AOI)

function RdNBR_func(dNBR, NBR_pre) {
  return dNBR.divide(NBR_pre.abs().sqrt());
}

var RdNBR = RdNBR_func(dNBR, NBR_pre);

// Opcional: Reescalar el RdNBR
var RdNBR_rescale = RdNBR.multiply(1000);

// ===============================================================================================
// RBR
// ===============================================================================================

var RBR = dNBR.divide(NBR_pre.add(1.001));

// Opcional: Reescalar el RBR
var RBR_rescale = RBR.multiply(1000)


// ===============================================================================================
// NDVI y dNDVI
// ===============================================================================================

var NDVI_pre = prefire.normalizedDifference(['B8','B4']).updateMask(waterMask).updateMask(vegMask)
var NDVI_pos = posfire.normalizedDifference(['B8','B4']).updateMask(waterMask).updateMask(vegMask)

var dNDVI = NDVI_pre.subtract(NDVI_pos)


// ===============================================================================================
// CSI y dCSI
// ===============================================================================================

var CSI_pre = prefire.expression (("NIR/SWIR1"),
{
  NIR: prefire.select('B8'),
  SWIR1: prefire.select('B11')
}).updateMask(waterMask).updateMask(vegMask).rename('CSI_pre')


var CSI_pos = posfire.expression (("NIR/SWIR1"),
{
  NIR: posfire.select('B8'),
  SWIR1: posfire.select('B11')
}).updateMask(waterMask).updateMask(vegMask).rename('CSI_post')


var dCSI = CSI_pre.subtract(CSI_pos).rename('dCSI')


// ==================================================================
// 5. EXPORTO IMAGENES AL ASSET Y DRIVE: ver scrip 01_SEVERIDAD_dNBR
// ==================================================================