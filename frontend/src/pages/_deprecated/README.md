# Páginas Deprecadas

## ⚠️ IMPORTANTE

Los archivos en esta carpeta están **DEPRECADOS** y no deben usarse para nuevas funcionalidades.

## ¿Por qué están deprecados?

Estas páginas de etapas de workflow tienen código repetitivo que puede ser reemplazado completamente por `GenericEtapaPage.tsx`, que:

1. **Carga la configuración dinámicamente** desde el backend
2. **Renderiza los campos automáticamente** según el tipo de pregunta
3. **Reduce la duplicación de código** significativamente
4. **Facilita el mantenimiento** - cambios en un solo lugar

## Archivos deprecados

| Archivo | Reemplazo |
|---------|-----------|
| `RecepcionRecibosPagos.tsx` | `GenericEtapaPage?etapaCode=RECEPCION_RECIBOS` |
| `ImpresionListaCasos.tsx` | `GenericEtapaPage?etapaCode=IMPRESION_LISTA` |
| `ReasignacionCaso.tsx` | `GenericEtapaPage?etapaCode=REASIGNACION` |
| `ProgramacionEntrevista.tsx` | `GenericEtapaPage?etapaCode=PROGRAMACION_ENTREVISTA` |
| `RecepcionRex.tsx` | `GenericEtapaPage?etapaCode=RECEPCION_REX` |
| `RecepcionReciboTesoreria.tsx` | `GenericEtapaPage?etapaCode=RECEPCION_TESORERIA` |
| `NotasEntrevista.tsx` | `GenericEtapaPage?etapaCode=NOTAS_ENTREVISTA` |
| `DictamenFinal.tsx` | `GenericEtapaPage?etapaCode=DICTAMEN_FINAL` |
| `EntregaResolucion.tsx` | `GenericEtapaPage?etapaCode=ENTREGA_RESOLUCION` |

## ¿Cuándo eliminar estos archivos?

Una vez que:
1. ✅ Se verifique que `GenericEtapaPage` funciona correctamente para todas las etapas
2. ✅ Se actualicen todas las referencias en el código
3. ✅ Se realicen pruebas E2E completas
4. ✅ Se confirme que no hay regresiones

## Páginas que NO están deprecadas

Las siguientes páginas tienen **lógica especial** que no puede ser reemplazada por `GenericEtapaPage`:

- `DescargaRequisitos.tsx` - Auto-completa 3 etapas automáticamente
- `CargaPoderGeneral.tsx` - Tiene integración OCR especial
- `CargaSolicitudFirmada.tsx` - Tiene integración OCR especial
- `Cotizacion.tsx` - Tiene items dinámicos de cotización
- `RevisionRequisitos.tsx` - OCR masivo para múltiples documentos

---

*Última actualización: Noviembre 2025*
