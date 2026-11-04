# Guion de demostración — Sprint 4, módulo disciplinario

Para el PO. El equipo preparó el recorrido. La aceptación de esta tarea la da el PO, después de verlo y de dejar sus observaciones al final.

Las cuentas de prueba ya existen en la base local (Docente, Orientador, Director, Encargado y Estudiante DiscQA). El docente es el guía de la sección 10-D4-10-A. El encargado está vinculado al estudiante. Las credenciales no van en este documento.

El ingreso es en dos pasos: cédula, Continuar, contraseña, Iniciar sesión. Para cambiar de actor: Cerrar sesión y confirmar Salir.

Hay dos expedientes ya firmes, útiles para la nota y la cronología, no para repetir el trámite:

- AM-2026-0001, leve, rebajo de 10.
- AM-2026-0002, grave, rebajo de 20. La nota de conducta del estudiante queda en 70.

Para mostrar el trámite en vivo, registrar dos faltas nuevas sobre ese mismo estudiante. No reabrir las que ya están firmes.

## 1. Docente guía

1. Entrar como Docente DiscQA. En Disciplina deben verse el registro, los expedientes de su sección y el historial. No deben verse el catálogo ni la configuración.
2. Registrar una falta leve del catálogo de QA: estudiante, fecha, lugar y descripción. Confirmar el aviso de vía directa y el rebajo propuesto de 10. Anotar el número `AM-AAAA-NNNN`.
3. Abrir el expediente. Estado Notificada, en plazo, sin rebajo aplicado en el historial.
4. Registrar una falta grave. Confirmar «Debido proceso» y el rebajo propuesto de 20. Anotar el segundo número.
5. En la falta grave: Iniciar investigación. El estado pasa a En investigación y el plazo es de 10 días hábiles.
6. Solicitar criterio de Orientación. El expediente no se detiene.
7. Comunicar el cargo, con una acción correctiva de al menos 10 caracteres. El estado pasa a Comunicada y se abren 3 días hábiles de descargo.
8. Después del descargo del encargado, Resolver con Mantiene y una fundamentación de al menos 50 caracteres. El estado pasa a Resuelta.
9. Cuando llegue la revocatoria, abrir Resolver revocatoria y elegir Rechaza. El valor inicial del formulario es Acoge; si se deja así, el acto se revoca. Fundamentación de al menos 20 caracteres. El expediente sigue En recurso y el plazo pasa a ser el de la apelación.

## 2. Dirección

1. Entrar como Director DiscQA. Debe ver expedientes, historial, tablero y exportaciones. No debe poder registrar una amonestación ni emitir el criterio de Orientación.
2. Con la falta grave todavía En investigación, ordenar el retiro precautorio: inicio y fin dentro de 10 días naturales, motivo y coordinación con el PANI. El estado y la gravedad no cambian. La cronología dice «Retiro precautorio».
3. Cuando la apelación en subsidio quede elevada, resolverla con Rechaza y una fundamentación de al menos 20 caracteres. El expediente pasa a Firme.
4. Abrir el historial del estudiante. Los dos rebajos firmes suman una sola vez. La nota es 100 menos esa suma.
5. Exportar el expediente a PDF y comprobar que es una carta de una página.

## 3. Orientación

1. Entrar como Orientador DiscQA. Debe ver la bandeja, el tablero y la exportación. No debe poder registrar, resolver ni ordenar un retiro.
2. Antes de que el guía pida criterio, Emitir criterio no se ofrece.
3. Después de la solicitud, emitir el criterio. El estado del expediente no cambia. El texto queda como «Criterio de Orientación».

## 4. Encargado

1. Entrar como Encargado DiscQA. La entrada es la bandeja de notificaciones. No hay registro, catálogo ni tablero institucional.
2. En la falta leve, confirmar la lectura. La fecha queda fija y el aviso de no leída desaparece.
3. En la falta grave, leer la comunicación formal y presentar el descargo. El estado pasa a Pendiente de resolución.
4. Leer la resolución e interponer la revocatoria con la casilla «Apelación en subsidio, junto con la revocatoria». En recursos debe decir «Revocatoria con apelación en subsidio», y la apelación, cuando se eleve, «Apelación en subsidio».
5. El expediente muestra hechos, comunicación, resolución y recursos. No muestra el criterio de Orientación ni los testigos.

## 5. Estudiante

1. Entrar como Estudiante DiscQA. El menú muestra Mi horario, Historial de asistencia, Justificaciones, Ingresar código y Mi conducta. No muestra Expedientes.
2. En Mi conducta se ven el rebajo propuesto mientras el acto no esté firme y la nota solo con lo que ya es firme. No aparecen el criterio ni los testigos.
3. Abrir a mano la dirección de un expediente (`/admin/discipline/cases/…`). La aplicación regresa a Mi horario.

## 6. Administrador

1. Entrar con la cuenta de administración institucional.
2. En el catálogo, mostrar un tipo activo y que desactivar no borra la fila. La escala 5, 10, 20, 35 y 50 no se edita.
3. En la configuración, mostrar un día no hábil y los umbrales de reincidencia y de nota.
4. Mostrar que solo esta cuenta puede anular un expediente, con justificación.

## Qué debe verse al cerrar

- La falta leve queda Notificada y, vencido el plazo de recursos sin que nadie los use, Firme.
- La falta grave recorre Reportada, En investigación, Comunicada, Pendiente de resolución, Resuelta, En recurso y Firme.
- El retiro no altera la nota.
- La cronología está en español.
- Quien no tiene el permiso recibe rechazo, no una pantalla vacía que igual deje guardar.

## Observaciones del PO

| Fecha | Rol revisado | Observación | ¿Acepta el recorrido? |
|---|---|---|---|
| 2026-10-20 | Docente guía, Dirección, Orientación, Encargado, Estudiante y Administrador | El PO acepta el recorrido del guion. No dejó observaciones adicionales. | Sí |

Aceptación del PO: 2026-10-20.
