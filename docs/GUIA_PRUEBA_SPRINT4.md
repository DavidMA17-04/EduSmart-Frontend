# Guía de prueba — módulo disciplinario

Para recorrer el módulo completo en la aplicación, con las cuentas DiscQA ya creadas. El docente es guía de 10-D4-10-A y el encargado está vinculado al estudiante. El ingreso es cédula, Continuar, contraseña, Iniciar sesión. Para cambiar de persona: Cerrar sesión y confirmar Salir.

Las credenciales no van en esta guía.

AM-2026-0001 (leve, firme, 10 puntos) y AM-2026-0002 (grave, firme, 20 puntos) ya cerraron el trámite. Sirven para la nota y la cronología. Cada vía nueva necesita un expediente nuevo sobre el mismo estudiante. No se reabre uno firme para repetir un paso.

Anota el número `AM-AAAA-NNNN` de cada caso al crearlo.

## 0. Preparación

Entra como administrador.

1. En Catálogo de faltas (`/admin/discipline/catalog`) confirma la escala fija: muy leve 5, leve 10, grave 20, muy grave 35, gravísima 50. Esa escala no se edita.
2. Crea un tipo de prueba, edítalo y desactívalo. La fila sigue en el listado y no aparece al registrar.
3. Exporta el catálogo a Excel y a PDF.
4. En Calendario y umbrales (`/admin/discipline/calendar`) agrega un día no hábil futuro, con motivo, y bórralo. Confirma los umbrales de reincidencia (3) y de nota (80), o los valores que haya dejado el colegio.
5. El menú de administrador muestra tablero, historial, expedientes, registro, catálogo, calendario y flujo del debido proceso.

## 1. Falta leve, vía directa

Entra como Docente DiscQA.

1. El menú muestra registrar, expedientes e historial. No muestra catálogo ni calendario.
2. Registra una falta leve de QA: estudiante DiscQA, fecha de hoy o de ayer, lugar y descripción. El aviso dice vía directa y rebajo propuesto de 10. Si adjuntas un archivo, solo PDF, JPG o PNG, hasta 10 MB y hasta 5 archivos.
3. Abre el expediente. Estado Notificada, en plazo, número nuevo. La cronología dice Apertura. Hay una comunicación de amonestación directa.
4. Imprime el PDF de esa comunicación. Es una carta de una página e incluye el plazo de revocatoria de 3 días hábiles.
5. En el historial del estudiante el rebajo de este caso dice propuesto. La nota no lo descuenta todavía. Los dos casos firmes anteriores sí: la nota parte de 70 mientras este siga abierto.

Entra como Encargado DiscQA. La entrada es la bandeja de notificaciones. No hay registro, catálogo ni tablero.

6. Abre la notificación de la falta leve y confirma la lectura. Queda la fecha y el aviso de no leída desaparece. Confirmar otra vez no cambia esa fecha.
7. No interpongas revocatoria si quieres dejar este caso para la firmeza por silencio. Si la interpones, el caso pasa a En recurso y el docente debe resolverla.

Entra como Estudiante DiscQA.

8. El menú tiene Mi conducta y no tiene Expedientes. En Mi conducta se ve el rebajo propuesto y no el criterio ni los testigos.
9. Abre a mano `/admin/discipline/cases/` y el número del expediente. La aplicación vuelve a Mi horario.

## 2. Falta grave, los seis pasos

Usa otro expediente. Entra como Docente DiscQA.

1. Registra una falta grave de QA. El aviso dice debido proceso y rebajo propuesto de 20. Estado Reportada, sin plazo de investigación todavía.
2. Iniciar investigación. Estado En investigación. Plazo de 10 días hábiles, indicador En plazo.
3. Registrar observación. Aparece en la cronología como Observación.
4. Solicitar información al docente que reportó. Como en esta prueba el mismo docente reportó y es el guía, responde esa solicitud desde el expediente. La cronología muestra Solicitud de información y Respuesta del docente.
5. Solicitar criterio de Orientación. El estado no cambia y sigue disponible Comunicar el cargo.

Entra como Orientador DiscQA antes de que exista la solicitud, en un caso que todavía no la tenga, o comprueba en este mismo caso después de emitirla.

6. Sin solicitud pendiente, Emitir criterio no se ofrece.
7. Con la solicitud, emite el criterio. El estado sigue En investigación. La cronología dice Criterio de Orientación.

Entra como Director DiscQA. Ve expedientes, historial, tablero y exportación. No ve Registrar amonestación. El rótulo del menú es Personal.

8. Ordena el retiro precautorio: inicio hoy, fin dentro de los próximos 10 días naturales inclusive, motivo de al menos 10 caracteres y coordinación con el PANI. El estado sigue En investigación y la gravedad sigue Grave. La cronología dice Retiro precautorio. Un rango de 12 días naturales se rechaza.
9. El docente y el orientador no tienen esa acción.

Vuelve como Docente DiscQA.

10. Comunicar el cargo, con una acción correctiva de al menos 10 caracteres. Estado Comunicada. Plazo de descargo de 3 días hábiles. El PDF de la comunicación formal trae las cláusulas de acceso al expediente y de defensa técnica.
11. Registra la entrega por cuaderno o en persona: fecha, medio y quién recibió. Puede llevar un acuse.

Entra como Encargado DiscQA.

12. Lee la comunicación formal. Presenta el descargo, con texto y, si quieres, hasta 3 adjuntos. El mensaje es Descargo presentado. Estado Pendiente de resolución. Plazo de resolución de 5 días hábiles. Un descargo vacío o más corto que el mínimo se rechaza.
13. En el expediente ves hechos, comunicación, resolución cuando exista y recursos. No ves el criterio de Orientación ni los testigos.

Vuelve como Docente DiscQA.

14. Resolver con Mantiene y una fundamentación de al menos 50 caracteres. Menos de 50 se rechaza. Estado Resuelta. Plazo de revocatoria de 3 días hábiles. En el historial el rebajo sigue propuesto.

Entra como Encargado DiscQA.

15. Lee la resolución. Interpone la revocatoria con la casilla Apelación en subsidio, junto con la revocatoria. El texto debe cumplir el mínimo. Estado En recurso. En recursos dice Revocatoria con apelación en subsidio, no Revocatoria en subsidio.

Vuelve como Docente DiscQA.

16. Resolver revocatoria. El formulario abre en Acoge. Cámbialo a Rechaza. Fundamentación de al menos 20 caracteres. El expediente sigue En recurso. El plazo pasa a 8 días hábiles. El texto dice Apelación en subsidio elevada a Dirección. Modifica no es una opción de la revocatoria.

Entra como Director DiscQA.

17. Resuelve la apelación con Rechaza y una fundamentación de al menos 20 caracteres. Estado Firme. Sin plazo. El docente y el orientador no pueden resolver la apelación.
18. En el historial, este rebajo de 20 pasa a aplicado y se suma una sola vez a los 30 que ya estaban firmes. La nota es 100 menos esa suma. Volver a abrir el expediente no descuenta otra vez.
19. Exporta el PDF del expediente. Una página, con hechos, cronología, resolución y recursos. La cronología está en español: Retiro precautorio, Descargo, Revocatoria, Apelación elevada.

Entra como Estudiante DiscQA.

20. Mi conducta muestra el rebajo aplicado de este caso y la nota nueva. Sigue sin Expedientes, sin criterio y sin testigos.

## 3. Otras salidas

Cada una pide un expediente grave nuevo, salvo que se indique otra cosa. No uses el caso que ya quedó firme en la sección 2.

| Qué probar | Quién | Qué hacer | Resultado |
|---|---|---|---|
| Reporte extemporáneo | Docente | Registrar una falta grave con fecha de más de 5 días hábiles atrás y escribir la justificación | Se crea y queda marcado como reporte extemporáneo. Sin justificación, no se crea |
| Archivar por falta de mérito | Docente guía | Durante En investigación, Archivar por falta de mérito | Desestimada. No hay rebajo. No sale de ese estado |
| Desestima | Docente guía | Resolver con Desestima y fundamentación de al menos 50 caracteres | Al quedar firme, Desestimada y sin rebajo |
| Modifica | Docente guía | Resolver con Modifica y una gravedad distinta, por ejemplo de grave a leve | El rebajo propuesto pasa al de la nueva gravedad (10 si queda leve) |
| Revocatoria acogida | Encargado y luego el guía | Interponer revocatoria sin la casilla de subsidio. El guía deja Acoge | Desestimada. Sin rebajo |
| Apelación separada | Encargado y luego Dirección | Rechazar la revocatoria sin subsidio. El encargado interpone la apelación dentro del plazo | En recurso, plazo de 8 días hábiles, y Dirección la resuelve |
| Acoge parcialmente | Dirección | En la apelación, Acoge parcialmente y baja la gravedad | El rebajo propuesto cambia y el expediente queda firme |
| Descargo escrito | Docente guía | Con el caso Comunicada y sin usar el portal, registrar el descargo escrito | Pendiente de resolución, canal Escrito |
| Seguimiento | Docente guía, Orientación o Dirección | Registrar una entrevista o un compromiso, con fecha de revisión, y luego marcarlo cumplido o incumplido | Queda en la cronología del expediente |
| Anulación | Administrador | Anular un expediente que no esté desestimado, con justificación. Puede ser uno firme de prueba, no AM-2026-0001 ni AM-2026-0002 si quieres conservar la nota de 70 | Anulada. El rebajo sale de la nota. Docente, Orientación y Dirección no tienen la acción |
| Evidencia inválida | Docente | Subir un archivo que no sea PDF, JPG o PNG, o uno de más de 10 MB, o un sexto archivo | Se rechaza y el expediente no guarda ese archivo |
| Retiro fuera de etapa | Dirección | Intentar el retiro en un caso ya firme o en una falta leve | Se rechaza. El retiro es solo para un expediente abierto de falta grave o mayor |

## 4. Quién no puede

Con la sesión de cada persona, estas pantallas o acciones no deben completarse. Un rechazo de permiso no guarda nada.

| Persona | No debe poder |
|---|---|
| Docente | Ver el catálogo completo, exportar, emitir criterio, resolver una apelación, ordenar un retiro, configurar feriados, anular, abrir un expediente de una sección donde no es guía y que no reportó |
| Orientador | Registrar, resolver el expediente, resolver la revocatoria, ordenar un retiro, configurar, anular |
| Director | Registrar, emitir criterio, configurar, anular |
| Encargado | Registrar, ver el catálogo, exportar, abrir el tablero, resolver, ver el historial de un estudiante que no tiene vinculado |
| Estudiante | Registrar, exportar, abrir el tablero, ver el historial de otro estudiante, entrar a un expediente por la dirección directa |

Orientador y Director sí exportan el listado y el expediente. El docente guía sí ve el tablero, limitado a sus secciones. El encargado sí ve su bandeja y los expedientes de su estudiante.

## 5. Tablero, alertas y exportación

Entra como Director DiscQA o como Orientador DiscQA.

1. Abre el tablero. Filtra por período, nivel y sección. Los totales por estado, gravedad, sección y mes cambian con el filtro. Hay plazos, alertas y estudiantes con más expedientes.
2. Entra como Docente DiscQA. El mismo tablero solo muestra su sección.
3. Entra como Encargado DiscQA o como Estudiante DiscQA. El tablero no abre.
4. Como Orientador o Director, exporta el listado a Excel y a PDF, y el historial del estudiante a Excel y a PDF. Como docente, esas exportaciones no están.
5. Si una comunicación lleva dos días hábiles sin lectura, el responsable ve la alerta Notificación sin confirmar. No aparece el mismo día del envío.

## 6. Plazos que no vencen en la misma sesión

Estos resultados son correctos y no se fuerzan el mismo día:

- Una falta leve Notificada, leída y sin recurso, queda Firme al cumplirse 3 días hábiles desde la notificación. Recién entonces el rebajo entra en la nota.
- Una resolución sin revocatoria queda Firme al cumplirse ese mismo plazo.
- Un descargo no presentado pasa el caso a Pendiente de resolución con la marca Sin descargo al cumplirse los 3 días hábiles.
- Agregar un feriado dentro de un plazo abierto corre el vencimiento un día hábil. Se ve al volver a abrir el expediente.

En la base local, la firmeza ya quedó demostrada con AM-2026-0001 y AM-2026-0002. No hace falta mover fechas de un caso nuevo para dar por probado el módulo.

## Cierre

El módulo está probado por completo cuando se cumplen estos puntos:

- La falta leve queda Notificada, con lectura confirmada y rebajo solo propuesto.
- La falta grave recorre Reportada, En investigación, Comunicada, Pendiente de resolución, Resuelta, En recurso y Firme.
- El retiro no cambia la nota ni el estado.
- El criterio solo aparece después de pedirlo, y no lo ven el encargado ni el estudiante.
- La revocatoria en subsidio se eleva sola al rechazarla, y Dirección la resuelve.
- Desestimada, anulada, archivo por falta de mérito y revocatoria acogida no aplican rebajo.
- La nota suma cada rebajo firme una sola vez.
- Quien no tiene el permiso recibe rechazo.
