# Reglas de Comportamiento del Asistente

## Ejecución de Comandos en Terminal (Arch Linux / Shell)

- **NO ejecutar comandos de terminal automáticamente**: El usuario prefiere ejecutar los comandos él mismo en su terminal para aprender el flujo de trabajo y evitar bloqueos de procesos en segundo plano.
- **Formato**: Cuando se requiera ejecutar comandos (ej. `npm`, `pnpm`, `git`, `docker`, comandos de sistema en Arch Linux), mostrárselos claramente al usuario en bloques de código explicados paso a paso con la ruta correspondiente (`Cwd`).
- **Confirmación**: Esperar a que el usuario confirme o devuelva la salida antes de asumir que el comando ya se corrió.
