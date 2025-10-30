
// Centrar el mapa en la zona de estudio
Map.centerObject(Zona, 10);
Map.addLayer(Zona, {color: 'red'}, 'Zona de Estudio');

// Cargar la colección de imágenes de Landsat 8
var dataset2023 = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
    .filterDate('2023-01-01', '2023-03-31')
    .filterBounds(Zona);

// Aplicar el factor de escala y recortar a la zona de estudio
var datasetProcessed2023 = dataset2023.map(function(image) {
  return image.multiply(0.0000275).add(-0.2).clip(Zona)
    .copyProperties(image, ['system:time_start']);
});

// Cargar el DEM y calcular variables topográficas
var dem = ee.Image('USGS/SRTMGL1_003').clip(Zona);
var slope = ee.Terrain.slope(dem).rename('Slope');
var aspect = ee.Terrain.aspect(dem).rename('Aspect');
var texture = dem.reduceNeighborhood({reducer: ee.Reducer.stdDev(), kernel: ee.Kernel.square(3)}).rename('Texture');
var convexity = dem.convolve(ee.Kernel.laplacian8()).rename('Convexity');

// TPI y TRI con menor carga computacional
var kernelTPI = ee.Kernel.circle({radius: 250, units: 'meters'});
var meanElev = dem.reduceNeighborhood({reducer: ee.Reducer.mean(), kernel: kernelTPI});
var tpi = dem.subtract(meanElev).rename('TPI');
var tri = dem.reduceNeighborhood({reducer: ee.Reducer.stdDev(), kernel: kernelTPI}).rename('TRI');

// Función para calcular índices espectrales
var addIndices = function(image) {
  var ndvi = image.normalizedDifference(['SR_B5', 'SR_B4']).rename('NDVI');
  var ndsi = image.normalizedDifference(['SR_B3', 'SR_B6']).rename('NDSI');
  var ndgi = image.normalizedDifference(['SR_B3', 'SR_B4']).rename('NDGI');
  var imd = image.normalizedDifference(['SR_B4', 'SR_B2']).rename('IMD');

  return image.addBands([ndvi, ndsi, ndgi, imd, dem, slope, aspect, texture, convexity, tpi, tri]);
};

// Aplicar la función para calcular los índices
var datasetWithIndices2023 = datasetProcessed2023.map(addIndices);
var meanImage2023 = datasetWithIndices2023.mean();

// Datos de entrenamiento y muestreo
var training_data = GlaciarDescubierto.merge(GlaciarCubierto).merge(Morrena)
                    .merge(Agua).merge(AbanicoAluvial).merge(Coluvios)
                    .merge(AfloramientoDeRoca).merge(Llanura);

var training = meanImage2023.sampleRegions({
  collection: training_data,
  properties: ['land_class'],
  scale: 30
});

// Separar los datos en entrenamiento (70%) y prueba (30%)
var sample = training.randomColumn();
var trainingSet = sample.filter(ee.Filter.lt('random', 0.7));
var testingSet = sample.filter(ee.Filter.gte('random', 0.3));

// Entrenar clasificadores
var classifierRF = ee.Classifier.smileRandomForest(100).train({
  features: trainingSet,
  classProperty: 'land_class',
  inputProperties: meanImage2023.bandNames()
});

// Clasificar la imagen
var classifiedRF = meanImage2023.classify(classifierRF);
Map.addLayer(classifiedRF, {min: 1, max: 8, palette: ['#b8c2ef', '#8b92b4', '#40ffcc', '#3665bd', '#e9bb6e', '#ffa500', '#c2534f', '#00b900']}, 'Clasificación RF');

// Validar Random Forest
var classifiedTestRF = testingSet.classify(classifierRF);
var confusionMatrixRF = classifiedTestRF.errorMatrix('land_class', 'classification');
print('Matriz de confusión RF:', confusionMatrixRF);
print('Exactitud general RF:', confusionMatrixRF.accuracy());

//// Graficos ////

// Generar la importancia de las variables
var ExplanationRF = classifierRF.explain();
var variableImportance = ee.Dictionary(ExplanationRF.get('importance'));

// Calcular la importancia relativa
var totalImportance = variableImportance.values().reduce(ee.Reducer.sum());
var relativeImportance = variableImportance.map(function(key, value) {
  return ee.Number(value).multiply(100).divide(totalImportance);
});
print('Relative Importance of Variables RF:', relativeImportance);

// Crear una colección de características para graficar
var importanceFc = ee.FeatureCollection([ee.Feature(null, relativeImportance)]);

// Gráfico de la importancia de las variables
var chart = ui.Chart.feature.byProperty({
  features: importanceFc
}).setOptions({
  title: 'Feature Importance - Random Forest',
  vAxis: {title: 'Importance (%)'},
  hAxis: {title: 'Features'},
  legend: {position: 'none'}
});
print(chart);

// Exportación optimizada
Export.image.toDrive({
  image: classifiedRF,
  description: 'Clasificacion_RF_2023',
  scale: 30,
  region: Zona,
  maxPixels: 1e12,
  folder: 'Mi_Carpeta_Drive',
  fileFormat: 'GeoTIFF'
});

///// Importancia de Variable por clase ////

///// Glaciar Descubierto
var training_glaciar = training.map(function(feature) {
  var clase = ee.Number(feature.get('land_class'));
  var binario = clase.eq(1);
  return feature.set('binaria', binario);
});

// Entrenar el clasificador binario
var rf_glaciar = ee.Classifier.smileRandomForest(100).train({
  features: training_glaciar,
  classProperty: 'binaria',
  inputProperties: meanImage2023.bandNames()
});

// Obtener importancia de variables
var importancia_glaciar = ee.Dictionary(rf_glaciar.explain().get('importance'));
print('Importancia variables - Glaciar Descubierto', importancia_glaciar);

///// Glaciar Cubierto
var training_glaciar = training.map(function(feature) {
  var clase = ee.Number(feature.get('land_class'));
  var binario = clase.eq(2);
  return feature.set('binaria', binario);
});

// Entrenar el clasificador binario
var rf_glaciar = ee.Classifier.smileRandomForest(100).train({
  features: training_glaciar,
  classProperty: 'binaria',
  inputProperties: meanImage2023.bandNames()
});

// Obtener importancia de variables
var importancia_glaciar = ee.Dictionary(rf_glaciar.explain().get('importance'));
print('Importancia variables - Glaciar Cubierto', importancia_glaciar);

///// Morrena
var training_glaciar = training.map(function(feature) {
  var clase = ee.Number(feature.get('land_class'));
  var binario = clase.eq(3);
  return feature.set('binaria', binario);
});

// Entrenar el clasificador binario
var rf_glaciar = ee.Classifier.smileRandomForest(100).train({
  features: training_glaciar,
  classProperty: 'binaria',
  inputProperties: meanImage2023.bandNames()
});

// Obtener importancia de variables
var importancia_glaciar = ee.Dictionary(rf_glaciar.explain().get('importance'));
print('Importancia variables - Morrena', importancia_glaciar);

///// Agua
var training_glaciar = training.map(function(feature) {
  var clase = ee.Number(feature.get('land_class'));
  var binario = clase.eq(4);
  return feature.set('binaria', binario);
});

// Entrenar el clasificador binario
var rf_glaciar = ee.Classifier.smileRandomForest(100).train({
  features: training_glaciar,
  classProperty: 'binaria',
  inputProperties: meanImage2023.bandNames()
});

// Obtener importancia de variables
var importancia_glaciar = ee.Dictionary(rf_glaciar.explain().get('importance'));
print('Importancia variables - Agua', importancia_glaciar);

///// Abanico Aluvial
var training_glaciar = training.map(function(feature) {
  var clase = ee.Number(feature.get('land_class'));
  var binario = clase.eq(5);
  return feature.set('binaria', binario);
});

// Entrenar el clasificador binario
var rf_glaciar = ee.Classifier.smileRandomForest(100).train({
  features: training_glaciar,
  classProperty: 'binaria',
  inputProperties: meanImage2023.bandNames()
});

// Obtener importancia de variables
var importancia_glaciar = ee.Dictionary(rf_glaciar.explain().get('importance'));
print('Importancia variables - Abanico Aluvial', importancia_glaciar);

///// Coluvio
var training_glaciar = training.map(function(feature) {
  var clase = ee.Number(feature.get('land_class'));
  var binario = clase.eq(6);
  return feature.set('binaria', binario);
});

// Entrenar el clasificador binario
var rf_glaciar = ee.Classifier.smileRandomForest(100).train({
  features: training_glaciar,
  classProperty: 'binaria',
  inputProperties: meanImage2023.bandNames()
});

// Obtener importancia de variables
var importancia_glaciar = ee.Dictionary(rf_glaciar.explain().get('importance'));
print('Importancia variables - Coluvio', importancia_glaciar);

///// Afloramiento de Roca
var training_glaciar = training.map(function(feature) {
  var clase = ee.Number(feature.get('land_class'));
  var binario = clase.eq(7);
  return feature.set('binaria', binario);
});

// Entrenar el clasificador binario
var rf_glaciar = ee.Classifier.smileRandomForest(100).train({
  features: training_glaciar,
  classProperty: 'binaria',
  inputProperties: meanImage2023.bandNames()
});

// Obtener importancia de variables
var importancia_glaciar = ee.Dictionary(rf_glaciar.explain().get('importance'));
print('Importancia variables - Afloramiento de Roca', importancia_glaciar);

///// Llanura
var training_glaciar = training.map(function(feature) {
  var clase = ee.Number(feature.get('land_class'));
  var binario = clase.eq(8);
  return feature.set('binaria', binario);
});

// Entrenar el clasificador binario
var rf_glaciar = ee.Classifier.smileRandomForest(100).train({
  features: training_glaciar,
  classProperty: 'binaria',
  inputProperties: meanImage2023.bandNames()
});

// Obtener importancia de variables
var importancia_glaciar = ee.Dictionary(rf_glaciar.explain().get('importance'));
print('Importancia variables - Llanura', importancia_glaciar);


// --- Cálculo de incertidumbre usando entropía ---

// Reentrenar clasificador en modo MULTIPROBABILITY
var clasificadorEntropia = ee.Classifier.smileRandomForest(800)
    .setOutputMode('MULTIPROBABILITY')
    .train({
      features: trainingSet,
      classProperty: 'land_class', // Make sure 'land_class' is the correct property for your training data
      inputProperties: meanImage2023.bandNames() // Use the same input properties as your main classifier
    });

// Clasificación con probabilidades por clase
var clasificadaProb = meanImage2023.classify(clasificadorEntropia);

// Obtener clases únicas para nombrar las bandas de salida
var etiquetasClases = training_data.aggregate_array("land_class").distinct().sort(); // Using training_data to get all unique land_class values
// Convertir los valores numéricos a strings
var etiquetasClasesList = etiquetasClases.map(function(id){
  return ee.String(ee.Number(id).toInt()); // Convert each numeric ID to a string
});

// Aplanar arreglo de probabilidades a bandas individuales
var probasPorClase = clasificadaProb.arrayFlatten([etiquetasClasesList]);

// Calcular log(probabilidad)
var logProbs = probasPorClase.log();

// Calcular entropía: -Σ (p * log(p))
// Ensure the entropy band is named 'entropy'
var entropy = probasPorClase.multiply(logProbs).reduce(ee.Reducer.sum()).multiply(-1).rename('entropy');

// Visualizar en el mapa
Map.addLayer(entropy, {min: 0, max: 2, palette: ['white', 'yellow', 'red']}, 'Entropía');

// --- Extraer incertidumbre a los puntos de entrenamiento ---
// Assuming you have a FeatureCollection named 'training_data' which contains your training points
// and you want to extract the entropy value at those points.
var puntosConEntropia = training_data.map(function(pt) {
  var value = entropy.reduceRegion({
    reducer: ee.Reducer.first(), // Or ee.Reducer.mean(), depending on your preference for a single point
    geometry: pt.geometry(),
    scale: 30, // Make sure this matches your image scale
    maxPixels: 1e13
  }).get('entropy'); // Now 'entropy' key should exist because we named the band 'entropy'

  return pt.set('entropia', value);
});

print('Puntos con entropía:', puntosConEntropia);

// Exportar puntos con entropía a Drive
Export.table.toDrive({
  collection: puntosConEntropia,
  description: 'Puntos_con_Entropia',
  fileNamePrefix: 'Entropia_Puntos',
  fileFormat: 'CSV'
});


///// Visualizacion de imagen /////

// Filtro completo
var landsat = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2');
var landsat_filtro = landsat
  .filterBounds(Zona)
  .filterDate('2023-01-01', '2023-03-31')
  .filterMetadata('CLOUD_COVER', 'less_than', 5);

// Seleccionar la primera imagen del filtro
var imagen_filtrada = ee.Image(landsat_filtro.first());

// Comprobar si la imagen se cargó correctamente
if (imagen_filtrada) {
  print('Imagen cargada correctamente');
} else {
  print('No se encontraron imágenes que coincidan con el filtro.');
}

// Recortar la imagen a la geometría de la zona
var imagen_recortada = imagen_filtrada.clip(Zona);

// Asegurar que todas las bandas sean del tipo de dato 'UInt16'
var imagen_recortada_uint16 = imagen_recortada.toUint16();

// Parámetros de visualización mejorados (Color Natural)
var visualizacion_parametros_natural = {
  bands: ['SR_B4', 'SR_B3', 'SR_B2'],
  min: 7000,
  max: 32000,
  gamma: 1.2
};

// Visualizar la imagen recortada en Color Natural
Map.centerObject(Zona, 10);
Map.addLayer(imagen_recortada_uint16, visualizacion_parametros_natural, 'Landsat 8 - Color Natural Mejorado');

// Comprobar el número de imágenes disponibles después del filtro
print('Número de imágenes filtradas:', landsat_filtro.size());

// Inspeccionar las estadísticas de las bandas
var estadisticas = imagen_filtrada.reduceRegion({
  reducer: ee.Reducer.minMax(),
  geometry: Zona,
  scale: 30,
  bestEffort: true
});
print('Estadísticas de las bandas:', estadisticas);

// Exportar la imagen recortada a Google Drive (Color Natural)
Export.image.toDrive({
  image: imagen_recortada_uint16,
  description: 'Landsat_8_Color_Natural_Mejorado',
  folder: 'Mi_Carpeta_Drive',
  region: Zona,
  scale: 30,
  crs: 'EPSG:32719',
  fileFormat: 'GeoTIFF'
});

// Función para calcular el área de cada clase en hectáreas
var calculateArea = function(classifiedImage, year, classifier) {
  // Añadir el área de píxel (en m²) y la clasificación como bandas
  var areaImage = ee.Image.pixelArea().addBands(classifiedImage.rename('classification'));

  // Reducir por región agrupando por clase
  var areas = areaImage.reduceRegion({
    reducer: ee.Reducer.sum().group({
      groupField: 1, // 'classification' es el segundo (índice 1) en addBands
      groupName: 'class'
    }),
    geometry: Zona,
    scale: 30,
    maxPixels: 1e13
  });

  // Convertir a hectáreas y preparar la salida
  var areaHectares = ee.List(areas.get('groups')).map(function(feature) {
    var dict = ee.Dictionary(feature);
    return dict.set('area_ha', ee.Number(dict.get('sum')).divide(10000));
  });

  print('Área por clase en hectáreas (' + classifier + ' ' + year + '):', areaHectares);
};

// Ejecutar para tu clasificación actual (Random Forest 2023)
calculateArea(classifiedRF, 2023, 'RF'); 

// Exportación del RÁSTER DE ENTROPÍA para 2023 (NUEVA SECCIÓN)
Export.image.toDrive({
  image: entropy, // Asumiendo que tu imagen de entropía de 2023 se llama 'entropy'
  description: 'Entropia_Raster_2023', // Nombre para la tarea de exportación
  fileNamePrefix: 'Entropia_2023',    // Nombre del archivo en Drive
  scale: 30,                          // Resolución de 30 metros (Landsat)
  region: Zona,                       // Recortar a tu zona de estudio
  maxPixels: 1e12,
  folder: 'GEE_Exports',             // Puedes mantener la misma carpeta o crear una nueva
  fileFormat: 'GeoTIFF'
});
