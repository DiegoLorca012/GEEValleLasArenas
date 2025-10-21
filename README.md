Análisis de Cambios Geomorfológicos en el Valle Las Arenas mediante Clasificación Supervisada (1991–2023)
Este repositorio reúne los códigos utilizados para analizar los cambios geomorfológicos en el Valle Las Arenas, ubicado en los Andes centrales de Chile, durante las últimas tres décadas. El estudio se desarrolló mediante clasificación supervisada de imágenes satelitales en Google Earth Engine (GEE) utilizando algoritmos de Machine Learning.
El objetivo principal de este trabajo es evaluar la transformación del paisaje en el Valle Las Arenas entre los años 1991, 2006 y 2023, con el fin de comprender la dinámica geomorfológica reciente asociada a procesos glaciares y paraglaciares, así como los efectos del cambio climático y la megasequía en la cordillera andina.
El repositorio incluye dos scripts desarrollados en Google Earth Engine:
clasificacion_landsat5.js: contiene el código para la clasificación supervisada utilizando imágenes Landsat 5 TM correspondientes a los años 1991 y 2006.
clasificacion_landsat7.js: contiene el código para la clasificación supervisada utilizando imágenes Landsat 7 ETM+ correspondientes al año 2023.
Para la clasificación se emplearon los algoritmos Random Forest (RF) y Support Vector Machine (SVM), ampliamente utilizados en estudios de teledetección para identificar coberturas y unidades geomorfológicas. Se definieron las siguientes siete clases geomorfológicas, basadas en literatura especializada en ambientes de montaña:
Glaciar descubierto, glaciar cubierto, morrena, Llanura de inundacion, coluvios, abanicos aluviales, afloramiento de roca y agua.
Estas clases permitieron realizar una comparación multitemporal que evidencia la transición del paisaje desde condiciones dominadas por hielo hacia un entorno paraglacial. Los resultados obtenidos indican un retroceso progresivo del hielo glaciar y un aumento en áreas asociadas a procesos de remoción y transporte de sedimentos, lo que refleja una respuesta directa a condiciones climáticas más cálidas y secas en el centro de Chile en las últimas décadas.
Requisitos para ejecución:
- Para ejecutar los scripts es necesario contar con:

- Una cuenta activa en Google Earth Engine

- Cargar en el editor de GEE los scripts del repositorio

- Definir una región de interés (ROI) correspondiente al Valle Las Arenas

- Incorporar muestras de entrenamiento para cada clase geomorfológica

Importancia del estudio

El Valle Las Arenas es un área clave para monitorear la criósfera en los Andes subtropicales. Este análisis demuestra cómo las herramientas de teledetección y Machine Learning permiten cuantificar de forma eficiente los cambios geomorfológicos y generar información relevante para la gestión ambiental, estudios de glaciares y evaluación de riesgos naturales en zonas de montaña.

Licencia

Este proyecto está disponible bajo la licencia MIT y puede utilizarse con fines académicos y de investigación citando la fuente correspondiente.
