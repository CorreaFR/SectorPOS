### ¿Qué es este proyecto?
> *Una aplicación web moderna de Punto de Venta (POS) y gestión comercial.*
>
> *Aparte de resolver demoras en la fila de cobro, desfasajes de stock y falta de métricas para tomar decisiones, al ser web y en la nube tambien resuelve caidas de sistema y facilita el acceso a un primer punto de venta para comercios nuevos o de bajos recursos.*
>
> *El sistema cuenta con una **arquitectura en capas N-Tier** con backend en **.NET 8** y frontend SPA en **React con TypeScript**. Implementa:*
> 1. *Una terminal de cobro rápido optimizada para código de barras y teclado con cálculo de vuelto y emisión de ticket.*
> 2. *Un módulo completo de gestión de inventario (ABM de productos) con reposición rápida y control de stock crítico.*
> 3. *Un centro de reportes y dashboard en tiempo real con KPIs de facturación y ranking de los más vendidos.*
> 4. *Seguridad y control de acceso por roles (RBAC) que diferencia a los Cajeros de los Administradores.*
>
> *Todo el desarrollo se estructuró bajo el paradigma de **Programación Orientada a Objetos** y la metodología del **Proceso Unificado / Scrum**, cumpliendo los 14 puntos de la guía y los anexos de arquitectura y seguridad."*


### ¿Cuál es el Backend y cuál es el Frontend?

- **Backend:**
  - **Tecnología:** C# sobre **Microsoft .NET 8** (ASP.NET Core Web API).
  - **Persistencia:** **Entity Framework Core 8** con motor relacional **SQLite**.
  - **Organización:** Solución modular dividida en 3 capas desacopladas:
    1. `SectorPOS.API`: Controladores RESTful (`VentasController`, `ProductosController`, `ReportesController`, `AuthController`) que exponen los endpoints HTTP y documentan con Swagger.
    2. `SectorPOS.Business`: Lógica de negocio pura, servicios (`VentaService`, `ReporteService`), interfaces y DTOs (Data Transfer Objects).
    3. `SectorPOS.Data`: Contexto de base de datos (`SectorPOSDbContext`), migraciones de EF Core y Entidades del Dominio (`Producto`, `Venta`, `DetalleVenta`, `Usuario`).

- **Frontend:**
  - **Tecnología:** **React 19** con **TypeScript** y **Tailwind CSS**, empaquetado con **Vite**.
  - **Arquitectura:** Single Page Application (SPA) reactiva y basada en componentes.
  - **Estética:** Interfaz profesional en modo oscuro (*Dark Fintech*), diseñada ergonómicamente para evitar la fatiga visual del cajero.
  - **Comunicación:** Cliente HTTP mediante **Axios** consumiendo la API REST del backend de forma asíncrona (`async/await`).


### ¿Cuál es el Requerimiento Core del proyecto?

- **Nombre del Requerimiento:** **"Registrar Venta en Mostrador con Deducción de Stock Atómica"** (Punto 12 de la guía).
- **¿Por qué es el Core?:** Porque es el corazón del negocio del comercio. Si la venta falla o descuenta mal el inventario, todo el sistema pierde confiabilidad.
- **¿Cómo está implementado técnicamente?:**
  - Implementa **transacciones ACID** en el backend mediante `using var transaction = await _context.Database.BeginTransactionAsync();`.
  - **Paso 1:** Valida que cada producto exista, esté activo y tenga stock suficiente (`p.StockActual >= detalle.Cantidad`).
  - **Paso 2:** Si algún producto no tiene stock, aborta de inmediato con `await transaction.RollbackAsync();` y devuelve un HTTP 400 Bad Request explicando el error.
  - **Paso 3:** Si todo está en regla, descuenta el stock en memoria (`p.StockActual -= detalle.Cantidad`).
  - **Paso 4:** Registra la cabecera de la `Venta` vinculada al `UsuarioId` del cajero logueado, y los `DetalleVenta` congelando el precio histórico unitario.
  - **Paso 5:** Guarda los cambios (`SaveChangesAsync`) y confirma la transacción (`await transaction.CommitAsync();`).
  - **Paso 6:** En el frontend se emite el ticket térmico digital en pantalla con vuelto, medio de pago y detalle desglosado.


### ¿Cuál es el CRUD del sistema?

- **Entidad administrada por el CRUD:** **`Producto` / Inventario de Mercaderías**.
- **Dónde se encuentra en pantalla:** En la pestaña **`Inventario & ABM`** (disponible para el Administrador).
- **Las 4 operaciones del CRUD:**
  - **C (Create - Alta):** Botón `"+ Nuevo Producto"`. Abre un modal que solicita nombre, código de barras único, precio de venta, stock inicial y límite de stock crítico.
  - **R (Read - Lectura/Consulta):** Tabla de catálogo con filtros dinámicos (*Todos, Activos, Stock Crítico, Inactivos*) y buscador en tiempo real por nombre o código.
  - **U (Update - Modificación & Reposición):**
    - Modal de **Editar**: Permite modificar nombre, precio unitario y umbral de alerta crítica.
    - Modal de **Reponer Stock**: Botones de carga rápida (+5, +10, +25, +50, +100 unidades) para sumar existencias físicas.
  - **D (Delete - Baja):** Se implementó mediante **Baja Lógica (Soft Delete)** con la propiedad booleana `Activo`. Por qué no hiciste un `DELETE` físico de SQL, la respuesta es:
    > *"Profesor, en un sistema transaccional comercial no se deben borrar físicamente las filas de la base de datos, porque si elimino un producto que ya fue vendido en el pasado, rompería la integridad referencial de los históricos de ventas y reportes contables. Por eso se usa baja lógica con un toggle de activación."*


## 3. MAPA RÁPIDO:

| **La transacción de venta y descuento de stock** | `SectorPOS.Business\Services\VentaService.cs` | Método `RegistrarVentaAsync`: muestra `BeginTransactionAsync`, el bucle de validación de stock y `CommitAsync`. |
| **Las Entidades de Base de Datos (POO)** | `SectorPOS.Data\Entities\` (`Producto.cs`, `Venta.cs`, `DetalleVenta.cs`, `Usuario.cs`) | Propiedades, tipos de datos (`decimal`, `int`, `DateTime`) y relaciones de navegación de EF Core. |
| **La configuración de la BD y SQLite** | `SectorPOS.Data\Context\SectorPOSDbContext.cs` | El `DbSet<>`, la configuración de clave única en `CodigoBarras` y las relaciones 1 a N en `OnModelCreating`. |
| **El Controller de Ventas** | `SectorPOS.API\Controllers\VentasController.cs` | Endpoint `[HttpPost]` que recibe el DTO y llama al servicio inyectado por interfaz (`IVentaService`). |
| **El Controller de Productos (CRUD)** | `SectorPOS.API\Controllers\ProductosController.cs` | Endpoints `GET`, `POST`, `PUT`, `DELETE` (toggle activo) y `reponer-stock`. |
| **El Controller de Reportes y KPIs** | `SectorPOS.API\Controllers\ReportesController.cs` | Endpoint `GET api/reportes/dashboard` que devuelve la facturación de hoy, ranking y gráficos. |
| **El Controller de Login y Roles** | `SectorPOS.API\Controllers\AuthController.cs` | Endpoint `POST api/auth/login` que valida credenciales y devuelve el usuario con su rol. |
| **La Inyección de Dependencias** | `SectorPOS.API\Program.cs` | Líneas `builder.Services.AddScoped<IVentaService, VentaService>();` y configuración de SQLite. |
| **La pantalla del POS (Caja Registradora)** | `SectorPOS.Frontend\src\pages\POSPage.tsx` | Carro de compras, lector de código de barras, modal de ticket y cálculo de vuelto. |
| **La pantalla de Inventario & ABM** | `SectorPOS.Frontend\src\pages\InventarioPage.tsx` | Tabla con badges de stock crítico, modales de alta, edición y reposición. |
| **El Dashboard de Reportes** | `SectorPOS.Frontend\src\pages\DashboardPage.tsx` | Tarjetas de KPIs, gráfico SVG/CSS de 7 días y ranking Top 5. |
| **La pantalla de Login y Roles** | `SectorPOS.Frontend\src\pages\LoginPage.tsx` | Formulario de autenticación con botones demo rápidos para Cajero y Admin. |
| **El ruteo y control de roles (RBAC)** | `SectorPOS.Frontend\src\App.tsx` | Validación `isAdmin`, bloqueo de pestañas para cajero y botón de cerrar sesión. |
| **El Documento Académico Completo** | `SectorPOS_Documentacion_Final.md` | Los 14 puntos de la guía, diagramas UML (Casos de Uso, Secuencia, Clases, Estados, DER) y anexos. |


## 4. PREGUNTAS TÍPICAS:

### P1: "¿Por qué utilizaste una Arquitectura en Capas en lugar de poner todo en los Controladores?"
> *"Para cumplir con los principios **SOLID**, en particular el de Responsabilidad Única (SRP) y el de Inversión de Dependencias (DIP).  
> Los Controladores en `SectorPOS.API` son delgados (*thin controllers*): solo se encargan de recibir la petición HTTP, validar el DTO y devolver el código de estado (200, 400, 500).  
> Toda la regla de negocio crítica (como calcular totales, validar stock y manejar transacciones) vive en `SectorPOS.Business`. Esto permite que si el día de mañana cambiamos la API REST por gRPC, GraphQL o una app de consola, la lógica de negocio se reutiliza intacta y es 100% testeable con pruebas unitarias."*


### P2: "¿Dónde aplicaste el Paradigma Orientado a Objetos (POO)?"
> *"Se aplicó en todo el ciclo de vida del backend:*
> - * **Encapsulamiento:** Entidades de dominio ricas (`Venta`, `Producto`, `Usuario`) que protegen su estado y exponen métodos de negocio como `TieneStock()`, `DescontarStock()` o `CalcularTotal()`, separadas de los DTOs de transporte.*
> - * **Abstracción:** Uso de interfaces como `IVentaService` e `IReporteService` que ocultan la implementación interna a los controladores.*
> - * **Polimorfismo e Inyección de Dependencias:** El contenedor de .NET resuelve dinámicamente las dependencias en tiempo de ejecución, facilitando la modularidad.*
> - * **Composición:** Una `Venta` se compone estrictamente de una colección de `DetalleVenta` vinculados por llaves foráneas."*


### P3: "¿Cómo asegurás la concurrencia si dos cajeros venden el mismo producto simultáneamente?"
> *"Mediante **transacciones explícitas con aislamiento ACID** en Entity Framework Core y SQLite.  
> Cuando el servicio inicia `BeginTransactionAsync()`, las operaciones de lectura, validación de stock y actualización ocurren de forma atómica. Si dos cajeros intentan vender la última unidad al mismo instante, la base de datos serializa la transacción: la primera que confirma reduce el stock a 0, y la segunda transacción al verificar que `StockActual < Cantidad` ejecuta un `RollbackAsync()`, devolviendo un error HTTP 400 al segundo cajero y previniendo que el stock quede en números negativos (*race conditions*)."*


### P4: "¿Qué seguridad implementaste? ¿Qué puede y qué no puede hacer cada rol?"
> *"Implementé **Control de Acceso Basado en Roles (RBAC - Anexo 15.2)**:*
> - * **Rol Vendedor (Cajero):** Su interfaz está restringida exclusivamente a la terminal de cobro (`Punto de Venta`). No puede ver los reportes financieros, ni los márgenes de ganancia, ni modificar precios de venta, ni dar de baja productos.*
> - * **Rol Administrador:** Tiene acceso irrestricto a los 3 módulos: Punto de Venta, Inventario & ABM y Dashboard de Reportes.*
> - * Además, cada venta guarda en su cabecera el `UsuarioId` del operador que la registró para fines de auditoría."*


### P5: "¿Qué metodología de desarrollo aplicaste?"
> *"Utilicé una combinación ágil de **Scrum y las fases del Proceso Unificado (Inicio, Elaboración, Construcción y Transición)**:*
> - * **Inicio:** Relevamiento del problema, alcance y definición de requerimientos (RF y RNF).*
> - * **Elaboración:** Diseño de la arquitectura en capas y modelado formal de casos de uso y diagrama de clases.*
> - * **Construcción (Sprint 1 - Core):** Iteración centrada en el requerimiento core: 'Registrar Venta' con persistencia transaccional.*
> - * **Construcción (Sprint 2 - Módulos de soporte):** Inventario ABM, métricas analíticas y seguridad RBAC.*
> - * **Transición:** Pruebas integradas, validación de criterios de aceptación y redacción del informe técnico final."*


### P6: "¿Qué reportes genera el sistema y para qué le sirven al dueño?"
> *"El módulo de reportes (`DashboardPage` / `ReporteService`) provee 4 indicadores esenciales para la toma de decisiones:*
> 1. * **Facturación del Día y Cantidad de Ventas:** Para el arqueo y control de caja diario sin esperar a cierres por lotes.*
> 2. * **Ticket Promedio:** Relación recaudación/ventas para evaluar si los clientes están gastando más o menos por compra.*
> 3. * **Gráfico de Tendencia de los Últimos 7 Días:** Para detectar qué días de la semana hay picos o valles de afluencia.*
> 4. * **Top 5 Productos Más Vendidos:** Permite al comerciante saber qué mercadería tiene mayor rotación para planificar compras a proveedores.*
> 5. * **Alertas de Stock Crítico:** Detecta productos a punto de agotarse antes de que se produzca el quiebre de stock."*


## 5. COMANDOS PARA INICIAR EL SISTEMA RÁPIDAMENTE (powershell)

  - **Terminal 1 (Backend):**
    cd e:\Desarrollo\Proyectos\SectorPOS\SectorPOS.API
    dotnet run
    *(Inicia en `http://localhost:5129`)*

  - **Terminal 2 (Frontend):**
    cd e:\Desarrollo\Proyectos\SectorPOS\SectorPOS.Frontend
    npm run dev
    *(Inicia en `http://localhost:5173`)*


## 6. GUÍA PARA LA DEMO EN VIVO
### Paso 1: Mostrar el Login y el modo Cajero
1. Abre `http://localhost:5173`.
2. Haz clic en el botón rápido **"Cajero"** y pulsa **"Iniciar Sesión"**.
3. Muéstrale al profesor:
   > *"Mire profesor, inicié como Cajero (`caja@sectorpos.com`). Arriba aparece el badge esmeralda de Vendedor, y solo tengo disponible la pestaña de Punto de Venta. Las pestañas de Inventario y Reportes están ocultas y bloqueadas para este rol."*

### Paso 2: Ejecutar una Venta en el POS (Requerimiento Core)
1. Escribe en la búsqueda `"Coca"` o pulsa directamente sobre un producto (ej. Coca-Cola o Alfajor).
2. Agrega 2 unidades al carro.
3. Haz clic en el botón verde **"Proceder al Cobro"**.
4. Ingresa el monto recibido (ej. si sale $2.800, pon $3.000) y muestra cómo el sistema calcula el vuelto exacto ($200).
5. Haz clic en **"Confirmar Cobro"**.
6. Se abrirá el modal con el ticket térmico formal emitido.
   > *"Aquí se ejecutó la transacción ACID en .NET 8: se guardó la venta, se congelaron los precios unitarios y se descontaron exactamente 2 unidades del stock en SQLite."*

### Paso 3: Cerrar sesión y entrar como Administrador
1. Pulsa **"Cerrar Sesión"** en la esquina superior derecha.
2. Haz clic en el botón rápido **"Administrador"** y pulsa **"Iniciar Sesión"**.
3. Muéstrale al profesor:
   > *"Ahora que entré como Administrador, el sistema me habilita las pestañas de **Inventario & ABM** y de **Reportes & Métricas**."*

### Paso 4: Mostrar el Inventario (CRUD y reposición)
1. Entra a **"Inventario & ABM"**.
2. Muéstrale los filtros (*Todos, Activos, Stock Crítico*).
3. Haz clic en **"Reponer"** en cualquier producto y suma `+10` unidades para mostrar la reactividad instantánea.
4. Explícale la baja lógica con el botón toggle.

### Paso 5: Mostrar el Dashboard de Reportes
1. Entra a **"Reportes & Métricas"**.
2. Muéstrale cómo la venta que acabas de hacer ya impactó en:
   - La facturación de hoy.
   - El contador de ventas.
   - El ticket promedio.
   - El ranking de los 5 productos más vendidos.
   - La barra del gráfico de los últimos 7 días.



