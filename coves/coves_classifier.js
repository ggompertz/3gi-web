const fs = require('fs');
const anthropicModule = require('@anthropic-ai/sdk');
const Anthropic = anthropicModule.default || anthropicModule;

/**
 * Clasificador IA para frames CCTV — Sistema COVES S11
 * Determina si lo detectado es una incivilidad real (loitering, vandalism, etc.)
 *
 * @param {string} framePath - Ruta absoluta al archivo JPG
 * @returns {Object|null} {es_persona, tipo_objeto, conducta, nivel_riesgo, descripcion_ia, frame_path} o null si falla
 */
async function classify(framePath) {
  try {
    // Validar que el archivo existe
    if (!fs.existsSync(framePath)) {
      logDebug(`Frame no encontrado: ${framePath}`);
      return null;
    }

    // Leer archivo JPG y convertir a base64
    const imageBuffer = fs.readFileSync(framePath);
    const base64Image = imageBuffer.toString('base64');

    // Obtener API key desde /root/.env.coves
    let apiKey = '';
    try {
      const envContent = fs.readFileSync('/root/.env.coves', 'utf8');
      for (const line of envContent.split('\n')) {
        const [k, ...rest] = line.split('=');
        if (k && k.trim() === 'ANTHROPIC_API_KEY') {
          apiKey = rest.join('=').trim();
          break;
        }
      }
    } catch (e) {
      logDebug(`No se pudo leer /root/.env.coves: ${e.message}`);
      return null;
    }

    if (!apiKey) {
      logDebug('ANTHROPIC_API_KEY no encontrada en /root/.env.coves');
      return null;
    }

    // Instanciar cliente Anthropic (timeout interno más confiable que AbortController solo)
    const client = new Anthropic({ apiKey, timeout: 7000 });

    // System prompt con cache control (SDK 0.37.0)
    const systemPrompt = [
      {
        type: 'text',
        text: `Eres un analista de seguridad nocturna. Analizas frames de cámaras CCTV en Chile.
Tu tarea: clasificar lo que ves en la imagen con criterios de seguridad urbana.
Responde SOLO en JSON válido, sin texto adicional, sin markdown.`,
        cache_control: { type: 'ephemeral' }
      }
    ];

    // User message con imagen en base64
    const userContent = [
      {
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/jpeg',
          data: base64Image
        }
      },
      {
        type: 'text',
        text: `Analiza este frame de cámara de seguridad nocturna.

Responde SOLO este JSON:
{
  "es_persona": true/false,
  "tipo_objeto": "persona"|"vehiculo"|"animal"|"sombra"|"otro",
  "conducta": "loitering"|"vandalism"|"transito"|"detenido"|"desconocida",
  "nivel_riesgo": "alto"|"medio"|"bajo"|"falso",
  "descripcion": "frase en español, max 80 chars"
}

Criterios nivel_riesgo:
- alto: persona detenida, mirando puertas/ventanas, comportamiento sospechoso
- medio: persona en tránsito en hora inusual, o detención breve
- bajo: vehículo en tránsito, persona caminando rápido y directo
- falso: sombras, animales, cambios de luz, insectos, sin objeto claro`
      }
    ];

    // Timeout: 8 segundos con AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    let response;
    try {
      response = await client.messages.create(
        {
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 256,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: userContent
            }
          ]
        },
        { signal: controller.signal }
      );
    } finally {
      clearTimeout(timeoutId);
    }

    // Extraer contenido de la respuesta
    if (!response.content || response.content.length === 0) {
      logDebug('Respuesta vacía de Claude API');
      return null;
    }

    const textContent = response.content.find(block => block.type === 'text');
    if (!textContent || !textContent.text) {
      logDebug('No se encontró texto en la respuesta de Claude');
      return null;
    }

    // Parsear JSON de la respuesta (stripear markdown si viene envuelto en ```json ... ```)
    let aiResponse;
    try {
      const raw = textContent.text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
      aiResponse = JSON.parse(raw);
    } catch (e) {
      logDebug(`Error parseando JSON de IA: ${e.message}`);
      logDebug(`Respuesta recibida: ${textContent.text}`);
      return null;
    }

    // Validar campos requeridos
    if (
      typeof aiResponse.es_persona !== 'boolean' ||
      !aiResponse.tipo_objeto ||
      !aiResponse.conducta ||
      !aiResponse.nivel_riesgo ||
      !aiResponse.descripcion
    ) {
      logDebug('JSON de IA incompleto o mal formado');
      return null;
    }

    // Retornar objeto clasificado
    return {
      es_persona: aiResponse.es_persona,
      tipo_objeto: aiResponse.tipo_objeto,
      conducta: aiResponse.conducta,
      nivel_riesgo: aiResponse.nivel_riesgo,
      descripcion_ia: aiResponse.descripcion,
      frame_path: framePath
    };

  } catch (error) {
    // Si es AbortError, es timeout
    if (error.name === 'AbortError') {
      logDebug(`Timeout (8s) clasificando: ${framePath}`);
    } else {
      logDebug(`Error en classify(): ${error.message}`);
    }
    return null;
  }
}

/**
 * Log a archivo de debug (sin console.log)
 * @param {string} message
 */
function logDebug(message) {
  try {
    const timestamp = new Date().toISOString();
    fs.appendFileSync('/tmp/coves_diag.log', `[${timestamp}] ${message}\n`);
  } catch (e) {
    // Silently fail if can't write to log
  }
}

// Exportar función
module.exports = { classify };
