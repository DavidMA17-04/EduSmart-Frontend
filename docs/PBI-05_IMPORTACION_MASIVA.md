# PBI-05 — Importación masiva de estudiantes

## Alcance

Alta de estudiantes en lote desde un archivo Excel o CSV:

`Administrativo > Usuarios > Agregar usuarios > Importación masiva`
Ruta: `/admin/users/import/bulk` (solo Administrador).

## Flujo

1. El administrador descarga la plantilla oficial (`.xlsx` o `.csv`) o usa su propio archivo con los encabezados de la tabla de columnas.
2. **Validar y procesar** → `POST /api/v1/bulk-import/validate` (multipart, campo `file`, máx. 10 MB). No guarda nada.
3. El modal de vista previa muestra KPIs, inconsistencias y la tabla editable. Cada fila indica el grupo destino de su sección.
4. **Continuar e importar** envía solo las filas en estado Válido a `POST /api/v1/bulk-import/confirm`.
5. El servidor **revalida todo el lote**. Si alguna fila falla, no importa nada y la vista previa marca esas filas.
6. Si todo es correcto: crea usuarios, rol Estudiante, matrículas y auditoría en **una sola transacción**. Después envía los correos con la contraseña temporal.
7. El resumen final muestra los importados, los matriculados y la lista de los que quedaron sin matrícula.

## Columnas

Los encabezados no distinguen mayúsculas ni tildes. Se aceptan los alias de la tabla.

| Columna (alias) | Obligatoria | Regla |
|---|---|---|
| `identificacion` (`cedula`, `national_id`) | Sí | Entre 9 y 30 dígitos; los guiones se ignoran. Única en el archivo y en el sistema. |
| `nombres` (`nombre`, `name`) | Sí | Texto libre. |
| `primer_apellido` (`apellido1`, `apellidos`, `first_lastname`) | Sí | Si se usa `apellidos`, el texto completo queda como primer apellido. |
| `segundo_apellido` (`apellido2`, `second_lastname`) | No | Texto libre. |
| `correo` (`email`, `correo_institucional`) | Sí | Formato válido. Único en el archivo y en el sistema. |
| `rol` (`role`) | No | Vacío o `Estudiante`. Cualquier otro rol es error. |
| `seccion` (`seccion_academica`, `section`) | No | Nombre del grupo (ej. `10-1`). Ver la sección Matrícula. |
| `telefono` (`celular`, `phone`) | No | Menos de 8 dígitos genera una advertencia. |
| `estado` (`status`) | No | `Activo` (por defecto), `Inactivo` o `Bloqueado`. |

## Matrícula por sección

- La sección se compara con los **grupos activos de cursos lectivos en estado ACTIVO**. La comparación ignora mayúsculas, tildes y espacios repetidos.
- **Coincide con un único grupo y el usuario está Activo:** queda matriculado en ese grupo. La matrícula inicia en la fecha mayor entre hoy y el inicio del curso lectivo, y se respeta el cupo del grupo.
- **No coincide, coincide con varios grupos o el usuario no está Activo:** es una advertencia. El usuario se crea **sin matrícula** y aparece en el resumen final con el motivo. Se asigna después desde Gestión de secciones.
- Si el lote supera el cupo restante de algún grupo, la confirmación responde **409** y no importa nada.

## Respuestas de la confirmación

| Código | Cuándo | Cuerpo |
|---|---|---|
| 201 | Lote importado | `importedCount`, `enrolledCount`, `notEnrolled[] { row, email, reason }`, `message` |
| 400 | Algún registro no supera la revalidación: obligatorios, formato, rol o estado | `code: BULK_IMPORT_INVALID_ROWS`, `rows[] { row, invalidFields, errorMessages }` |
| 409 | Cédula o correo duplicado en el lote o en el sistema; duplicado concurrente detectado por la BD; cupo excedido | `code: BULK_IMPORT_DUPLICATE` o `GROUP_CAPACITY_EXCEEDED`, `rows[]` cuando aplica |

## Auditoría

Cada usuario importado deja un evento `USER_CREATED` en `audit_logs`. El actor es el administrador que confirmó, y el evento registra el origen `BULK_IMPORT` y el grupo de matrícula (o `null`). No se registran contraseñas.

## Seguridad

- Solo usuarios con rol Administrador pueden validar o confirmar.
- Cada usuario recibe una contraseña temporal propia (bcrypt) con `must_change_password = true`.
- Si falla el envío de correo, el usuario ya creado se conserva; si falla la transacción, no se envía ningún correo.

## Checklist QA manual

- [ ] Un CSV con 3 filas válidas y sección existente importa 3 usuarios y matricula 3.
- [ ] Una fila con sección inexistente aparece como advertencia en la vista previa. Si se corrige a una sección válida, queda matriculada.
- [ ] Un correo ya registrado da error en la vista previa. Si se fuerza vía API, la respuesta es 409 sin crear a nadie.
- [ ] Un grupo con cupo lleno responde 409 y no deja usuarios a medias.
- [ ] `audit_logs` contiene un `USER_CREATED` por usuario importado.
