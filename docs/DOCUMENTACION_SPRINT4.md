# Documentación técnica — Sprint 4, módulo disciplinario

Prefijo de la API: `/api/v1`. Todas las rutas exigen sesión. El prefijo de recurso es `/disciplinary`.

Cuando una ruta no lleva un permiso en el decorador, el acceso lo decide el servicio: basta `disciplinary.view` o `disciplinary.view_own`, y después se aplica el alcance del actor. Exigir los dos a la vez sería incorrecto.

Los estados se guardan en inglés y se muestran en español.

## Endpoints

| Método y ruta | Quién pasa el guardia | Qué hace |
|---|---|---|
| `GET /students?q=` | `disciplinary.create` | Busca estudiantes con sección activa. Mínimo 2 caracteres. |
| `POST /cases` | `disciplinary.create` | Registra la amonestación y abre el expediente `AM-AAAA-NNNN`. |
| `GET /infraction-types/options` | `disciplinary.create` | Tipos activos para el formulario de registro. |
| `GET /cases` | alcance | Bandeja con filtros y vencimiento del paso. |
| `GET /cases/:id` | alcance | Detalle, cronología filtrada y plazo. |
| `GET /students/:studentId/history` | alcance | Historial y nota de conducta del período. |
| `POST /cases/:id/investigation` | conductor | Pasa a En investigación y abre 10 días hábiles. |
| `POST /cases/:id/observations` | conductor | Observación de la investigación. |
| `POST /cases/:id/information-requests` | conductor | Pide información a quien reportó. |
| `POST /cases/:id/information-requests/response` | quien reportó | Responde esa solicitud. |
| `POST /cases/:id/counsel-requests` | conductor | Pide criterio de Orientación. No detiene el expediente. |
| `POST /cases/:id/counsel-opinions` | `disciplinary.review` | Emite el criterio. Solo si hay una solicitud pendiente. |
| `POST /cases/:id/formal-communication` | conductor | Comunica el cargo y abre el descargo. |
| `POST /cases/:id/formal-communication/physical` | conductor | Lo mismo cuando no hay encargado vinculado. |
| `POST /cases/:id/archive` | conductor | Archiva por falta de mérito durante la investigación. |
| `POST /cases/:id/resolution` | conductor | Desestima, Modifica o Mantiene. Fundamentación de al menos 50 caracteres. |
| `POST /cases/:id/annulment` | `disciplinary.configure` | Anula con justificación y auditoría. |
| `POST /cases/:id/evidences` | `disciplinary.create` | Adjunta PDF, JPG o PNG. Máximo 5 archivos y 10 MB. |
| `GET /cases/:id/evidences/:evidenceId/file` | alcance | Descarga la evidencia. No hay ruta pública. |
| `GET /notifications/mine` | encargado vinculado | Bandeja y contador de no leídas. |
| `POST /notifications/:id/read` | encargado de esa notificación | Confirma la lectura. No se puede deshacer. |
| `POST /cases/:id/defenses` | `disciplinary.respond` | Descargo del portal, hasta 3 adjuntos, dentro del plazo. |
| `POST /cases/:id/defenses/written` | conductor | Descargo entregado por escrito. |
| `POST /cases/:id/communications/:communicationId/delivery` | conductor | Entrega por cuaderno o en persona, con acuse opcional. |
| `GET /cases/:id/communications/:communicationId/pdf` | alcance | Carta de una página para imprimir. |
| `POST /cases/:id/revocations` | encargado o responsable | Revocatoria. Puede incluir apelación en subsidio. |
| `POST /cases/:id/appeals` | encargado o responsable | Apelación después de un rechazo, si no iba en subsidio. |
| `POST /cases/:id/revocations/:appealId/resolution` | `disciplinary.resolve` y quien dictó el acto | Acoge o Rechaza. Fundamentación de al menos 20 caracteres. |
| `POST /cases/:id/appeals/:appealId/resolution` | `disciplinary.appeal` | Acoge, Acoge parcialmente o Rechaza. |
| `POST /cases/:id/precautionary-measures` | `disciplinary.precautionary` | Retiro de Dirección. Máximo 10 días naturales. No cambia la nota. |
| `POST /cases/:id/follow-ups` | guía, Orientación o Dirección | Seguimiento del expediente. |
| `POST /cases/:id/follow-ups/:followUpId/outcome` | el mismo alcance | Cumplido o incumplido. |
| `GET /dashboard` | `disciplinary.view` o docente guía | Totales, plazos y alertas. El guía solo ve sus secciones. |
| `GET /alerts` | el mismo alcance del listado | Reincidencia, nota, plazos, lectura sin confirmar, sección sin guía y año sin feriados. |
| `GET /cases/export/excel` y `/pdf` | `disciplinary.export` | Listado, con el alcance del actor. |
| `GET /students/:studentId/history/export/excel` y `/pdf` | `disciplinary.export` | Historial de un estudiante. |
| `GET /cases/:id/export/pdf` | `disciplinary.export` | Expediente. |
| `GET /severity-rules` | `disciplinary.view` | Escala fija y vía procesal. |
| `GET /infraction-types` y `/:id` | `disciplinary.view` | Catálogo. |
| `POST`, `PATCH` y `DELETE /infraction-types` | `disciplinary.configure` | Alta, edición y desactivación. No borra la fila. |
| `GET /infraction-types/export/excel` y `/pdf` | `disciplinary.export` | Catálogo exportado. |
| `GET`, `POST` y `DELETE /non-working-days` | `disciplinary.configure` | Calendario institucional. |
| `GET` y `PUT /settings` | `disciplinary.configure` | Umbrales de reincidencia y de nota. |

El conductor es el docente guía responsable del expediente, Dirección o el administrador. Un docente que no es el guía recibe 403 al intentar conducir la investigación.

## Matriz de permisos

| Permiso | Docente | Orientador | Director | Encargado y Padre de familia | Estudiante | Administrador |
|---|---|---|---|---|---|---|
| `disciplinary.create` | sí | | | | | sí |
| `disciplinary.view_own` | sí | | | sí | sí | sí |
| `disciplinary.view` | | sí | sí | | | sí |
| `disciplinary.review` | | sí | | | | sí |
| `disciplinary.resolve` | sí | | | | | sí |
| `disciplinary.appeal` | | | sí | | | sí |
| `disciplinary.precautionary` | | | sí | | | sí |
| `disciplinary.respond` | | | | sí | | sí |
| `disciplinary.export` | | sí | sí | | | sí |
| `disciplinary.configure` | | | | | | sí |

El administrador tiene el catálogo completo. Docente no tiene `disciplinary.view`: ve lo que reportó y las secciones donde es guía. Orientador, Director y Administrador ven todos los expedientes.

El criterio de Orientación y la identidad de los testigos los ven Orientación, Dirección, el administrador y el responsable del expediente. El encargado y el estudiante ven hechos, comunicación, resolución, recursos y rebajo.

## Estados y plazos

El conteo de un plazo empieza el día hábil siguiente. Se saltan sábados, domingos y los días de `non_working_days`. La zona es America/Costa_Rica. El vencimiento se calcula al leer, así que un feriado nuevo corre los plazos abiertos sin migrar filas.

Indicador: en plazo, por vencer cuando queda un día hábil o menos, y vencido.

### Debido proceso (grave, muy grave y gravísima)

| De | Hacia |
|---|---|
| Reportada | En investigación, Anulada |
| En investigación | Comunicada, Desestimada, Anulada |
| Comunicada | Pendiente de resolución, Anulada |
| Pendiente de resolución | Resuelta, Anulada |
| Resuelta | En recurso, Firme, Desestimada, Anulada |
| En recurso | Firme, Desestimada, Anulada |
| Firme | Anulada |
| Desestimada y Anulada | sin salida |

| Reloj | Días | Cuándo empieza |
|---|---|---|
| Reporte | 5 hábiles desde el hecho | Si se pasa, el registro sigue y queda marcado como extemporáneo, con justificación. |
| Investigación | 10 hábiles | Al iniciarla. |
| Descargo | 3 hábiles | Al comunicar el cargo. Si vence sin descargo, pasa a Pendiente de resolución con la marca «Sin descargo». |
| Resolución | 5 hábiles | Al quedar pendiente de resolución. |
| Revocatoria, para interponerla | 3 hábiles | Desde la notificación del acto. |
| Revocatoria, para resolverla | 3 hábiles | Al interponerla. |
| Apelación, para interponerla | 3 hábiles | Desde el rechazo de la revocatoria, si no iba en subsidio. |
| Apelación, para resolverla | 8 hábiles | Al elevarla. Si iba en subsidio, se eleva sola al rechazar la revocatoria. |
| Lectura sin confirmar | 2 hábiles | Desde el envío de la comunicación, si `read_at` sigue vacío. El aviso dice «Notificación sin confirmar». |

La comunicación formal no abre un reloj distinto del descargo: al enviarla el expediente queda Comunicada y empiezan esos 3 días hábiles.

La resolución es Desestima, Modifica o Mantiene. Modifica exige otra gravedad. La revocatoria solo se acoge o se rechaza. La apelación también admite Acoge parcialmente.

El retiro precautorio dura como máximo 10 días naturales, contados de forma inclusiva. Lleva motivo y la marca de coordinación con el PANI. No cambia el estado ni la nota.

### Vía directa (muy leve y leve)

Notificada, luego En recurso, y de ahí Firme o Desestimada. También se puede anular. Al registrar ya se notifica y queda abierto el plazo de revocatoria de 3 días hábiles. Si ese plazo vence sin recurso, el acto queda firme.

Desestimada y Anulada no tienen salida. Un expediente firme se puede anular con `disciplinary.configure`.

### Nota de conducta

`max(0, 100 − suma de rebajos firmes del período)`. La escala fija es 5, 10, 20, 35 y 50. Mientras no esté firme, el rebajo se muestra como propuesto y no entra en la nota. Cada firmeza lo aplica una sola vez.

`reconcileDeadlines()` corre al leer expedientes, historial, nota o tablero, y además cada hora. `DISCIPLINARY_RECONCILE=false` apaga el intervalo. La fecha del efecto es la del vencimiento, no la hora en que corrió el proceso.

## Configuración inicial

1. Aplicar las migraciones del catálogo, de las tablas y de roles y permisos (`025`, `026` y `027`).
2. En **Catálogo de faltas** (`/admin/discipline/catalog`) cargar las conductas del curso. Cada fila es nombre más gravedad. Desactivar no borra. La escala de rebajo no se edita.
3. En **Configuración** (`/admin/discipline/calendar`) registrar los días no hábiles del año, con fecha y motivo. Si el año en curso no tiene ninguno, el tablero lo avisa. Ahí también están los umbrales: reincidencia 3 y nota de conducta 80, salvo que se cambien.
4. Asignar los roles Orientador, Director y Encargado. Padre de familia, si existe, recibe los mismos permisos que Encargado.
5. Marcar al docente guía en la asignación de la sección. Sin esa marca, el expediente queda con «sin docente guía» y el tablero lo señala.
6. Vincular a cada encargado con su estudiante. Sin vínculo, la comunicación formal exige entrega física y el encargado no ve el expediente.
7. El correo es opcional. Si SMTP no está configurado, la notificación queda en la aplicación y el envío se registra como omitido. El PDF sigue siendo el respaldo para el cuaderno.

Pantallas: registro, expedientes, notificaciones del encargado, historial, tablero y el flujo del debido proceso, bajo `/admin/discipline`.

## Correspondencia con la guía de debido proceso

| Requisito de la guía | Dónde queda |
|---|---|
| Faltas muy leves y leves sin los seis pasos, con copia al encargado | Vía directa al registrar. Estados Notificada, En recurso, Firme o Desestimada. |
| Faltas graves en adelante, seis pasos, conducidos por el docente guía | Vía de debido proceso. Investigación, comunicación, descargo y resolución solo las conduce el guía responsable, Dirección o el administrador. |
| Rebajo fijo y presunción de inocencia | Escala 5/10/20/35/50. La nota solo suma lo firme. |
| Investigación, observaciones y solicitud al docente que reportó | `investigation`, `observations` e `information-requests`. |
| Criterio de Orientación, de apoyo y no vinculante | `counsel-requests` y `counsel-opinions`. El cargo se puede comunicar aunque el criterio no exista. El criterio solo se emite si alguien lo pidió. |
| Comunicación formal, con derecho a ver el expediente y a defensa técnica | El servidor agrega esas cláusulas. PDF de una página y entrega por cuaderno o en persona. |
| Descargo en plazo, del encargado o por escrito | `defenses` y `defenses/written`. Fuera de plazo se rechaza. |
| Resolución fundamentada: Desestima, Modifica o Mantiene | `resolution`, mínimo 50 caracteres. |
| Revocatoria en 3 días, resuelta por quien dictó el acto | `revocations` y su resolución. Acoge o Rechaza. |
| Apelación ante Dirección, también en subsidio, en 8 días | `appeals` y su resolución. Si iba en subsidio, se eleva al rechazar la revocatoria. |
| Firmeza por silencio o por agotar los recursos, sin doble rebajo | `reconcileDeadlines()` y la nota calculada. |
| Retiro precautorio de Dirección, hasta 10 días naturales, con marca de PANI, sin ser sanción | `precautionary-measures`. |
| Días hábiles y feriados | `addBusinessDays` y `non-working-days`. |
| Lectura con fecha, medio e IP | `notifications/:id/read`, inmutable. |
| Expediente, bitácora y auditoría | Cada cambio de estado escribe el evento y `AuditLog` en la misma transacción. |
| Encargado y estudiante solo ven lo suyo; el criterio y los testigos quedan reservados | Alcance por vínculo, guía o autoría, y filtro de eventos reservados. |
| Seguimiento del profesor guía | `follow-ups`. |
