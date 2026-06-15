/**
 * Invert SwaggerUI values in dark mode so they are readable.
 *
 * This function injects CSS at runtime to work around the sassPrefix limitation
 * in fec.config.js which prevents SCSS files from targeting the <html> element
 * needed to apply the dark mode styles.
 *
 * The injected styles use CSS filters to invert SwaggerUI's hardcoded light theme
 * colors while preserving semantic hues (green buttons stay green, etc.).
 *
 * SwaggerUI doesn't currently natively support custom styling and dark mode.
 */
export const applySwaggerDarkMode = () => {
  const styleId = 'swagger-dark-mode';

  // Only inject if not already present
  if (document.getElementById(styleId)) {
    return;
  }

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    html.pf-v6-theme-dark .swagger-ui,
    html.pf-v5-theme-dark .swagger-ui {
      filter: invert(0.9) hue-rotate(180deg) !important;
    }

    html.pf-v6-theme-dark .swagger-ui img,
    html.pf-v5-theme-dark .swagger-ui img,
    html.pf-v6-theme-dark .swagger-ui svg,
    html.pf-v5-theme-dark .swagger-ui svg {
      filter: invert(1) hue-rotate(180deg) !important;
    }
  `;

  document.head.appendChild(style);
};
