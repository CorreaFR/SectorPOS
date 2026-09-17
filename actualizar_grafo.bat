@echo off
echo ========================================================
echo   Actualizando Grafo de Conocimiento y Vault de Obsidian
echo                   Proyecto: SectorPOS
echo ========================================================
echo.

echo [1/3] Extrayendo entidades y relaciones (AST)...
call graphify extract . --code-only

echo.
echo [2/3] Agrupando comunidades y generando reporte...
call graphify cluster-only .

echo.
echo [3/3] Exportando notas y canvas a Obsidian...
call graphify export obsidian

echo.
echo ========================================================
echo   Grafo y boveda de Obsidian actualizados con exito.
echo   Ruta de la boveda: graphify-out\obsidian
echo   Visualizador HTML: graphify-out\graph.html
echo ========================================================
pause
