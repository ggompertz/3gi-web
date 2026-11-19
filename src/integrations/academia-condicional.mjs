// La ruta /academia solo existe cuando la Academia es visible (src/data/academia.mjs). Con el interruptor apagado el sitio se
// construye sin la página: no queda archivo, enlace ni referencia. Probado el 2026-11-19 (plan, chunk 0) y por
// scripts/probar-interruptor-academia.mjs.
import { academiaVisible } from '../data/academia.mjs';

export default function academiaCondicional() {
  return {
    name: 'academia-condicional',
    hooks: {
      'astro:config:setup': ({ injectRoute, logger }) => {
        if (academiaVisible()) {
          injectRoute({ pattern: '/academia', entrypoint: './src/paginas-pendientes/academia.astro' });
          logger.info('Academia visible: ruta /academia incluida');
        } else {
          logger.info('Academia apagada: ruta /academia omitida');
        }
      },
    },
  };
}
