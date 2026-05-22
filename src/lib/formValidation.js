// Schéma de validation pour les formulaires
export const eleveValidationRules = {
  prenom: {
    required: "Le prénom est obligatoire",
    minLength: { value: 2, message: "Au minimum 2 caractères" },
    maxLength: { value: 50, message: "Maximum 50 caractères" },
    pattern: { value: /^[a-zA-ZÀ-ÿ\s'-]+$/, message: "Caractères invalides" }
  },
  nom: {
    required: "Le nom est obligatoire",
    minLength: { value: 2, message: "Au minimum 2 caractères" },
    maxLength: { value: 50, message: "Maximum 50 caractères" },
    pattern: { value: /^[a-zA-ZÀ-ÿ\s'-]+$/, message: "Caractères invalides" }
  },
  age: {
    min: { value: 2, message: "L'âge doit être au minimum 2 ans" },
    max: { value: 25, message: "L'âge doit être maximum 25 ans" },
    pattern: { value: /^\d+$/, message: "Veuillez entrer un nombre valide" }
  },
  classe: {
    maxLength: { value: 20, message: "Maximum 20 caractères" },
    pattern: { value: /^[a-zA-Z0-9\s'-]*$/, message: "Caractères invalides" }
  }
};

export const getErrorMessage = (field, errors) => {
  if (!errors[field]) return null;
  return errors[field].message;
};

export const isFormValid = (errors) => {
  return Object.keys(errors).length === 0;
};