# La Máquina Enigmática

Herramienta pedagógica interactiva para descubrir el **Cifrado César** de forma visual y progresiva.

## Demo

[la-maquina-enigmatica.netlify.app](https://la-maquina-enigmatica.netlify.app)

## ¿Qué hace?

- El alumno ingresa una palabra o letra
- La **caja de entrada** la analiza (efecto azul) durante 2 segundos
- El texto viaja por los portales a través de la máquina
- La **caja de salida** muestra el resultado cifrado
- Al terminar, ambas cajas muestran el par original ↔ cifrado para comparar
- Un sistema de **pistas progresivas** guía al alumno hacia el descubrimiento del patrón

## Modo Profesor (oculto)

Permite cambiar el desplazamiento del cifrado en cualquier momento:

- `Ctrl + Shift + S`
- O 5 clics rápidos sobre el título

## Estructura

```
cifrado_cesar/
├── index.html       # Estructura HTML
├── css/
│   └── styles.css   # Estilos y animaciones
└── js/
    └── app.js       # Lógica del cifrado y animaciones
```
