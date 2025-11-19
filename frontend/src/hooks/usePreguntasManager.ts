import { useReducer, useCallback } from 'react';
import type { WorkflowPregunta, TipoPregunta } from '../types/workflow';

// ============================================================================
// STATE INTERFACE
// ============================================================================
export interface PreguntasState {
  preguntas: WorkflowPregunta[];
  editingIndex: number | null; // null = no editing, -1 = new question, >= 0 = editing existing
  tempPregunta: WorkflowPregunta | null;
  error: string | null;
}

// ============================================================================
// ACTION TYPES (Discriminated Union)
// ============================================================================
type PreguntasAction =
  | { type: 'ADD_NEW'; payload: { currentLength: number } }
  | { type: 'EDIT_EXISTING'; payload: { index: number; pregunta: WorkflowPregunta } }
  | { type: 'UPDATE_TEMP_FIELD'; payload: { field: keyof WorkflowPregunta; value: any; tiposDisponibles?: Array<{ value: TipoPregunta; label: string }> } }
  | { type: 'SAVE_TEMP' }
  | { type: 'CANCEL_EDIT' }
  | { type: 'DELETE'; payload: { index: number } }
  | { type: 'DUPLICATE'; payload: { index: number } }
  | { type: 'SET_PREGUNTAS'; payload: { preguntas: WorkflowPregunta[] } };

// ============================================================================
// BUSINESS LOGIC: Field Interdependencies
// ============================================================================
const applyFieldInterdependencies = (
  pregunta: WorkflowPregunta,
  field: keyof WorkflowPregunta,
  value: any,
  tiposDisponibles: Array<{ value: TipoPregunta; label: string }> = []
): Partial<WorkflowPregunta> => {
  const updates: Partial<WorkflowPregunta> = { [field]: value };

  // Sync 'texto' with 'pregunta' field
  if (field === 'texto') {
    updates.pregunta = value;
  } else if (field === 'pregunta') {
    updates.texto = value;
  }

  // Sync 'tipo' with 'tipo_pregunta' field and apply type-specific logic
  if (field === 'tipo' || field === 'tipo_pregunta') {
    const tipoValue = value as TipoPregunta;
    updates.tipo = tipoValue;
    updates.tipo_pregunta = tipoValue;

    // REVISION_OCR: Auto-set obligatoria=true and set default text
    if (tipoValue === 'REVISION_OCR') {
      const tipoLabel = tiposDisponibles.find(t => t.value === tipoValue)?.label || tipoValue;
      updates.texto = tipoLabel;
      updates.pregunta = tipoLabel;
      updates.es_obligatoria = true;
    }

    // Clear type-specific fields when changing types
    if (pregunta.tipo !== tipoValue) {
      // Clear lista_elementos for non-list types
      if (tipoValue !== 'LISTA' && tipoValue !== 'OPCIONES') {
        updates.lista_elementos = undefined;
      }
      // Clear max_caracteres for non-text types
      if (tipoValue !== 'RESPUESTA_TEXTO' && tipoValue !== 'RESPUESTA_LARGA') {
        updates.max_caracteres = undefined;
      }
      // Clear file-related fields
      if (tipoValue !== 'CARGA_ARCHIVO') {
        updates.max_archivos = undefined;
        updates.max_size_mb = undefined;
        updates.ayuda = undefined;
      }
      // Clear campos_caso
      if (tipoValue !== 'DATOS_CASO') {
        updates.campos_caso = undefined;
      }
      // Clear etapa_origen_id
      if (tipoValue !== 'REVISION_OCR' && tipoValue !== 'REVISION_MANUAL_DOCUMENTOS') {
        updates.etapa_origen_id = undefined;
      }
      // Clear agenda_origen_id
      if (tipoValue !== 'SELECCION_FECHA') {
        updates.agenda_origen_id = undefined;
      }
    }
  }

  return updates;
};

// ============================================================================
// REDUCER
// ============================================================================
const preguntasReducer = (state: PreguntasState, action: PreguntasAction): PreguntasState => {
  switch (action.type) {
    case 'ADD_NEW': {
      const newPregunta: WorkflowPregunta = {
        codigo: `PREGUNTA_${action.payload.currentLength + 1}`,
        texto: '',
        pregunta: '',
        tipo: 'SELECCIONAR' as any,
        tipo_pregunta: 'SELECCIONAR' as any,
        orden: action.payload.currentLength,
        es_obligatoria: false,
        es_visible: true,
        activo: true,
      };
      return {
        ...state,
        tempPregunta: newPregunta,
        editingIndex: -1,
        error: null,
      };
    }

    case 'EDIT_EXISTING': {
      // Normalize pregunta data
      const normalizedPregunta: WorkflowPregunta = {
        ...action.payload.pregunta,
        tipo: action.payload.pregunta.tipo_pregunta || action.payload.pregunta.tipo,
        tipo_pregunta: action.payload.pregunta.tipo_pregunta || action.payload.pregunta.tipo,
        texto: action.payload.pregunta.pregunta || action.payload.pregunta.texto || '',
        pregunta: action.payload.pregunta.pregunta || action.payload.pregunta.texto || '',
      };
      return {
        ...state,
        tempPregunta: normalizedPregunta,
        editingIndex: action.payload.index,
        error: null,
      };
    }

    case 'UPDATE_TEMP_FIELD': {
      if (!state.tempPregunta) return state;

      const updates = applyFieldInterdependencies(
        state.tempPregunta,
        action.payload.field,
        action.payload.value,
        action.payload.tiposDisponibles
      );

      return {
        ...state,
        tempPregunta: {
          ...state.tempPregunta,
          ...updates,
        },
        error: null, // Clear error on field update
      };
    }

    case 'SAVE_TEMP': {
      if (!state.tempPregunta) return state;

      // Validation: Must have a valid tipo selected
      if (!state.tempPregunta.tipo || (state.tempPregunta.tipo as any) === 'SELECCIONAR') {
        return {
          ...state,
          error: 'Debe seleccionar un tipo de pregunta',
        };
      }

      let updatedPreguntas: WorkflowPregunta[];

      if (state.editingIndex === -1) {
        // Adding new question
        updatedPreguntas = [...state.preguntas, state.tempPregunta];
      } else if (state.editingIndex !== null) {
        // Editing existing question
        updatedPreguntas = state.preguntas.map((p, idx) =>
          idx === state.editingIndex ? state.tempPregunta! : p
        );
      } else {
        return state;
      }

      return {
        ...state,
        preguntas: updatedPreguntas,
        tempPregunta: null,
        editingIndex: null,
        error: null,
      };
    }

    case 'CANCEL_EDIT': {
      return {
        ...state,
        tempPregunta: null,
        editingIndex: null,
        error: null,
      };
    }

    case 'DELETE': {
      return {
        ...state,
        preguntas: state.preguntas.filter((_, idx) => idx !== action.payload.index),
      };
    }

    case 'DUPLICATE': {
      const preguntaToDuplicate = state.preguntas[action.payload.index];
      const duplicated: WorkflowPregunta = {
        ...preguntaToDuplicate,
        codigo: `PREGUNTA_${state.preguntas.length + 1}`,
        orden: state.preguntas.length,
      };
      return {
        ...state,
        preguntas: [...state.preguntas, duplicated],
      };
    }

    case 'SET_PREGUNTAS': {
      // Used for initial load or external updates
      return {
        ...state,
        preguntas: action.payload.preguntas,
      };
    }

    default:
      return state;
  }
};

// ============================================================================
// CUSTOM HOOK
// ============================================================================
export const usePreguntasManager = (initialPreguntas: WorkflowPregunta[] = []) => {
  const initialState: PreguntasState = {
    preguntas: initialPreguntas,
    editingIndex: null,
    tempPregunta: null,
    error: null,
  };

  const [state, dispatch] = useReducer(preguntasReducer, initialState);

  // Bound action creators for cleaner component usage
  const actions = {
    addNew: useCallback(() => {
      dispatch({ type: 'ADD_NEW', payload: { currentLength: state.preguntas.length } });
    }, [state.preguntas.length]),

    editExisting: useCallback((index: number, pregunta: WorkflowPregunta) => {
      dispatch({ type: 'EDIT_EXISTING', payload: { index, pregunta } });
    }, []),

    updateTempField: useCallback((
      field: keyof WorkflowPregunta,
      value: any,
      tiposDisponibles?: Array<{ value: TipoPregunta; label: string }>
    ) => {
      dispatch({ type: 'UPDATE_TEMP_FIELD', payload: { field, value, tiposDisponibles } });
    }, []),

    saveTemp: useCallback(() => {
      dispatch({ type: 'SAVE_TEMP' });
    }, []),

    cancelEdit: useCallback(() => {
      dispatch({ type: 'CANCEL_EDIT' });
    }, []),

    deletePregunta: useCallback((index: number) => {
      dispatch({ type: 'DELETE', payload: { index } });
    }, []),

    duplicatePregunta: useCallback((index: number) => {
      dispatch({ type: 'DUPLICATE', payload: { index } });
    }, []),

    setPreguntas: useCallback((preguntas: WorkflowPregunta[]) => {
      dispatch({ type: 'SET_PREGUNTAS', payload: { preguntas } });
    }, []),
  };

  return {
    state,
    dispatch,
    actions,
  };
};
