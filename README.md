Análisis de Cambios Geomorfológicos en los Valles Las Arenas y Río Colina mediante Clasificación Supervisada (1991–2023)

Este repositorio reúne los códigos utilizados para analizar los cambios geomorfológicos en los valles Las Arenas y Río Colina, ambos tributarios del río Volcán, en la cuenca alta del Maipo (Andes centrales de Chile), durante las últimas tres décadas.
El estudio se desarrolló mediante clasificación supervisada de imágenes satelitales Landsat 5 y 8 en Google Earth Engine (GEE), utilizando algoritmos de Machine Learning para generar mapas geomorfológicos multitemporales.

🎯 Objetivo del estudio

Evaluar la transformación del paisaje en los valles Las Arenas y Río Colina entre los años 1991, 2006 y 2023, con el fin de comprender la dinámica geomorfológica reciente asociada al retroceso glaciar, los procesos paraglaciares y los efectos del cambio climático y la megasequía en la cordillera andina central.

💻 Scripts incluidos

clasificacion_landsat5.js: Clasificación supervisada con imágenes Landsat 5 TM para los años 1991 y 2006.

clasificacion_landsat8.js: Clasificación supervisada con imágenes Landsat 8 OLI para el año 2023.

Ambos scripts utilizan los algoritmos Random Forest (RF) y Support Vector Machine (SVM), ampliamente aplicados en teledetección para la identificación de coberturas y unidades geomorfológicas.

🗺️ Clases geomorfológicas consideradas

Se definieron ocho clases principales, basadas en cartografía y literatura especializada sobre ambientes de montaña:

Glaciar descubierto

Glaciar cubierto por detritos

Morrena

Llanura de inundación

Coluvios

Abanicos aluviales

Afloramientos rocosos

Agua

Estas clases permitieron comparar la evolución geomorfológica de los valles y evidenciar la transición desde un paisaje glacial hacia un entorno predominantemente paraglacial, caracterizado por un aumento de depósitos detríticos y coluviales.

📈 Principales resultados

Los resultados muestran:

Alta precisión de clasificación (OA > 90%) para todos los periodos.

Cambios geomorfológicos limitados entre 1991 y 2006, pero acelerados entre 2006 y 2023, coincidiendo con la megasequía.

Transición progresiva de glaciares descubiertos a glaciares cubiertos, morrenas y coluvios.

Activación de nuevas fuentes de sedimentos en áreas proglaciares, lo que podría influir en la hidrología y dinámica sedimentaria aguas abajo.

⚙️ Requisitos para ejecución

Para correr los scripts es necesario:

Una cuenta activa en Google Earth Engine

Cargar los scripts en el editor de GEE

Definir una región de interés (ROI) correspondiente a los valles Las Arenas y Río Colina

Incorporar muestras de entrenamiento para cada clase geomorfológica

🌍 Importancia del estudio

Ambos valles constituyen áreas clave para el monitoreo de la criósfera y los procesos de ajuste paraglacial en los Andes semiáridos.
El trabajo demuestra el potencial de las herramientas de teledetección y aprendizaje automático para cuantificar cambios geomorfológicos a escala decadal y generar información útil para la gestión ambiental, la hidrología de montaña y la evaluación de riesgos naturales.

📜 Licencia

Este proyecto se distribuye bajo la Licencia MIT y puede utilizarse con fines académicos y de investigación, citando la fuente correspondiente.
El código fue desarrollado por Diego Lorca y Paula Cortés, bajo la supervisión de Hugo Neira.

