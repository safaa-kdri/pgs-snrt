// src/components/auth/Register.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Alert,
  Checkbox,
  MenuItem,
  CircularProgress,
  Grid,
  Link,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { authService } from "../../services/auth";

// ============================================
// STYLES REGISTER
// ============================================

const PageTitle = styled(Typography)({
  textAlign: "center",
  fontSize: "54px",
  fontWeight: 700,
  color: "#222222",
  margin: "0 auto 18px",
  maxWidth: "600px",
  lineHeight: 1.1,
  fontFamily: '"Inria Sans", sans-serif',
});

const TitleLine = styled(Box)({
  height: "1px",
  background: "#1387A7",
  width: "95%",
  maxWidth: "700px",
  margin: "0 auto 20px",
});

const RegisterNote = styled(Typography)({
  textAlign: "center",
  color: "#222222",
  fontSize: "15px",
  margin: "0 auto 48px",
  maxWidth: "650px",
  fontFamily: '"Inria Sans", sans-serif',
  fontWeight: 400,
  lineHeight: "22px",
});

const RegisterCard = styled(Paper)({
  background: "#fafafa",
  borderRadius: "18px",
  padding: "38px 40px",
  maxWidth: "640px",
  margin: "0 auto",
  boxShadow: "none",
  minHeight: "560px",
});

const RegisterField = styled(TextField)({
  width: "100%",
  marginBottom: "12px",

  "& .MuiOutlinedInput-root": {
    height: "44px",
    borderRadius: "8px",
    background: "#ffffff",

    "& fieldset": {
      borderColor: "#dfe4ea",
    },

    "&:hover fieldset": {
      borderColor: "#dfe4ea",
    },

    "&.Mui-focused fieldset": {
      borderColor: "#148aa0",
    },
  },

  "& .MuiInputBase-input": {
    height: "44px",
    padding: "0 16px",
    fontSize: "14px",
    boxSizing: "border-box",
  },

  "& .MuiSelect-select": {
    padding: "0 16px !important",
    height: "44px !important",
    lineHeight: "44px !important",
    display: "flex",
    alignItems: "center",
  },

  "& .MuiInputLabel-root": {
    transform: "translate(14px, 10px) scale(1)",
    fontSize: "14px",
    "&.Mui-focused, &.MuiFormLabel-filled": {
      transform: "translate(14px, -8px) scale(0.75)",
    },
  },

  '& input[type="date"]': {
    color: "#222222",
    "&::-webkit-calendar-picker-indicator": {
      filter: "invert(0%)",
      padding: "4px",
      marginRight: "4px",
      cursor: "pointer",
    },
    "&::-webkit-datetime-edit": {
      padding: 0,
    },
    "&::-webkit-datetime-edit-fields-wrapper": {
      padding: 0,
    },
    "&::-webkit-datetime-edit-text": {
      padding: "0 2px",
    },
  },
});

const AddButton = styled(Button)({
  width: "160px",
  height: "40px",
  borderRadius: "5px",
  border: "1px solid #7A7A7A",
  color: "#7A7A7A",
  background: "#ffffff",
  textTransform: "none",
  marginTop: "18px",
  marginLeft: "auto",
  display: "block",
  boxShadow: "none",
  fontSize: "14px",
  fontFamily: '"Inter", sans-serif',
  "&:hover": {
    background: "#ffffff",
    borderColor: "#555",
  },
  "&:disabled": {
    opacity: 0.6,
    color: "#7A7A7A",
    borderColor: "#7A7A7A",
  },
});

const ValidateButton = styled(Button)({
  width: "160px",
  height: "40px",
  borderRadius: "5px",
  border: "none",
  color: "#ffffff",
  background: "#148aa0",
  textTransform: "none",
  marginTop: "18px",
  marginLeft: "auto",
  display: "block",
  boxShadow: "none",
  fontSize: "14px",
  fontFamily: '"Inter", sans-serif',
  "&:hover": {
    background: "#0b7890",
  },
  "&:disabled": {
    opacity: 0.6,
    background: "#a0c4cd",
  },
});

const StyledCheckbox = styled(Checkbox)({
  padding: "0 8px 0 0",
  "& .MuiSvgIcon-root": {
    fontSize: "14px",
    borderRadius: "2px",
  },
  "&.Mui-checked": {
    color: "#148aa0",
  },
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const [emailSent, setEmailSent] = useState(false);

  const [form, setForm] = useState({
    civilite: "",
    nom: "",
    prenom: "",
    dateNaissance: "",
    email: "",
    emailConfirmation: "",
    cin: "",
    telephone: "",
    adresse: "",
    ville: "",
    pays: "",
    motDePasse: "",
    confirmationMotDePasse: "",
    acceptTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [step1Errors, setStep1Errors] = useState({});

  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user || isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
    if (step1Errors[name]) setStep1Errors({ ...step1Errors, [name]: "" });
    setError("");
  };

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 16) {
      errors.push("16 caractères minimum");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("une majuscule (A-Z)");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("une minuscule (a-z)");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("un chiffre (0-9)");
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push("un caractère spécial (!@#$%^&* etc.)");
    }
    return errors;
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!form.civilite) newErrors.civilite = "La civilité est obligatoire";
    if (!form.nom) newErrors.nom = "Le nom est obligatoire";
    if (!form.prenom) newErrors.prenom = "Le prénom est obligatoire";
    if (!form.dateNaissance)
      newErrors.dateNaissance = "La date de naissance est obligatoire";
    if (!form.email) newErrors.email = "L'email est obligatoire";
    if (!form.emailConfirmation) {
      newErrors.emailConfirmation = "La confirmation de l'email est obligatoire";
    } else if (form.email !== form.emailConfirmation) {
      newErrors.emailConfirmation = "Les emails ne correspondent pas";
    }
    if (!form.cin) newErrors.cin = "Le CIN est obligatoire";
    if (!form.telephone) newErrors.telephone = "Le téléphone est obligatoire";
    if (!form.adresse) newErrors.adresse = "L'adresse est obligatoire";
    if (!form.ville) newErrors.ville = "La ville est obligatoire";
    if (!form.pays) newErrors.pays = "Le pays est obligatoire";
    if (!form.acceptTerms)
      newErrors.acceptTerms = "Vous devez accepter les conditions";

    setStep1Errors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!form.motDePasse) {
      newErrors.motDePasse = "Le mot de passe est obligatoire";
    } else {
      const passwordErrors = validatePassword(form.motDePasse);
      if (passwordErrors.length > 0) {
        newErrors.motDePasse = `Le mot de passe doit contenir : ${passwordErrors.join(", ")}`;
      }
    }
    
    if (form.motDePasse !== form.confirmationMotDePasse) {
      newErrors.confirmationMotDePasse = "Les mots de passe ne correspondent pas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ============================================
  // ✅ HANDLE SUBMIT CORRIGÉ
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setLoading(true);
    setError("");

    try {
      // ✅ Garder emailConfirmation (requis par Joi)
      // ✅ Supprimer seulement confirmationMotDePasse (non utilisé par le backend)
      const { confirmationMotDePasse, ...dataToSend } = form;

      // ✅ Log des données envoyées pour debug
      console.log("📤 Données envoyées au backend:", dataToSend);

      const response = await authService.register({
        ...dataToSend,
        motDePasse: form.motDePasse,
      });
      
      console.log("✅ Réponse du backend:", response);
      
      setEmailSent(true);
      setSuccess(true);

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      console.error("🔴 Erreur inscription:", err);
      
      // ✅ Afficher les détails de l'erreur
      if (err.response?.data) {
        console.error("📋 Détails de l'erreur:", err.response.data);
        if (err.response.data.errors) {
          console.error("📋 Erreurs de validation:", err.response.data.errors);
        }
      }
      
      const errorMsg = err.response?.data?.message || "Erreur d'inscription";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ========================================== //
  // AFFICHAGE SUCCÈS
  // ========================================== //

  if (success) {
    return (
      <Box sx={{ width: "100%", px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
        <RegisterCard>
          <Typography
            variant="h5"
            sx={{
              textAlign: "center",
              color: "#148aa0",
              mb: 2,
              fontFamily: '"Inter", sans-serif',
            }}
          >
            Inscription réussie !
          </Typography>
          {emailSent && (
            <Alert severity="info" sx={{ mb: 2, borderRadius: "8px" }}>
              Un email de validation a été envoyé à <strong>{form.email}</strong>.
              Veuillez vérifier votre boîte mail pour activer votre compte.
            </Alert>
          )}
          <Typography
            variant="body1"
            sx={{ textAlign: "center", fontFamily: '"Inter", sans-serif' }}
          >
            Vous allez être redirigé vers la page de connexion.
          </Typography>
        </RegisterCard>
      </Box>
    );
  }

  // ========================================== //
  // AFFICHAGE PRINCIPAL
  // ========================================== //

  return (
    <Box sx={{ width: "100%", px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
      <PageTitle>Inscription</PageTitle>
      <TitleLine />
      <RegisterNote>
        {step === 1 
          ? "Remplissez vos informations personnelles" 
          : "Créez votre mot de passe sécurisé"}
      </RegisterNote>

      <RegisterCard>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: "8px" }}>
            {error}
          </Alert>
        )}

        <form onSubmit={step === 1 ? handleNextStep : handleSubmit}>
          
          {/* ========================================== */}
          {/* ÉTAPE 1 : INFORMATIONS PERSONNELLES + CONDITIONS */}
          {/* ========================================== */}
          
          {step === 1 && (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <RegisterField
                    select
                    label="* Civilité"
                    name="civilite"
                    value={form.civilite}
                    onChange={handleChange}
                    error={!!step1Errors.civilite}
                    helperText={step1Errors.civilite}
                    disabled={loading}
                  >
                    <MenuItem value="">* Civilité</MenuItem>
                    <MenuItem value="Mme">Mme</MenuItem>
                    <MenuItem value="Mr">Mr</MenuItem>
                  </RegisterField>
                </Grid>
                <Grid item xs={12} sm={9}>
                  <RegisterField
                    label="* Nom"
                    name="nom"
                    value={form.nom}
                    onChange={handleChange}
                    error={!!step1Errors.nom}
                    helperText={step1Errors.nom}
                    disabled={loading}
                  />
                </Grid>
              </Grid>

              <RegisterField
                label="* Prénom"
                name="prenom"
                value={form.prenom}
                onChange={handleChange}
                error={!!step1Errors.prenom}
                helperText={step1Errors.prenom}
                disabled={loading}
              />

              <RegisterField
                type="date"
                name="dateNaissance"
                value={form.dateNaissance}
                onChange={handleChange}
                InputLabelProps={{ shrink: false }}
                inputProps={{ placeholder: "jj/mm/aaaa" }}
                error={!!step1Errors.dateNaissance}
                helperText={step1Errors.dateNaissance}
                disabled={loading}
              />

              <RegisterField
                label="* Email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                error={!!step1Errors.email}
                helperText={step1Errors.email}
                disabled={loading}
              />

              <RegisterField
                label="* Email vérification"
                type="email"
                name="emailConfirmation"
                value={form.emailConfirmation}
                onChange={handleChange}
                error={!!step1Errors.emailConfirmation}
                helperText={step1Errors.emailConfirmation}
                disabled={loading}
              />

              <RegisterField
                label="* CIN"
                name="cin"
                value={form.cin}
                onChange={handleChange}
                error={!!step1Errors.cin}
                helperText={step1Errors.cin}
                disabled={loading}
              />

              <RegisterField
                label="* Téléphone"
                name="telephone"
                value={form.telephone}
                onChange={handleChange}
                error={!!step1Errors.telephone}
                helperText={step1Errors.telephone}
                disabled={loading}
              />

              <RegisterField
                label="* Adresse"
                name="adresse"
                value={form.adresse}
                onChange={handleChange}
                error={!!step1Errors.adresse}
                helperText={step1Errors.adresse}
                disabled={loading}
              />

              <RegisterField
                label="* Ville"
                name="ville"
                value={form.ville}
                onChange={handleChange}
                error={!!step1Errors.ville}
                helperText={step1Errors.ville}
                disabled={loading}
              />

              <RegisterField
                label="* Pays"
                name="pays"
                value={form.pays}
                onChange={handleChange}
                error={!!step1Errors.pays}
                helperText={step1Errors.pays}
                disabled={loading}
              />

              {/* ✅ Acceptation des conditions - Étape 1 */}
              <Box sx={{ mt: 3, display: "flex", alignItems: "flex-start" }}>
                <StyledCheckbox
                  name="acceptTerms"
                  checked={form.acceptTerms}
                  onChange={handleChange}
                  disabled={loading}
                  sx={{ mt: 0.5 }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "14px",
                    color: "#000000",
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: 400,
                    lineHeight: 1.5,
                    ml: 0.5,
                  }}
                >
                  En cochant cette case, vous acceptez nos{" "}
                  <Link
                    href="/terms"
                    sx={{
                      color: "#0000EE",
                      textDecoration: "underline",
                      fontSize: "14px",
                      fontFamily: '"Inter", sans-serif',
                      fontWeight: 400,
                      "&:hover": { color: "#0000EE" },
                    }}
                  >
                    Termes et Conditions
                  </Link>{" "}
                  du service.
                </Typography>
              </Box>
              {step1Errors.acceptTerms && (
                <Typography
                  color="error"
                  variant="caption"
                  display="block"
                  sx={{ mt: 0.5, ml: 4, fontFamily: '"Inter", sans-serif' }}
                >
                  {step1Errors.acceptTerms}
                </Typography>
              )}

              <AddButton type="submit" disabled={loading}>
                {loading ? <CircularProgress size={18} color="inherit" /> : "Ajouter"}
              </AddButton>
            </>
          )}

          {/* ========================================== */}
          {/* ÉTAPE 2 : MOT DE PASSE */}
          {/* ========================================== */}
          
          {step === 2 && (
            <>
              <RegisterField
                label="* Mot de passe"
                type="password"
                name="motDePasse"
                value={form.motDePasse}
                onChange={handleChange}
                error={!!errors.motDePasse}
                helperText={errors.motDePasse}
                disabled={loading}
                fullWidth
              />

              <RegisterField
                label="* Confirmation mot de passe"
                type="password"
                name="confirmationMotDePasse"
                value={form.confirmationMotDePasse}
                onChange={handleChange}
                error={!!errors.confirmationMotDePasse}
                helperText={errors.confirmationMotDePasse}
                disabled={loading}
                fullWidth
              />

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
                <Button
                  onClick={handleBack}
                  disabled={loading}
                  sx={{
                    textTransform: "none",
                    color: "#7A7A7A",
                    fontFamily: '"Inter", sans-serif',
                  }}
                >
                  Retour
                </Button>
                <ValidateButton type="submit" disabled={loading}>
                  {loading ? <CircularProgress size={18} color="inherit" /> : "Valider"}
                </ValidateButton>
              </Box>
            </>
          )}
          
        </form>
      </RegisterCard>
    </Box>
  );
};

export default Register;