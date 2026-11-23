// Punto de entrada del bundle. Debe seguir siendo el `main` de package.json.
//
// `expo-router/entry` solo registra el componente raíz con `AppRegistry`, no lo renderiza.
// Eso significa que, cuando Android despierta la app "headless" para entregar un data
// message (app cerrada), `src/app/_layout.tsx` NUNCA se ejecuta. Por eso las tareas de
// `TaskManager.defineTask` tienen que estar importadas aquí: este archivo sí se evalúa en
// ese arranque sin interfaz. Definirlas solo en el layout hacía que el Silent Push
// funcionara con la app abierta y se perdiera al cerrarla.
import 'expo-router/entry';
import './src/modules/location/infrastructure/location-request.task';
