// Página de documentación interactiva de la API (Swagger UI), cambia el idioma del spec según el idioma seleccionado.

import React from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import "./Swagger.css";

export default function Swagger({ lang = "EN" }) {
  // Usa el spec en español o inglés según idioma actual
  const swaggerUrl = lang === "ES" ? "/swagger-es.json" : "/swagger.json";

  return (
    <div className="swagger-wrapper">
      <SwaggerUI url={swaggerUrl} docExpansion="none" />
    </div>
  );
}
  