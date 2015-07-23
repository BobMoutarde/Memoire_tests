class Utilitaire {
  // Evite les injections XSS
  escapeHTML(_templateData, ...vars) {
    let indexTpl = 0;
    let retour = _templateData[indexTpl];

    for (const row of vars) {
      const str = String(row);

      // Escape special characters in the substitution.
      retour += str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;');

      // Don't escape special characters in the template.
      retour += _templateData[++indexTpl];
    }
    return retour;
  }
}

export default Utilitaire;
