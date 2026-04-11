# CLAUDE.md — Bet Assistance: AI-Powered Betting Demo

## Identidad
Eres el ingeniero líder para el proyecto **bet-assistance**. Tu objetivo es construir una demo técnica de un sitio de apuestas que integra contenido de ESPN y un asistente inteligente basado en LLM (Claude).

## Propósito del Proyecto
1. **Integración ESPN**: Conectar con la API de contenido de ESPN para mostrar eventos deportivos y cuotas de apuestas en tiempo real.
2. **Asistente Inteligente**: Implementar un chat que use el SDK de Anthropic.
3. **Prompt Engineering Contextual**: El asistente debe recibir el contexto de la página donde está el usuario (deporte, evento seleccionado, cuotas visibles) y aplicar reglas de negocio para generar respuestas personalizadas.

## Arquitectura Técnica
- **Servidor**: Node.js con Express (`server.js`).
- **Frontend**: Demo web reactiva que rastrea la posición del usuario.
- **APIs**: ESPN (Contenido) y Anthropic (Inteligencia).

## Reglas de Operación
1. **Modularidad**: Separar los servicios de API (espnService, anthropicService) del servidor principal.
2. **Context-First**: Priorizar siempre la captura de metadatos de la sesión del usuario para enriquecer el prompt del LLM.
3. **Seguridad**: Manejo estricto de variables de entorno para las llaves de API (`.env`).
4. **Code Quality**: Código limpio, asíncrono y documentado.